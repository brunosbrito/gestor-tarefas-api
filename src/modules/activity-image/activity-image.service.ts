import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityImage } from './entities/activity-image.entity';
import { CreateActivityImageDto } from './dto/create-activity-image.dto';
import { HttpService } from '@nestjs/axios';
import { User } from 'src/modules/user/entities/user.entity';
import { firstValueFrom } from 'rxjs';
import { Activity } from '../activities/entities/activities.entity';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class ActivityImageService {
  constructor(
    @InjectRepository(ActivityImage)
    private readonly activityImageRepository: Repository<ActivityImage>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>, // Injeção do repositório User
    private readonly httpService: HttpService,
    @InjectRepository(Activity)
    private readonly activityRepository: Repository<Activity>,
  ) {}

  async create(
    createActivityImageDto: CreateActivityImageDto,
  ): Promise<ActivityImage> {
    const createdByUser = await this.userRepository.findOne({
      where: { id: createActivityImageDto.createdById },
    });

    if (!createdByUser) {
      throw new Error('Usuário não encontrado.');
    }

    const savedImageWithActivity = await this.activityRepository.findOne({
      where: { id: createActivityImageDto.activityId },
      relations: ['serviceOrder', 'project', 'process'],
    });

    const newImage = this.activityImageRepository.create({
      ...createActivityImageDto,
      createdBy: createdByUser,
      activity: savedImageWithActivity,
    });

    const savedImage = await this.activityImageRepository.save(newImage);

    const message = `Atividade ${createActivityImageDto.activityId} | OS: ${savedImageWithActivity.serviceOrder.serviceOrderNumber}\nDescrição: ${savedImage.description} `;
    const senderName = createdByUser.username;
    const imageUrl = savedImage.imagePath;

    const chatMap = new Map<number, string>([
      [1, '-1002696659970'],
      [19, '-1002696659970'],
      [4, '-1002673887037'],
    ]);

    const chatId =
      chatMap.get(savedImageWithActivity.process.id) ||
      savedImageWithActivity.project.groupNumber;

    await this.sendTelegramMessageWithImage(
      message,
      chatId,
      imageUrl,
      senderName,
    );

    return savedImage;
  }

  private async sendTelegramMessageWithImage(
    message: string,
    chat_id: string,
    imagePath: string,
    senderName: string,
  ) {
    const telegramBotToken = '6355918410:AAHoYDbxazgOA7scKgH5dN-x6nVb_qk84kY';
    const telegramUrl = `https://api.telegram.org/bot${telegramBotToken}/sendPhoto`;

    const formData = new FormData();
    formData.append('chat_id', chat_id);
    formData.append('caption', `${message}\nEnviado por: ${senderName}`);

    const imageFilePath = path.join(__dirname, '..', '..', '..', imagePath);

    try {
      // Verifique se o arquivo existe antes de tentar lê-lo
      if (!fs.existsSync(imageFilePath)) {
        console.error('Arquivo não encontrado:', imageFilePath);
        throw new Error('Arquivo de imagem não encontrado.');
      }

      const imageBuffer = await fs.promises.readFile(imageFilePath);
      const imageBlob = new Blob([imageBuffer]);

      formData.append('photo', imageBlob);

      const response = await firstValueFrom(
        this.httpService.post(telegramUrl, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        }),
      );

      return response.data;
    } catch (error) {
      console.error('Erro ao enviar imagem para o Telegram:', error);
      throw new Error('Falha no envio da imagem.');
    }
  }
}

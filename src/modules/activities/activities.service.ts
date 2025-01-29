import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { Activity } from './entities/activities.entity';
import { Collaborator } from '../collaborator/entities/collaborator.entity';
import { Project } from '../work/entities/project.entity';
import { ServiceOrder } from '../service_order/entities/service_order.entity';
import { ActivityHistory } from '../activity-history/entities/activity-history.entity';
import { User } from '../user/entities/user.entity';
import { WorkedHours } from '../worked-hours/entities/worked-hours.entity';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import * as dayjs from 'dayjs';

@Injectable()
export class ActivitiesService {
  constructor(
    @InjectRepository(Activity)
    private readonly activityRepository: Repository<Activity>,
    @InjectRepository(Collaborator)
    private readonly collaboratorRepository: Repository<Collaborator>,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    @InjectRepository(ServiceOrder)
    private readonly serviceOrderRepository: Repository<ServiceOrder>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(ActivityHistory)
    private readonly activityHistoryRepository: Repository<ActivityHistory>,
    @InjectRepository(WorkedHours)
    private readonly workedHoursRepository: Repository<WorkedHours>,
    private readonly httpService: HttpService,
  ) {}

  private readonly telegramBotToken =
    '6355918410:AAHoYDbxazgOA7scKgH5dN-x6nVb_qk84kY';

  async create(createActivityDto: CreateActivityDto): Promise<Activity> {
    const {
      createdBy,
      collaborators,
      projectId,
      orderServiceId,
      ...activityData
    } = createActivityDto;

    // Obter os colaboradores, projeto e ordem de serviço
    const getCollaborators = await this.getCollaborators(collaborators);
    const project = await this.getProject(projectId);
    const orderService = await this.getOrderService(orderServiceId);
    const user = await this.getUser(Number(createdBy));

    // Lógica para calcular ou obter o cod_sequencial baseado no projeto e ordem de serviço
    const codSequencial = await this.calculateCodSequencial(
      project,
      orderService,
    );

    // Criar a atividade com o cod_sequencial
    const activity = this.activityRepository.create({
      ...activityData,
      project,
      serviceOrder: orderService,
      createdBy: user,
      collaborators: getCollaborators,
      cod_sequencial: codSequencial, // Adicionar o cod_sequencial
    });

    // Salvar a atividade
    const savedActivity = await this.activityRepository.save(activity);

    await this.recordActivityHistory(
      savedActivity,
      'Criada',
      'Atividade criada',
      user,
    );

    const message = `
🆕 **Nova Atividade Criada Nº ${activity.cod_sequencial}**

**O.S:** ${orderService.serviceOrderNumber} 
**Nº Projeto:** ${orderService.projectNumber} 
**Qtd:** ${activity.quantity}  
**Tarefa Macro:** ${activity.macroTask} 
**Processo:**  ${activity.process} 
**Atividade:**  ${activity.description}
**Equipe:** ${getCollaborators.map((collaborator) => collaborator.name).join(', ')} 
**Data Criação:** ${dayjs(activity.createdAt).format('DD/MM/YYYY HH:mm')}
**Tempo Previsto:** ${activity.estimatedTime}
**Obs:** ${activity.observation}
**Criado por:** ${user.username}
    `;

    this.sendTelegramMessage(message, project.groupNumber);
    return savedActivity;
  }

  private async getCollaborators(
    collaborators: number[],
  ): Promise<Collaborator[]> {
    if (!collaborators || collaborators.length === 0) {
      return [];
    }

    const getCollaborators = await this.collaboratorRepository.find({
      where: { id: In(collaborators) },
    });

    if (getCollaborators.length !== collaborators.length) {
      throw new NotFoundException('Some collaborators not found');
    }

    return getCollaborators;
  }

  private async getProject(projectId: number): Promise<Project> {
    const project = await this.projectRepository.findOne({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project;
  }

  private async getOrderService(orderServiceId: number): Promise<ServiceOrder> {
    const orderService = await this.serviceOrderRepository.findOne({
      where: { id: orderServiceId },
    });

    if (!orderService) {
      throw new NotFoundException('Order service not found');
    }

    return orderService;
  }

  private async getUser(createdBy: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: createdBy },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  findAll(): Promise<Activity[]> {
    return this.activityRepository.find({ relations: ['collaborators'] });
  }

  async findOne(id: number): Promise<Activity> {
    const activity = await this.activityRepository.findOne({
      where: { id },
      relations: ['collaborators', 'project', 'serviceOrder', 'createdBy'],
    });

    if (!activity) {
      throw new NotFoundException(`Activity with ID ${id} not found`);
    }

    return activity;
  }

  async update(
    id: number,
    updateActivityDto: UpdateActivityDto,
  ): Promise<Activity> {
    const activity = await this.findOne(id);

    if (updateActivityDto.collaborators) {
      const collaborators = await this.collaboratorRepository.find({
        where: { id: In(updateActivityDto.collaborators) },
      });

      if (collaborators.length !== updateActivityDto.collaborators.length) {
        throw new NotFoundException('Some collaborators not found');
      }

      activity.collaborators = collaborators;
    }

    // Verifica se a atividade foi pausada
    if (updateActivityDto.status === 'Paralizadas') {
      const timePaused = this.calculateTimeDifference(
        activity.startDate,
        updateActivityDto.pauseDate,
      );
      activity.totalTime = (activity.totalTime || 0) + timePaused;
    }

    if (
      updateActivityDto.status === 'Em execução' &&
      activity.status === 'Paralizadas'
    ) {
      activity.startDate = new Date(); // Atualiza o startDate para o momento da retomada
    }

    if (
      updateActivityDto.status === 'Em execução' &&
      !activity.originalStartDate
    ) {
      activity.originalStartDate = activity.startDate; // Registra o momento da primeira execução
    }

    // Verifica se o status foi alterado para 'Concluídas'
    if (updateActivityDto.status === 'Concluídas') {
      let finalExecutionTime = 0;
      await this.saveWorkedHours(activity.id, updateActivityDto);
      // Se a atividade foi pausada, soma o tempo da última execução
      if (activity.startDate && updateActivityDto.endDate) {
        finalExecutionTime = this.calculateTimeDifference(
          activity.startDate,
          updateActivityDto.endDate,
        );
      }

      // Se não houver pausa, soma diretamente do startDate até endDate
      if (activity.startDate && !activity.pauseDate) {
        finalExecutionTime = this.calculateTimeDifference(
          activity.startDate,
          updateActivityDto.endDate,
        );
      }

      activity.totalTime = (activity.totalTime || 0) + finalExecutionTime;
    }

    // Atribui os dados de atualização ao objeto de atividade
    Object.assign(activity, updateActivityDto);

    // Atualiza a atividade no banco de dados
    const updatedActivity = await this.activityRepository.save(activity);

    // Registra o histórico da atividade
    const user = await this.getUser(updateActivityDto.changedBy);
    const status = (activity.status = (() => {
      switch (activity.status) {
        case 'Paralizadas':
          return `Atividade paralisada: ${updateActivityDto.reason} | Realizado até o momento: ${updateActivityDto.realizationDescription}`;

        case 'Concluídas':
          return `Atividade concluída: | ${updateActivityDto.realizationDescription}`;

        default:
          return activity.status;
      }
    })());
    await this.recordActivityHistory(
      updatedActivity,
      'Atualizada',
      status,
      user,
    );

    const totalTime = updatedActivity.totalTime;
    const hours = Math.floor(totalTime); // Hora inteira
    const minutes = Math.round((totalTime - hours) * 60); // Minutos
    const formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    const estimatedTimeInDecimal = this.convertToDecimalHours(
      updatedActivity.estimatedTime,
    );
    const percentageWorked = (totalTime / estimatedTimeInDecimal) * 100;

    let message = '';

    if (updatedActivity.status === 'Em execução') {
      message = `
  ⚡ **Atividade Nº ${activity.cod_sequencial} Iniciada **
  
  **O.S:** ${activity.serviceOrder.serviceOrderNumber}
  **Nº Projeto:** ${activity.serviceOrder.projectNumber}
  **Qtd:** ${updatedActivity.quantity}
  **Tarefa Macro:** ${updatedActivity.macroTask}
  **Processo:**  ${updatedActivity.process}
  **Atividade:**  ${updatedActivity.description}
  **Equipe:** ${updatedActivity.collaborators.map((collaborator) => collaborator.name).join(', ')}
  **Data de inicio:** ${dayjs(updatedActivity.originalStartDate).format('DD/MM/YYYY HH:mm')}
  **Tempo Previsto:** ${updatedActivity.estimatedTime}
  **Obs:** ${updatedActivity.observation}
  **Iniciado por:** ${user.username}
      `;
    } else if (updatedActivity.status === 'Paralizadas') {
      message = `
  ⏸️ **Atividade Pausada Nº ${activity.cod_sequencial}**
  
  **O.S:** ${activity.serviceOrder.serviceOrderNumber}
  **Nº Projeto:** ${activity.serviceOrder.projectNumber}
  **Qtd:** ${updatedActivity.quantity}
  **Tarefa Macro:** ${updatedActivity.macroTask}
  **Processo:**  ${updatedActivity.process}
  **Atividade:**  ${updatedActivity.description}
  **Equipe:** ${updatedActivity.collaborators.map((collaborator) => collaborator.name).join(', ')}
  **Data Pause:** ${dayjs(updatedActivity.pauseDate).format('DD/MM/YYYY HH:mm')}
  **Tempo Previsto:** ${updatedActivity.estimatedTime}
  **Tempo Trabalhado:** ${formattedTime} ${Math.round(percentageWorked)}%
  **Obs:** ${updatedActivity.observation}
  **Alterado por:** ${user.username}
      `;
    } else if (updatedActivity.status === 'Concluídas') {
      message = `
  ✅ **Atividade Concluída Nº ${activity.cod_sequencial}**
  
  **O.S:** ${activity.serviceOrder.serviceOrderNumber}
  **Nº Projeto:** ${activity.serviceOrder.projectNumber}
  **Qtd:** ${updatedActivity.quantity}
  **Tarefa Macro:** ${updatedActivity.macroTask}
  **Processo:**  ${updatedActivity.process}
  **Atividade:**  ${updatedActivity.description}
  **Equipe:** ${updatedActivity.collaborators.map((collaborator) => collaborator.name).join(', ')}
  **Data Conclusao:** ${dayjs(updatedActivity.endDate).format('DD/MM/YYYY HH:mm')}
  **Tempo Previsto:** ${updatedActivity.estimatedTime}
  **Tempo Trabalhado:** ${formattedTime} ${Math.round(percentageWorked)}%
  **Obs:** ${updatedActivity.observation}
  **Alterado por:** ${user.username}
      `;
    }

    this.sendTelegramMessage(message, updatedActivity.project.groupNumber);
    return updatedActivity;
  }

  async remove(id: number): Promise<void> {
    const activity = await this.findOne(id);
    await this.activityRepository.remove(activity);
  }

  async findByServiceOrder(serviceOrderId: number): Promise<Activity[]> {
    return this.activityRepository.find({
      where: { serviceOrder: { id: serviceOrderId } },
      relations: [
        'collaborators',
        'project',
        'serviceOrder',
        'createdBy',
        'images',
      ],
    });
  }

  async recordActivityHistory(
    activity: Activity,
    status: string,
    description: string,
    user: User,
  ): Promise<ActivityHistory> {
    const activityHistory = this.activityHistoryRepository.create({
      activity,
      status,
      description,
      changedBy: user,
    });

    return this.activityHistoryRepository.save(activityHistory);
  }

  async saveWorkedHours(
    activityId: number,
    updateActivityDto: UpdateActivityDto,
  ): Promise<WorkedHours[]> {
    const activity = await this.activityRepository.findOne({
      where: { id: activityId },
    });
    console.log(updateActivityDto);
    if (!activity) {
      throw new NotFoundException('Activity not found');
    }

    const collaborators = await this.collaboratorRepository.find({
      where: { id: In(updateActivityDto.workedHours.map((user) => user.id)) },
    });

    if (collaborators.length !== updateActivityDto.workedHours.length) {
      throw new NotFoundException('Some collaborators not found');
    }
    const workedHoursRecords = updateActivityDto.workedHours.map((user) => {
      const workedHours = new WorkedHours();
      workedHours.atividade = activity;
      workedHours.colaborador = collaborators.find(
        (collaborator) => collaborator.id === user.id,
      );
      workedHours.hoursWorked = user.hours;
      workedHours.date = new Date().toISOString().split('T')[0];
      return workedHours;
    });
    return await this.workedHoursRepository.save(workedHoursRecords);
  }

  private calculateTimeDifference(startDate: Date, endDate: Date): number {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const diffInMs = end - start;
    const diffInHours = diffInMs / (1000 * 60 * 60);
    return diffInHours;
  }

  private async sendTelegramMessage(message: string, chat_id: string) {
    const telegramUrl = `https://api.telegram.org/bot${this.telegramBotToken}/sendMessage`;

    const payload = {
      chat_id: chat_id,
      text: message,
      parse_mode: 'Markdown',
    };

    try {
      const response = await firstValueFrom(
        this.httpService.post(telegramUrl, payload),
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao enviar mensagem para o Telegram:', error);
      throw new Error('Falha no envio da mensagem.');
    }
  }

  private convertToDecimalHours(time: string): number {
    const [hours, minutes] = time.split('h');
    const minutesDecimal = parseInt(minutes.replace('min', '').trim()) / 60;
    return parseInt(hours.trim()) + minutesDecimal;
  }

  async calculateCodSequencial(
    project: Project,
    orderService: ServiceOrder,
  ): Promise<number> {
    // A lógica de como calcular o cod_sequencial vai aqui.
    // Pode ser baseado em dados do projeto ou da ordem de serviço.
    // Por exemplo:
    const lastActivity = await this.activityRepository
      .createQueryBuilder('activity')
      .where(
        'activity.projectId = :projectId AND activity.serviceOrderId = :orderServiceId',
        {
          projectId: project.id,
          orderServiceId: orderService.id,
        },
      )
      .orderBy('activity.cod_sequencial', 'DESC')
      .getOne();

    // Caso haja atividades anteriores, incrementar o cod_sequencial.
    if (lastActivity) {
      return lastActivity.cod_sequencial + 1;
    } else {
      // Caso não haja atividades, iniciar com 1.
      return 1;
    }
  }
}

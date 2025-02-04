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
import * as utc from 'dayjs/plugin/utc';
import * as timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

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

  async create(createActivityDto: CreateActivityDto): Promise<Activity> {
    const {
      createdBy,
      collaborators,
      projectId,
      orderServiceId,
      ...activityData
    } = createActivityDto;

    const [getCollaborators, project, orderService, user] = await Promise.all([
      this.getCollaborators(collaborators),
      this.getProject(projectId),
      this.getOrderService(orderServiceId),
      this.getUser(Number(createdBy)),
    ]);

    const codSequencial = await this.calculateCodSequencial(
      project,
      orderService,
    );

    const activity = this.activityRepository.create({
      ...activityData,
      project,
      serviceOrder: orderService,
      createdBy: user,
      collaborators: getCollaborators,
      cod_sequencial: codSequencial,
      originalStartDate: activityData.startDate,
    });

    const savedActivity = await this.activityRepository.save(activity);

    await this.recordActivityHistory(
      savedActivity,
      'Criada',
      'Atividade criada',
      user,
    );

    const message = this.generateTelegramMessage(
      savedActivity,
      orderService,
      getCollaborators,
      user,
    );
    this.sendTelegramMessage(message, project.groupNumber);

    return savedActivity;
  }

  async findAll(): Promise<Activity[]> {
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

    // Atualizar os colaboradores se existirem no DTO
    if (updateActivityDto.collaborators) {
      activity.collaborators = await this.getCollaborators(
        updateActivityDto.collaborators,
      );
    }

    // Atualizar o status da atividade se necessário
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
      activity.startDate = new Date();
    }

    if (
      updateActivityDto.status === 'Em execução' &&
      !activity.originalStartDate
    ) {
      activity.originalStartDate = activity.startDate;
    }

    if (updateActivityDto.status === 'Concluídas') {
      let finalExecutionTime = 0;
      if (activity.startDate && updateActivityDto.endDate) {
        finalExecutionTime = this.calculateTimeDifference(
          activity.startDate,
          updateActivityDto.endDate,
        );
      }
      this.saveWorkedHours(activity.id, updateActivityDto);
      activity.totalTime = (activity.totalTime || 0) + finalExecutionTime;
    }

    // Atualizar as propriedades manualmente
    if (updateActivityDto.status) activity.status = updateActivityDto.status;
    if (updateActivityDto.description)
      activity.description = updateActivityDto.description;
    if (updateActivityDto.macroTask)
      activity.macroTask = updateActivityDto.macroTask;
    if (updateActivityDto.process) activity.process = updateActivityDto.process;
    if (updateActivityDto.startDate)
      activity.startDate = updateActivityDto.startDate;
    if (updateActivityDto.endDate) activity.endDate = updateActivityDto.endDate;
    if (updateActivityDto.pauseDate)
      activity.pauseDate = updateActivityDto.pauseDate;
    if (updateActivityDto.originalStartDate)
      activity.originalStartDate = updateActivityDto.originalStartDate;
    if (updateActivityDto.totalTime)
      activity.totalTime = updateActivityDto.totalTime;

    // Atualizar colaboradores, se necessário
    if (updateActivityDto.collaborators) {
      activity.collaborators = await this.getCollaborators(
        updateActivityDto.collaborators,
      );
    }

    const updatedActivity = await this.activityRepository.save(activity);

    // Registrar o histórico de atualização
    const user = await this.getUser(updateActivityDto.changedBy);
    const status = this.generateActivityStatusMessage(
      activity,
      updateActivityDto,
    );
    await this.recordActivityHistory(
      updatedActivity,
      'Atualizada',
      status,
      user,
    );

    // Enviar mensagem de atualização via Telegram
    const message = this.generateTelegramUpdateMessage(updatedActivity, user);
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

  private async getCollaborators(
    collaborators: number[],
  ): Promise<Collaborator[]> {
    if (!collaborators || collaborators.length === 0) return [];

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
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  private async getOrderService(orderServiceId: number): Promise<ServiceOrder> {
    const orderService = await this.serviceOrderRepository.findOne({
      where: { id: orderServiceId },
    });
    if (!orderService) throw new NotFoundException('Order service not found');
    return orderService;
  }

  private async getUser(userId: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  private async recordActivityHistory(
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

  private async saveWorkedHours(
    activityId: number,
    updateActivityDto: UpdateActivityDto,
  ): Promise<WorkedHours[]> {
    const activity = await this.activityRepository.findOne({
      where: { id: activityId },
    });
    if (!activity) throw new NotFoundException('Activity not found');

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
    return (end - start) / (1000 * 60 * 60);
  }

  private async sendTelegramMessage(message: string, chatId: string) {
    const telegramUrl = `https://api.telegram.org/bot6355918410:AAHoYDbxazgOA7scKgH5dN-x6nVb_qk84kY/sendMessage`;
    const payload = { chat_id: chatId, text: message, parse_mode: 'Markdown' };

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

  private async calculateCodSequencial(
    project: Project,
    orderService: ServiceOrder,
  ): Promise<number> {
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

    return lastActivity ? lastActivity.cod_sequencial + 1 : 1;
  }

  private generateTelegramMessage(
    activity: Activity,
    orderService: ServiceOrder,
    collaborators: Collaborator[],
    user: User,
  ): string {
    return `
🆕 **Nova Atividade Criada Nº ${activity.cod_sequencial}**

**O.S:** ${orderService.serviceOrderNumber} 
**Nº Projeto:** ${orderService.projectNumber} 
**Qtd:** ${activity.quantity}  
**Tarefa Macro:** ${activity.macroTask} 
**Processo:**  ${activity.process} 
**Atividade:**  ${activity.description}
**Equipe:** ${collaborators.map((collaborator) => collaborator.name).join(', ')} 
**Data Criação:** ${dayjs(activity.createdAt).tz('America/Sao_Paulo').format('DD/MM/YYYY HH:mm')}
**Tempo Previsto:** ${activity.estimatedTime}
**Obs:** ${activity.observation}
**Criado por:** ${user.username}
    `;
  }

  private generateActivityStatusMessage(
    activity: Activity,
    updateActivityDto: UpdateActivityDto,
  ): string {
    switch (activity.status) {
      case 'Paralizadas':
        return `Atividade paralisada: ${updateActivityDto.reason} | Realizado até o momento: ${updateActivityDto.realizationDescription}`;
      case 'Concluídas':
        return `Atividade concluída: | ${updateActivityDto.realizationDescription}`;
      default:
        return activity.status;
    }
  }

  private generateTelegramUpdateMessage(
    activity: Activity,
    user: User,
  ): string {
    const totalTime = activity.totalTime;
    const hours = Math.floor(totalTime);
    const minutes = Math.round((totalTime - hours) * 60);
    const formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    const estimatedTimeInDecimal = this.convertToDecimalHours(
      activity.estimatedTime,
    );
    const percentageWorked = (totalTime / estimatedTimeInDecimal) * 100;

    if (activity.status === 'Em execução') {
      return `
⚡ **Atividade Nº ${activity.cod_sequencial} Iniciada **

**O.S:** ${activity.serviceOrder.serviceOrderNumber}
**Nº Projeto:** ${activity.serviceOrder.projectNumber}
**Qtd:** ${activity.quantity}
**Tarefa Macro:** ${activity.macroTask}
**Processo:**  ${activity.process}
**Atividade:**  ${activity.description}
**Equipe:** ${activity.collaborators.map((collaborator) => collaborator.name).join(', ')}
**Data de inicio:** ${dayjs(activity.startDate).tz('America/Sao_Paulo').format('DD/MM/YYYY HH:mm')}
**Tempo Previsto:** ${activity.estimatedTime}
**Obs:** ${activity.observation}
**Iniciado por:** ${user.username}
      `;
    } else if (activity.status === 'Paralizadas') {
      return `
⏸️ **Atividade Pausada Nº ${activity.cod_sequencial}**

**O.S:** ${activity.serviceOrder.serviceOrderNumber}
**Nº Projeto:** ${activity.serviceOrder.projectNumber}
**Qtd:** ${activity.quantity}
**Tarefa Macro:** ${activity.macroTask}
**Processo:**  ${activity.process}
**Atividade:**  ${activity.description}
**Equipe:** ${activity.collaborators.map((collaborator) => collaborator.name).join(', ')}
**Data Pause:** ${dayjs(activity.pauseDate).tz('America/Sao_Paulo').format('DD/MM/YYYY HH:mm')}
**Tempo Previsto:** ${activity.estimatedTime}
**Tempo Trabalhado:** ${formattedTime} ${Math.round(percentageWorked)}%
**Obs:** ${activity.observation}
**Alterado por:** ${user.username}
      `;
    } else if (activity.status === 'Concluídas') {
      return `
✅ **Atividade Concluída Nº ${activity.cod_sequencial}**

**O.S:** ${activity.serviceOrder.serviceOrderNumber}
**Nº Projeto:** ${activity.serviceOrder.projectNumber}
**Qtd:** ${activity.quantity}
**Tarefa Macro:** ${activity.macroTask}
**Processo:**  ${activity.process}
**Atividade:**  ${activity.description}
**Equipe:** ${activity.collaborators.map((collaborator) => collaborator.name).join(', ')}
**Data Conclusao:** ${dayjs(activity.endDate).tz('America/Sao_Paulo').format('DD/MM/YYYY HH:mm')}
**Tempo Previsto:** ${activity.estimatedTime}
**Tempo Trabalhado:** ${formattedTime} ${Math.round(percentageWorked)}%
**Obs:** ${activity.observation}
**Alterado por:** ${user.username}
      `;
    }

    return `🔄 **Atividade Atualizada Nº ${activity.cod_sequencial}**
**O.S:** ${activity.serviceOrder.serviceOrderNumber} 
**Nº Projeto:** ${activity.serviceOrder.projectNumber} 
**Qtd:** ${activity.quantity}  
**Tarefa Macro:** ${activity.macroTask} 
**Processo:**  ${activity.process} 
**Atividade:**  ${activity.description}
**Equipe:** ${activity.collaborators.map((collaborator) => collaborator.name).join(', ')} 
**Data Criação:** ${dayjs(activity.createdAt).tz('America/Sao_Paulo').format('DD/MM/YYYY HH:mm')}
**Tempo Previsto:** ${activity.estimatedTime}
**Obs:** ${activity.observation}
**Criado por:** ${user.username}`;
  }
}

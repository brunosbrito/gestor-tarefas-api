import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ActivitiesService } from '../activities/activities.service';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(private readonly activitiesService: ActivitiesService) {}

  /**
   * Cron job que executa a cada hora para verificar e atualizar
   * atividades que deveriam ter iniciado mas ainda estão como "Planejadas"
   * Muda o status para "Atrasadas"
   */
  @Cron(CronExpression.EVERY_HOUR)
  async handleDelayedActivities(): Promise<void> {
    this.logger.log('Iniciando verificação de atividades atrasadas...');

    try {
      const updated = await this.activitiesService.updateDelayedActivitiesStatus();
      this.logger.log(`Verificação concluída. ${updated} atividades atualizadas para "Atrasadas".`);
    } catch (error) {
      this.logger.error('Erro ao atualizar atividades atrasadas:', error);
    }
  }

  /**
   * Execução manual para testes ou atualização sob demanda
   */
  async runManualUpdate(): Promise<number> {
    this.logger.log('Executando atualização manual de atividades atrasadas...');
    return this.activitiesService.updateDelayedActivitiesStatus();
  }
}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrcamentoTemplate } from './entities/orcamento-template.entity';
import { OrcamentoTemplatesController } from './orcamento-templates.controller';
import { OrcamentoTemplatesService } from './orcamento-templates.service';
import { OrcamentosModule } from '../orcamentos/orcamentos.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrcamentoTemplate]),
    OrcamentosModule,
  ],
  controllers: [OrcamentoTemplatesController],
  providers: [OrcamentoTemplatesService],
  exports: [OrcamentoTemplatesService],
})
export class OrcamentoTemplatesModule {}

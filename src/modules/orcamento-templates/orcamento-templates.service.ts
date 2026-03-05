import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  OrcamentoTemplate,
  TemplateCategoriaEnum,
  ItemTemplateData,
} from './entities/orcamento-template.entity';
import { CreateOrcamentoTemplateDto } from './dto/create-orcamento-template.dto';
import { UpdateOrcamentoTemplateDto } from './dto/update-orcamento-template.dto';
import { UsarTemplateDto } from './dto/usar-template.dto';
import { OrcamentosService } from '../orcamentos/orcamentos.service';

@Injectable()
export class OrcamentoTemplatesService {
  constructor(
    @InjectRepository(OrcamentoTemplate)
    private readonly templateRepository: Repository<OrcamentoTemplate>,
    private readonly orcamentosService: OrcamentosService,
  ) {}

  async create(
    dto: CreateOrcamentoTemplateDto,
    userId: number,
  ): Promise<OrcamentoTemplate> {
    const template = this.templateRepository.create({
      ...dto,
      createdBy: userId,
    });
    return this.templateRepository.save(template);
  }

  async findAll(
    categoria?: TemplateCategoriaEnum,
    ativo?: boolean,
  ): Promise<OrcamentoTemplate[]> {
    const where: any = {};
    if (categoria) where.categoria = categoria;
    if (ativo !== undefined) where.ativo = ativo;

    return this.templateRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<OrcamentoTemplate> {
    const template = await this.templateRepository.findOne({ where: { id } });
    if (!template) {
      throw new NotFoundException(`Template com ID ${id} não encontrado`);
    }
    return template;
  }

  async update(
    id: number,
    dto: UpdateOrcamentoTemplateDto,
  ): Promise<OrcamentoTemplate> {
    const template = await this.findOne(id);
    Object.assign(template, dto);
    return this.templateRepository.save(template);
  }

  async remove(id: number): Promise<void> {
    const template = await this.findOne(id);
    await this.templateRepository.remove(template);
  }

  /**
   * Cria um novo orçamento a partir de um template.
   * Usa as configurações, composições E itens definidos no template.
   */
  async usarTemplate(
    id: number,
    dto: UsarTemplateDto,
    userId: number,
  ) {
    const template = await this.findOne(id);

    // Criar orçamento base via OrcamentosService
    const orcamento = await this.orcamentosService.create(
      {
        nome: dto.nomeOrcamento,
        tipo: dto.tipo,
        clienteNome: dto.clienteNome,
        codigoProjeto: dto.codigoProjeto,
        areaTotalM2: dto.areaTotalM2,
        metrosLineares: dto.metrosLineares,
        pesoTotalProjeto: dto.pesoTotalProjeto,
        tributos: template.configuracoes?.tributos
          ? {
              temISS: template.configuracoes.tributos.iss > 0,
              aliquotaISS: template.configuracoes.tributos.iss * 100,
              aliquotaSimples: template.configuracoes.tributos.simples * 100,
            }
          : undefined,
      },
      userId,
    );

    // Atualizar configurações do orçamento com as do template
    if (template.configuracoes) {
      const lucroPercentual = (template.configuracoes.lucro || 0) * 100;
      const configUpdate: any = {
        configuracoes: {
          bdi: (template.configuracoes.bdi || 0) * 100,
          lucro: lucroPercentual,
          encargos: (template.configuracoes.encargos || 0) * 100,
        },
        configuracoesDetalhadas: {
          lucro: { percentual: lucroPercentual, habilitado: lucroPercentual > 0 },
        },
      };
      await this.orcamentosService.update(orcamento.id, configUpdate);
    }

    // Atualizar BDI de cada composição + inserir itens do template
    if (template.composicoesTemplate && template.composicoesTemplate.length > 0) {
      const orcamentoAtual = await this.orcamentosService.findOne(orcamento.id);

      const composicoesAtualizadas = orcamentoAtual.composicoes.map((comp) => {
        const templateComp = template.composicoesTemplate.find(
          (tc) => tc.tipo === comp.tipo,
        );
        if (templateComp) {
          // Mapear itens do template para itens de composição
          const itensDoTemplate = (templateComp.itens || []).map((item, idx) => ({
            codigo: item.codigo || '',
            descricao: item.descricao,
            quantidade: item.quantidade,
            unidade: item.unidade,
            valorUnitario: item.valorUnitario,
            subtotal: item.quantidade * item.valorUnitario,
            percentual: 0,
            tipoItem: item.tipoItem || 'outros',
            tipoCalculo: item.tipoCalculo || null,
            cargo: item.cargo || null,
            material: item.material || null,
            especificacao: item.especificacao || null,
            peso: item.peso || null,
            encargos: item.encargos || null,
            ordem: item.ordem || idx + 1,
          }));

          return {
            ...comp,
            bdi: {
              percentual: templateComp.bdiPercentual,
              valor: 0,
            },
            itens: itensDoTemplate,
          };
        }
        return { ...comp, itens: comp.itens || [] };
      });

      await this.orcamentosService.update(orcamento.id, {
        composicoes: composicoesAtualizadas.map((c) => ({
          id: c.id,
          nome: c.nome,
          tipo: c.tipo,
          bdi: c.bdi,
          custoDirecto: c.custoDirecto,
          subtotal: c.subtotal,
          percentualDoTotal: c.percentualDoTotal,
          ordem: c.ordem,
          itens: c.itens,
        })),
      } as any);
    }

    return this.orcamentosService.findOne(orcamento.id);
  }

  /**
   * Cria um template a partir de um orçamento existente.
   * Extrai configurações, estrutura de composições E itens.
   */
  async criarDeOrcamento(
    orcamentoId: string,
    data: { nomeTemplate: string; descricaoTemplate: string; categoria: TemplateCategoriaEnum },
    userId: number,
  ): Promise<OrcamentoTemplate> {
    const orcamento = await this.orcamentosService.findOne(orcamentoId);

    const composicoesTemplate = orcamento.composicoes.map((comp) => ({
      tipo: comp.tipo,
      descricao: comp.nome,
      bdiPercentual: comp.bdi?.percentual || 0,
      enabled: (comp.itens && comp.itens.length > 0) || true,
      ordem: comp.ordem,
      itens: (comp.itens || []).map((item, idx): ItemTemplateData => ({
        codigo: item.codigo || '',
        descricao: item.descricao,
        quantidade: Number(item.quantidade),
        unidade: item.unidade,
        valorUnitario: Number(item.valorUnitario),
        tipoItem: item.tipoItem || 'outros',
        material: item.material || undefined,
        especificacao: item.especificacao || undefined,
        peso: item.peso ? Number(item.peso) : undefined,
        cargo: item.cargo || undefined,
        tipoCalculo: item.tipoCalculo || undefined,
        encargos: item.encargos || undefined,
        ordem: item.ordem || idx + 1,
      })),
    }));

    const template = this.templateRepository.create({
      nome: data.nomeTemplate,
      descricao: data.descricaoTemplate,
      categoria: data.categoria,
      configuracoes: {
        bdi: Number(orcamento.configuracoes?.bdi || 0) / 100,
        lucro: Number(orcamento.configuracoesDetalhadas?.lucro?.percentual || 0) / 100,
        tributos: {
          iss: Number(orcamento.tributos?.aliquotaISS || 0) / 100,
          simples: Number(orcamento.tributos?.aliquotaSimples || 0) / 100,
          total:
            (Number(orcamento.tributos?.aliquotaISS || 0) +
              Number(orcamento.tributos?.aliquotaSimples || 0)) /
            100,
        },
        encargos: Number(orcamento.configuracoes?.encargos || 0) / 100,
      },
      composicoesTemplate,
      createdBy: userId,
    });

    return this.templateRepository.save(template);
  }

  /**
   * Duplica um template existente (incluindo itens)
   */
  async duplicar(id: number, novoNome: string): Promise<OrcamentoTemplate> {
    const original = await this.findOne(id);

    const duplicado = this.templateRepository.create({
      nome: novoNome,
      descricao: original.descricao,
      categoria: original.categoria,
      configuracoes: { ...original.configuracoes },
      composicoesTemplate: original.composicoesTemplate.map((c) => ({
        ...c,
        itens: (c.itens || []).map((i) => ({ ...i })),
      })),
      ativo: original.ativo,
      createdBy: original.createdBy,
    });

    return this.templateRepository.save(duplicado);
  }

  /**
   * Ativa/desativa um template
   */
  async toggleAtivo(
    id: number,
    ativo: boolean,
  ): Promise<OrcamentoTemplate> {
    const template = await this.findOne(id);
    template.ativo = ativo;
    return this.templateRepository.save(template);
  }

  /**
   * Popular com templates de exemplo (com itens)
   */
  async seed(): Promise<{ message: string; total: number }> {
    const count = await this.templateRepository.count();
    if (count > 0) {
      return { message: 'Templates já existem no banco', total: count };
    }

    const itensMobDesmob: ItemTemplateData[] = [
      { codigo: 'MOB-001', descricao: 'Transporte de equipamentos', quantidade: 1, unidade: 'VB', valorUnitario: 3500, tipoItem: 'outros', ordem: 1 },
      { codigo: 'MOB-002', descricao: 'Transporte de ferramentas', quantidade: 1, unidade: 'VB', valorUnitario: 1500, tipoItem: 'outros', ordem: 2 },
      { codigo: 'MOB-003', descricao: 'Transporte de pessoal', quantidade: 1, unidade: 'VB', valorUnitario: 2000, tipoItem: 'outros', ordem: 3 },
      { codigo: 'MOB-004', descricao: 'Container escritório', quantidade: 1, unidade: 'Mês', valorUnitario: 1200, tipoItem: 'outros', ordem: 4 },
    ];

    const itensMoFabricacao: ItemTemplateData[] = [
      { codigo: 'FAB-001', descricao: 'Soldador', quantidade: 2, unidade: 'Mês', valorUnitario: 5500, tipoItem: 'mao_obra', cargo: 'Soldador', ordem: 1 },
      { codigo: 'FAB-002', descricao: 'Caldeireiro', quantidade: 2, unidade: 'Mês', valorUnitario: 5000, tipoItem: 'mao_obra', cargo: 'Caldeireiro', ordem: 2 },
      { codigo: 'FAB-003', descricao: 'Ajudante', quantidade: 2, unidade: 'Mês', valorUnitario: 2800, tipoItem: 'mao_obra', cargo: 'Ajudante', ordem: 3 },
      { codigo: 'FAB-004', descricao: 'Encarregado', quantidade: 1, unidade: 'Mês', valorUnitario: 7000, tipoItem: 'mao_obra', cargo: 'Encarregado', ordem: 4 },
    ];

    const itensMoMontagem: ItemTemplateData[] = [
      { codigo: 'MON-001', descricao: 'Montador', quantidade: 3, unidade: 'Mês', valorUnitario: 5200, tipoItem: 'mao_obra', cargo: 'Montador', ordem: 1 },
      { codigo: 'MON-002', descricao: 'Soldador de campo', quantidade: 2, unidade: 'Mês', valorUnitario: 5800, tipoItem: 'mao_obra', cargo: 'Soldador', ordem: 2 },
      { codigo: 'MON-003', descricao: 'Ajudante de montagem', quantidade: 2, unidade: 'Mês', valorUnitario: 2800, tipoItem: 'mao_obra', cargo: 'Ajudante', ordem: 3 },
      { codigo: 'MON-004', descricao: 'Encarregado de montagem', quantidade: 1, unidade: 'Mês', valorUnitario: 7500, tipoItem: 'mao_obra', cargo: 'Encarregado', ordem: 4 },
    ];

    const itensFerramentas: ItemTemplateData[] = [
      { codigo: 'FER-001', descricao: 'Esmerilhadeira 7"', quantidade: 3, unidade: 'Mês', valorUnitario: 250, tipoItem: 'ferramenta', ordem: 1 },
      { codigo: 'FER-002', descricao: 'Esmerilhadeira 4.5"', quantidade: 4, unidade: 'Mês', valorUnitario: 180, tipoItem: 'ferramenta', ordem: 2 },
      { codigo: 'FER-003', descricao: 'Furadeira magnética', quantidade: 1, unidade: 'Mês', valorUnitario: 450, tipoItem: 'ferramenta', ordem: 3 },
      { codigo: 'FER-004', descricao: 'Máquina de solda MIG', quantidade: 2, unidade: 'Mês', valorUnitario: 800, tipoItem: 'ferramenta', ordem: 4 },
    ];

    const itensConsumiveis: ItemTemplateData[] = [
      { codigo: 'CON-001', descricao: 'Disco de corte 7"', quantidade: 100, unidade: 'Unid.', valorUnitario: 8.5, tipoItem: 'consumivel', ordem: 1 },
      { codigo: 'CON-002', descricao: 'Disco de desbaste 7"', quantidade: 50, unidade: 'Unid.', valorUnitario: 12, tipoItem: 'consumivel', ordem: 2 },
      { codigo: 'CON-003', descricao: 'Arame MIG 1.2mm (rolo 15kg)', quantidade: 10, unidade: 'Unid.', valorUnitario: 280, tipoItem: 'consumivel', ordem: 3 },
      { codigo: 'CON-004', descricao: 'EPI - Kit completo', quantidade: 8, unidade: 'Unid.', valorUnitario: 350, tipoItem: 'consumivel', ordem: 4 },
    ];

    const composicoesComItens = [
      { tipo: 'mobilizacao', descricao: 'Mobilização', bdiPercentual: 10, enabled: true, ordem: 1, itens: itensMobDesmob },
      { tipo: 'desmobilizacao', descricao: 'Desmobilização', bdiPercentual: 10, enabled: true, ordem: 2, itens: itensMobDesmob.map((i) => ({ ...i, codigo: i.codigo.replace('MOB', 'DMB') })) },
      { tipo: 'mo_fabricacao', descricao: 'MO Fabricação', bdiPercentual: 25, enabled: true, ordem: 3, itens: itensMoFabricacao },
      { tipo: 'mo_montagem', descricao: 'MO Montagem', bdiPercentual: 25, enabled: true, ordem: 4, itens: itensMoMontagem },
      { tipo: 'mo_terceirizados', descricao: 'MO Terceirizada', bdiPercentual: 20, enabled: true, ordem: 5, itens: [] },
      { tipo: 'jato_pintura', descricao: 'Jato/Pintura', bdiPercentual: 12, enabled: true, ordem: 6, itens: [] },
      { tipo: 'ferramentas', descricao: 'Ferramentas Manuais', bdiPercentual: 15, enabled: true, ordem: 7, itens: itensFerramentas },
      { tipo: 'ferramentas_eletricas', descricao: 'Ferramentas Elétricas', bdiPercentual: 15, enabled: true, ordem: 8, itens: [] },
      { tipo: 'consumiveis', descricao: 'Consumíveis', bdiPercentual: 10, enabled: true, ordem: 9, itens: itensConsumiveis },
      { tipo: 'materiais', descricao: 'Materiais', bdiPercentual: 25, enabled: true, ordem: 10, itens: [] },
    ];

    const templates = [
      {
        nome: 'Galpão Industrial',
        descricao: 'Template completo para galpão industrial com equipe padrão, ferramentas e consumíveis.',
        categoria: TemplateCategoriaEnum.GALPAO_INDUSTRIAL,
        configuracoes: {
          bdi: 0.25,
          lucro: 0.20,
          tributos: { iss: 0.03, simples: 0.118, total: 0.148 },
          encargos: 0.58724,
        },
        composicoesTemplate: composicoesComItens,
      },
      {
        nome: 'Cobertura Metálica',
        descricao: 'Template para cobertura metálica. Sem terceirizados por padrão.',
        categoria: TemplateCategoriaEnum.COBERTURA_METALICA,
        configuracoes: {
          bdi: 0.22,
          lucro: 0.18,
          tributos: { iss: 0.03, simples: 0.118, total: 0.148 },
          encargos: 0.58724,
        },
        composicoesTemplate: composicoesComItens.map((c) =>
          c.tipo === 'mo_terceirizados' ? { ...c, enabled: false } : c,
        ),
      },
      {
        nome: 'Mezanino',
        descricao: 'Template para mezanino. BDI reduzido, sem jato/pintura.',
        categoria: TemplateCategoriaEnum.MEZANINO,
        configuracoes: {
          bdi: 0.20,
          lucro: 0.15,
          tributos: { iss: 0.03, simples: 0.118, total: 0.148 },
          encargos: 0.58724,
        },
        composicoesTemplate: composicoesComItens.map((c) =>
          c.tipo === 'jato_pintura' ? { ...c, enabled: false } : c,
        ),
      },
      {
        nome: 'Escada e Plataforma',
        descricao: 'Template para escadas e plataformas industriais.',
        categoria: TemplateCategoriaEnum.ESCADA_PLATAFORMA,
        configuracoes: {
          bdi: 0.20,
          lucro: 0.15,
          tributos: { iss: 0.03, simples: 0.118, total: 0.148 },
          encargos: 0.58724,
        },
        composicoesTemplate: composicoesComItens.map((c) =>
          c.tipo === 'mo_terceirizados' ? { ...c, enabled: false } : c,
        ),
      },
    ];

    const created = [];
    for (const tmpl of templates) {
      const entity = this.templateRepository.create(tmpl);
      created.push(await this.templateRepository.save(entity));
    }

    return { message: 'Templates criados com sucesso', total: created.length };
  }
}

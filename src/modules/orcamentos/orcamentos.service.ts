import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Like } from 'typeorm';
import { Orcamento, OrcamentoTipo } from './entities/orcamento.entity';
import { ComposicaoCustos, ComposicaoTipo } from './entities/composicao-custos.entity';
import { ItemComposicao, TipoItem, ClasseABC } from './entities/item-composicao.entity';
import { Acao5S } from './entities/acao-5s.entity';
import { CreateOrcamentoDto } from './dto/create-orcamento.dto';
import { UpdateOrcamentoDto } from './dto/update-orcamento.dto';
import { KpisResponse } from './dto/kpis.dto';
import { CreateAcao5SDto } from './dto/acao-5s.dto';

// Composições padrão com BDI pré-definido
const COMPOSICOES_PADRAO: Array<{
  tipo: ComposicaoTipo;
  nome: string;
  bdiPercentual: number;
  ordem: number;
}> = [
  { tipo: 'mobilizacao', nome: 'Mobilização', bdiPercentual: 0, ordem: 1 },
  { tipo: 'desmobilizacao', nome: 'Desmobilização', bdiPercentual: 0, ordem: 2 },
  { tipo: 'mo_fabricacao', nome: 'MO Fabricação', bdiPercentual: 0, ordem: 3 },
  { tipo: 'mo_montagem', nome: 'MO Montagem', bdiPercentual: 0, ordem: 4 },
  { tipo: 'mo_terceirizados', nome: 'MO Terceirizada', bdiPercentual: 0, ordem: 5 },
  { tipo: 'jato_pintura', nome: 'Jato/Pintura', bdiPercentual: 0, ordem: 6 },
  { tipo: 'ferramentas', nome: 'Ferramentas Manuais', bdiPercentual: 0, ordem: 7 },
  { tipo: 'ferramentas_eletricas', nome: 'Ferramentas Elétricas', bdiPercentual: 0, ordem: 8 },
  { tipo: 'consumiveis', nome: 'Consumíveis', bdiPercentual: 0, ordem: 9 },
  { tipo: 'materiais', nome: 'Materiais', bdiPercentual: 0, ordem: 10 },
];

@Injectable()
export class OrcamentosService {
  constructor(
    @InjectRepository(Orcamento)
    private readonly orcamentoRepository: Repository<Orcamento>,
    @InjectRepository(ComposicaoCustos)
    private readonly composicaoRepository: Repository<ComposicaoCustos>,
    @InjectRepository(ItemComposicao)
    private readonly itemRepository: Repository<ItemComposicao>,
    @InjectRepository(Acao5S)
    private readonly acao5sRepository: Repository<Acao5S>,
  ) {}

  /**
   * Gera o próximo número sequencial para orçamentos
   * Formato: S-YYYY-NNN (serviço) ou P-YYYY-NNN (produto)
   */
  async gerarProximoNumero(tipo: OrcamentoTipo): Promise<string> {
    const prefixo = tipo === 'servico' ? 'S' : 'P';
    const ano = new Date().getFullYear();
    const pattern = `${prefixo}-${ano}-%`;

    const ultimoOrcamento = await this.orcamentoRepository
      .createQueryBuilder('o')
      .where('o.numero LIKE :pattern', { pattern })
      .orderBy('o.numero', 'DESC')
      .getOne();

    let proximoSequencial = 1;
    if (ultimoOrcamento) {
      const partes = ultimoOrcamento.numero.split('-');
      const sequencialAtual = parseInt(partes[2], 10);
      proximoSequencial = sequencialAtual + 1;
    }

    return `${prefixo}-${ano}-${String(proximoSequencial).padStart(3, '0')}`;
  }

  /**
   * Retorna o próximo número disponível (para exibição no frontend)
   */
  async getProximoNumero(tipo: OrcamentoTipo = 'servico'): Promise<{ numero: string }> {
    const numero = await this.gerarProximoNumero(tipo);
    return { numero };
  }

  /**
   * Cria um novo orçamento com 10 composições padrão
   */
  async create(dto: CreateOrcamentoDto, userId: number): Promise<Orcamento> {
    const numero = await this.gerarProximoNumero(dto.tipo);

    // Criar o orçamento
    const orcamento = this.orcamentoRepository.create({
      ...dto,
      numero,
      createdBy: userId,
      tributos: dto.tributos || {
        temISS: false,
        aliquotaISS: 0,
        aliquotaSimples: 11.8,
      },
      configuracoes: {
        bdi: 0,
        lucro: 0,
        encargos: 58.724,
      },
    });

    const savedOrcamento = await this.orcamentoRepository.save(orcamento);

    // Criar as 10 composições padrão
    const composicoes = COMPOSICOES_PADRAO.map((comp) => {
      return this.composicaoRepository.create({
        nome: comp.nome,
        tipo: comp.tipo,
        bdi: { percentual: comp.bdiPercentual, valor: 0 },
        custoDirecto: 0,
        subtotal: 0,
        percentualDoTotal: 0,
        ordem: comp.ordem,
        orcamentoId: savedOrcamento.id,
      });
    });

    await this.composicaoRepository.save(composicoes);

    // Retornar o orçamento completo com composições
    return this.findOne(savedOrcamento.id);
  }

  /**
   * Lista todos os orçamentos com campos calculados
   */
  async findAll(): Promise<Orcamento[]> {
    const orcamentos = await this.orcamentoRepository.find({
      relations: ['composicoes', 'composicoes.itens'],
      order: { createdAt: 'DESC' },
    });

    // Recalcular campos para garantir consistência
    return orcamentos.map((orc) => this.calcularCampos(orc));
  }

  /**
   * Busca orçamento por ID com todas as composições e itens
   */
  async findOne(id: string): Promise<Orcamento> {
    const orcamento = await this.orcamentoRepository.findOne({
      where: { id },
      relations: ['composicoes', 'composicoes.itens'],
    });

    if (!orcamento) {
      throw new NotFoundException(`Orçamento com ID ${id} não encontrado`);
    }

    // Ordenar composições e itens
    orcamento.composicoes = orcamento.composicoes.sort((a, b) => a.ordem - b.ordem);
    orcamento.composicoes.forEach((comp) => {
      if (comp.itens) {
        comp.itens = comp.itens.sort((a, b) => a.ordem - b.ordem);
      }
    });

    return this.calcularCampos(orcamento);
  }

  /**
   * Busca orçamentos por CNPJ do cliente
   */
  async findByCliente(cnpj: string): Promise<Orcamento[]> {
    const orcamentos = await this.orcamentoRepository.find({
      where: { clienteCnpj: cnpj },
      relations: ['composicoes', 'composicoes.itens'],
      order: { createdAt: 'DESC' },
    });

    return orcamentos.map((orc) => this.calcularCampos(orc));
  }

  /**
   * Atualiza um orçamento (incluindo composições e itens em cascata)
   */
  async update(id: string, dto: UpdateOrcamentoDto): Promise<Orcamento> {
    const orcamento = await this.findOne(id);

    // Atualizar campos básicos do orçamento
    const { composicoes: composicoesDto, ...dadosOrcamento } = dto;

    Object.assign(orcamento, dadosOrcamento);

    // Se houver composições no DTO, processar atualizações
    if (composicoesDto && composicoesDto.length > 0) {
      for (const compDto of composicoesDto) {
        // Tentar encontrar composição existente pelo ID
        const composicao = compDto.id
          ? orcamento.composicoes.find((c) => c.id === compDto.id)
          : null;

        if (composicao) {
          // Atualizar composição existente
          if (compDto.bdi) {
            composicao.bdi = {
              percentual: compDto.bdi.percentual,
              valor: compDto.bdi.valor || 0,
            };
          }
          if (compDto.ordem !== undefined) {
            composicao.ordem = compDto.ordem;
          }

          // Processar itens
          if (compDto.itens) {
            // IDs reais do DTO (existem no banco)
            const idsReaisNoDto = compDto.itens
              .filter((i) => i.id && composicao.itens.some((existing) => existing.id === i.id))
              .map((i) => i.id);

            // Remover itens que existem no banco mas não estão no DTO
            const idsParaRemover = composicao.itens
              .filter((item) => !idsReaisNoDto.includes(item.id))
              .map((item) => item.id);
            if (idsParaRemover.length > 0) {
              await this.itemRepository.delete(idsParaRemover);
              // Remover da memória também para evitar cascade re-inserir
              composicao.itens = composicao.itens.filter(
                (item) => !idsParaRemover.includes(item.id),
              );
            }

            // Atualizar ou criar itens
            for (const itemDto of compDto.itens) {
              const itemExistente = itemDto.id
                ? composicao.itens.find((i) => i.id === itemDto.id)
                : null;

              // Campos permitidos para atualização (sem sobrescrever relações)
              const camposItem = {
                codigo: itemDto.codigo,
                descricao: itemDto.descricao,
                quantidade: itemDto.quantidade,
                unidade: itemDto.unidade,
                peso: itemDto.peso,
                material: itemDto.material,
                especificacao: itemDto.especificacao,
                valorUnitario: itemDto.valorUnitario,
                tipoItem: (itemDto.tipoItem as TipoItem) || 'outros',
                tipoCalculo: itemDto.tipoCalculo,
                cargo: itemDto.cargo,
                encargos: itemDto.encargos,
                classeABC: itemDto.classeABC as ClasseABC,
                ordem: itemDto.ordem || 0,
                subtotal:
                  Number(itemDto.quantidade) * Number(itemDto.valorUnitario),
              };

              if (itemExistente) {
                // Atualizar item existente (sem tocar em composicaoId/composicao)
                Object.assign(itemExistente, camposItem);
                await this.itemRepository.save(itemExistente);
              } else {
                // Criar novo item (ID ausente ou não encontrado)
                const novoItem = this.itemRepository.create({
                  ...camposItem,
                  composicaoId: composicao.id,
                });
                const saved = await this.itemRepository.save(novoItem);
                // Adicionar à memória para manter sincronizado
                composicao.itens.push(saved);
              }
            }
          }

          // Salvar composição SEM cascade nos itens (já foram salvos individualmente)
          await this.composicaoRepository
            .createQueryBuilder()
            .update(ComposicaoCustos)
            .set({
              bdi: composicao.bdi,
              ordem: composicao.ordem,
            })
            .where('id = :id', { id: composicao.id })
            .execute();
        } else if (compDto.tipo) {
          // Criar nova composição (ex: tintas, quando não existia antes)
          const novaComposicao = this.composicaoRepository.create({
            nome: compDto.nome || compDto.tipo,
            tipo: compDto.tipo as ComposicaoTipo,
            bdi: compDto.bdi || { percentual: 0, valor: 0 },
            ordem: compDto.ordem || orcamento.composicoes.length + 1,
            orcamentoId: orcamento.id,
          });

          const savedComposicao = await this.composicaoRepository.save(novaComposicao);

          // Criar itens da nova composição
          if (compDto.itens && compDto.itens.length > 0) {
            for (const itemDto of compDto.itens) {
              const novoItem = this.itemRepository.create({
                codigo: itemDto.codigo,
                descricao: itemDto.descricao,
                quantidade: itemDto.quantidade,
                unidade: itemDto.unidade,
                peso: itemDto.peso,
                material: itemDto.material,
                especificacao: itemDto.especificacao,
                valorUnitario: itemDto.valorUnitario,
                tipoItem: itemDto.tipoItem as TipoItem || 'outros',
                tipoCalculo: itemDto.tipoCalculo,
                cargo: itemDto.cargo,
                encargos: itemDto.encargos,
                classeABC: itemDto.classeABC as ClasseABC,
                ordem: itemDto.ordem || 0,
                subtotal: Number(itemDto.quantidade) * Number(itemDto.valorUnitario),
                composicaoId: savedComposicao.id,
              });
              await this.itemRepository.save(novoItem);
            }
          }

          orcamento.composicoes.push(savedComposicao);
        }
      }
    }

    // Salvar orçamento e recalcular
    await this.orcamentoRepository.save(orcamento);

    // Buscar novamente para ter os dados atualizados
    const orcamentoAtualizado = await this.findOne(id);
    return this.recalcularESalvar(orcamentoAtualizado);
  }

  /**
   * Remove um orçamento (cascata remove composições e itens)
   */
  async remove(id: string): Promise<void> {
    const orcamento = await this.findOne(id);
    await this.orcamentoRepository.remove(orcamento);
  }

  /**
   * Clona um orçamento existente com nova numeração
   */
  async clonar(id: string, userId: number): Promise<Orcamento> {
    const original = await this.findOne(id);

    // Gerar novo número
    const numero = await this.gerarProximoNumero(original.tipo);

    // Criar clone do orçamento
    const clone = this.orcamentoRepository.create({
      nome: `${original.nome} (Cópia)`,
      numero,
      tipo: original.tipo,
      status: 'rascunho',
      clienteNome: original.clienteNome,
      clienteCnpj: original.clienteCnpj,
      codigoProjeto: original.codigoProjeto,
      areaTotalM2: original.areaTotalM2,
      metrosLineares: original.metrosLineares,
      pesoTotalProjeto: original.pesoTotalProjeto,
      tributos: { ...original.tributos },
      configuracoes: { ...original.configuracoes },
      configuracoesDetalhadas: original.configuracoesDetalhadas
        ? { ...original.configuracoesDetalhadas }
        : null,
      createdBy: userId,
    });

    const savedClone = await this.orcamentoRepository.save(clone);

    // Clonar composições e itens
    for (const compOriginal of original.composicoes) {
      const compClone = this.composicaoRepository.create({
        nome: compOriginal.nome,
        tipo: compOriginal.tipo,
        bdi: { ...compOriginal.bdi },
        custoDirecto: compOriginal.custoDirecto,
        subtotal: compOriginal.subtotal,
        percentualDoTotal: compOriginal.percentualDoTotal,
        ordem: compOriginal.ordem,
        orcamentoId: savedClone.id,
      });

      const savedCompClone = await this.composicaoRepository.save(compClone);

      // Clonar itens da composição
      if (compOriginal.itens && compOriginal.itens.length > 0) {
        for (const itemOriginal of compOriginal.itens) {
          const itemClone = this.itemRepository.create({
            codigo: itemOriginal.codigo,
            descricao: itemOriginal.descricao,
            quantidade: itemOriginal.quantidade,
            unidade: itemOriginal.unidade,
            peso: itemOriginal.peso,
            material: itemOriginal.material,
            especificacao: itemOriginal.especificacao,
            valorUnitario: itemOriginal.valorUnitario,
            subtotal: itemOriginal.subtotal,
            percentual: itemOriginal.percentual,
            tipoItem: itemOriginal.tipoItem,
            tipoCalculo: itemOriginal.tipoCalculo,
            cargo: itemOriginal.cargo,
            encargos: itemOriginal.encargos ? { ...itemOriginal.encargos } : null,
            classeABC: itemOriginal.classeABC,
            ordem: itemOriginal.ordem,
            composicaoId: savedCompClone.id,
          });

          await this.itemRepository.save(itemClone);
        }
      }
    }

    return this.findOne(savedClone.id);
  }

  /**
   * Calcula todos os campos derivados do orçamento
   */
  private calcularCampos(orcamento: Orcamento): Orcamento {
    let custoDirectoTotal = 0;
    let bdiTotal = 0;

    // Calcular campos de cada composição
    for (const composicao of orcamento.composicoes) {
      // Calcular custo direto da composição (soma dos itens)
      let custoDirectoComposicao = 0;
      if (composicao.itens && composicao.itens.length > 0) {
        for (const item of composicao.itens) {
          // Calcular subtotal do item
          item.subtotal = Number(item.quantidade) * Number(item.valorUnitario);
          custoDirectoComposicao += Number(item.subtotal);
        }

        // Calcular percentual de cada item na composição
        for (const item of composicao.itens) {
          item.percentual =
            custoDirectoComposicao > 0
              ? (Number(item.subtotal) / custoDirectoComposicao) * 100
              : 0;
        }
      }

      composicao.custoDirecto = custoDirectoComposicao;

      // Calcular BDI da composição
      const bdiPercentual = composicao.bdi?.percentual || 0;
      const bdiValor = custoDirectoComposicao * (bdiPercentual / 100);
      composicao.bdi = {
        percentual: bdiPercentual,
        valor: bdiValor,
      };

      // Subtotal da composição
      composicao.subtotal = custoDirectoComposicao + bdiValor;

      custoDirectoTotal += custoDirectoComposicao;
      bdiTotal += bdiValor;
    }

    // Calcular percentual do total para cada composição
    for (const composicao of orcamento.composicoes) {
      composicao.percentualDoTotal =
        custoDirectoTotal > 0
          ? (Number(composicao.custoDirecto) / custoDirectoTotal) * 100
          : 0;
    }

    // Campos do orçamento
    orcamento.custoDirectoTotal = custoDirectoTotal;
    orcamento.bdiTotal = bdiTotal;
    orcamento.subtotal = custoDirectoTotal + bdiTotal;
    orcamento.bdiMedio =
      custoDirectoTotal > 0 ? (bdiTotal / custoDirectoTotal) * 100 : 0;

    // Lucro (separado do BDI, aplicado sobre subtotal)
    const lucroConfig = orcamento.configuracoesDetalhadas?.lucro;
    const lucroPercentual = lucroConfig?.habilitado && lucroConfig.percentual > 0
      ? lucroConfig.percentual
      : 0;
    const lucroTotal = orcamento.subtotal * (lucroPercentual / 100);
    orcamento.lucroTotal = lucroTotal;
    orcamento.precoBase = orcamento.subtotal + lucroTotal;

    // Calcular tributos (sobre preço base)
    const aliquotaSimples = orcamento.tributos?.aliquotaSimples || 0;
    orcamento.tributosTotal = orcamento.precoBase * (aliquotaSimples / 100);

    // Total de venda
    orcamento.totalVenda = orcamento.precoBase + orcamento.tributosTotal;

    // Custo por m²
    if (orcamento.areaTotalM2 && Number(orcamento.areaTotalM2) > 0) {
      orcamento.custoPorM2 = orcamento.totalVenda / Number(orcamento.areaTotalM2);
    }

    // DRE
    const receitaLiquida = orcamento.totalVenda - orcamento.tributosTotal; // = precoBase
    const lucroBruto = receitaLiquida - custoDirectoTotal;
    const margemBruta = receitaLiquida > 0 ? (lucroBruto / receitaLiquida) * 100 : 0;
    const lucroLiquido = lucroTotal;
    const margemLiquida =
      orcamento.totalVenda > 0
        ? (lucroLiquido / orcamento.totalVenda) * 100
        : 0;

    orcamento.dre = {
      receitaLiquida,
      lucroBruto,
      margemBruta,
      lucroLiquido,
      margemLiquida,
    };

    // Calcular QQP Suprimentos (agrupamento por tipo)
    const qqpSuprimentos = {
      materiais: 0,
      pintura: 0,
      ferramentas: 0,
      consumiveis: 0,
      total: 0,
    };

    for (const comp of orcamento.composicoes) {
      switch (comp.tipo) {
        case 'materiais':
          qqpSuprimentos.materiais += Number(comp.subtotal);
          break;
        case 'jato_pintura':
        case 'tintas':
          qqpSuprimentos.pintura += Number(comp.subtotal);
          break;
        case 'ferramentas':
        case 'ferramentas_eletricas':
          qqpSuprimentos.ferramentas += Number(comp.subtotal);
          break;
        case 'consumiveis':
          qqpSuprimentos.consumiveis += Number(comp.subtotal);
          break;
      }
    }
    qqpSuprimentos.total =
      qqpSuprimentos.materiais +
      qqpSuprimentos.pintura +
      qqpSuprimentos.ferramentas +
      qqpSuprimentos.consumiveis;

    orcamento.qqpSuprimentos = qqpSuprimentos;

    // Calcular QQP Cliente
    const maoObra = orcamento.composicoes
      .filter((c) =>
        ['mo_fabricacao', 'mo_montagem', 'mo_terceirizados', 'mobilizacao', 'desmobilizacao'].includes(c.tipo),
      )
      .reduce((sum, c) => sum + Number(c.subtotal), 0);

    orcamento.qqpCliente = {
      suprimentos: qqpSuprimentos.total,
      maoObra,
      bdi: bdiTotal,
      subtotal: orcamento.subtotal,
      tributos: orcamento.tributosTotal,
      total: orcamento.totalVenda,
      area: orcamento.areaTotalM2 ? Number(orcamento.areaTotalM2) : undefined,
      precoM2: orcamento.custoPorM2 ? Number(orcamento.custoPorM2) : undefined,
    };

    return orcamento;
  }

  /**
   * Recalcula os campos e salva o orçamento
   */
  private async recalcularESalvar(orcamento: Orcamento): Promise<Orcamento> {
    const orcamentoCalculado = this.calcularCampos(orcamento);

    // Salvar composições e itens atualizados
    for (const composicao of orcamentoCalculado.composicoes) {
      if (composicao.itens) {
        for (const item of composicao.itens) {
          await this.itemRepository.save(item);
        }
      }
      await this.composicaoRepository.save(composicao);
    }

    // Salvar orçamento
    await this.orcamentoRepository.save(orcamentoCalculado);

    return orcamentoCalculado;
  }

  /**
   * Popula o banco de dados com orçamentos de exemplo
   */
  async seed(): Promise<{ message: string; orcamentos: Orcamento[] }> {
    // Verificar se já existem orçamentos
    const existentes = await this.orcamentoRepository.count();
    if (existentes > 0) {
      return {
        message: `Já existem ${existentes} orçamentos no banco. Seed ignorado.`,
        orcamentos: [],
      };
    }

    const orcamentosCriados: Orcamento[] = [];

    // Orçamento 1: Galpão Industrial 1.000m² (Aprovado) - Completo como mock
    const orc1 = await this.criarOrcamentoSeed({
      nome: 'Galpão Industrial 1.000m² - Indústria ABC',
      tipo: 'produto',
      status: 'aprovado',
      clienteNome: 'Indústria ABC Ltda',
      clienteCnpj: '12.345.678/0001-90',
      codigoProjeto: 'PROJ-GAL-2026-001',
      areaTotalM2: 1000,
      metrosLineares: 180,
      pesoTotalProjeto: 18500,
      itensExemplo: [
        // MOBILIZAÇÃO
        { composicaoTipo: 'mobilizacao', descricao: 'Transporte de Equipamentos', quantidade: 1, unidade: 'vb', valorUnitario: 3500, tipoItem: 'outros' },
        { composicaoTipo: 'mobilizacao', descricao: 'Montagem de Canteiro', quantidade: 1, unidade: 'vb', valorUnitario: 2500, tipoItem: 'outros' },
        { composicaoTipo: 'mobilizacao', descricao: 'Locação de Equipamentos', quantidade: 1, unidade: 'mês', valorUnitario: 2500, tipoItem: 'outros' },
        // DESMOBILIZAÇÃO
        { composicaoTipo: 'desmobilizacao', descricao: 'Desmontagem de Canteiro', quantidade: 1, unidade: 'vb', valorUnitario: 1800, tipoItem: 'outros' },
        { composicaoTipo: 'desmobilizacao', descricao: 'Transporte de Retorno', quantidade: 1, unidade: 'vb', valorUnitario: 2400, tipoItem: 'outros' },
        // MO FABRICAÇÃO
        { composicaoTipo: 'mo_fabricacao', descricao: 'Soldador Qualificado', quantidade: 480, unidade: 'h', valorUnitario: 45, tipoItem: 'mao_obra', cargo: 'Soldador' },
        { composicaoTipo: 'mo_fabricacao', descricao: 'Montador', quantidade: 360, unidade: 'h', valorUnitario: 35, tipoItem: 'mao_obra', cargo: 'Montador' },
        { composicaoTipo: 'mo_fabricacao', descricao: 'Auxiliar', quantidade: 480, unidade: 'h', valorUnitario: 25, tipoItem: 'mao_obra', cargo: 'Auxiliar' },
        { composicaoTipo: 'mo_fabricacao', descricao: 'Encarregado', quantidade: 40, unidade: 'h', valorUnitario: 60, tipoItem: 'mao_obra', cargo: 'Encarregado' },
        // MO MONTAGEM
        { composicaoTipo: 'mo_montagem', descricao: 'Montador Especializado', quantidade: 320, unidade: 'h', valorUnitario: 50, tipoItem: 'mao_obra', cargo: 'Montador Especializado' },
        { composicaoTipo: 'mo_montagem', descricao: 'Montador', quantidade: 480, unidade: 'h', valorUnitario: 35, tipoItem: 'mao_obra', cargo: 'Montador' },
        { composicaoTipo: 'mo_montagem', descricao: 'Auxiliar', quantidade: 240, unidade: 'h', valorUnitario: 22, tipoItem: 'mao_obra', cargo: 'Auxiliar' },
        { composicaoTipo: 'mo_montagem', descricao: 'Guincheiro', quantidade: 5, unidade: 'dia', valorUnitario: 280, tipoItem: 'mao_obra', cargo: 'Guincheiro' },
        // JATO/PINTURA
        { composicaoTipo: 'jato_pintura', descricao: 'Jateamento Sa 2.5', quantidade: 1200, unidade: 'm²', valorUnitario: 12, tipoItem: 'outros' },
        { composicaoTipo: 'jato_pintura', descricao: 'Primer Epóxi', quantidade: 120, unidade: 'lt', valorUnitario: 85, tipoItem: 'material' },
        { composicaoTipo: 'jato_pintura', descricao: 'Esmalte PU Amarelo', quantidade: 180, unidade: 'lt', valorUnitario: 95, tipoItem: 'material' },
        { composicaoTipo: 'jato_pintura', descricao: 'Thinner', quantidade: 240, unidade: 'lt', valorUnitario: 18, tipoItem: 'consumivel' },
        // FERRAMENTAS MANUAIS
        { composicaoTipo: 'ferramentas', descricao: 'Esmerilhadeira 9"', quantidade: 4, unidade: 'un', valorUnitario: 450, tipoItem: 'ferramenta' },
        { composicaoTipo: 'ferramentas', descricao: 'Furadeira Industrial', quantidade: 2, unidade: 'un', valorUnitario: 680, tipoItem: 'ferramenta' },
        { composicaoTipo: 'ferramentas', descricao: 'Marreta 5kg', quantidade: 6, unidade: 'un', valorUnitario: 45, tipoItem: 'ferramenta' },
        { composicaoTipo: 'ferramentas', descricao: 'Kit Ferramentas Manuais', quantidade: 3, unidade: 'un', valorUnitario: 1140, tipoItem: 'ferramenta' },
        // FERRAMENTAS ELÉTRICAS
        { composicaoTipo: 'ferramentas_eletricas', descricao: 'Máquina de Solda MIG 400A', quantidade: 4, unidade: 'mês', valorUnitario: 1200, tipoItem: 'ferramenta' },
        { composicaoTipo: 'ferramentas_eletricas', descricao: 'Máquina de Solda Eletrodo', quantidade: 2, unidade: 'mês', valorUnitario: 450, tipoItem: 'ferramenta' },
        { composicaoTipo: 'ferramentas_eletricas', descricao: 'Compressor de Ar', quantidade: 1, unidade: 'mês', valorUnitario: 1800, tipoItem: 'ferramenta' },
        // CONSUMÍVEIS
        { composicaoTipo: 'consumiveis', descricao: 'Disco de Corte 9"', quantidade: 250, unidade: 'un', valorUnitario: 8.5, tipoItem: 'consumivel' },
        { composicaoTipo: 'consumiveis', descricao: 'Disco de Desbaste 9"', quantidade: 180, unidade: 'un', valorUnitario: 7.2, tipoItem: 'consumivel' },
        { composicaoTipo: 'consumiveis', descricao: 'Eletrodo E6013 3,25mm', quantidade: 220, unidade: 'kg', valorUnitario: 18, tipoItem: 'consumivel' },
        { composicaoTipo: 'consumiveis', descricao: 'Lixa d\'água grão 80', quantidade: 350, unidade: 'un', valorUnitario: 2.8, tipoItem: 'consumivel' },
        { composicaoTipo: 'consumiveis', descricao: 'Broca HSS sortida', quantidade: 12, unidade: 'cx', valorUnitario: 85, tipoItem: 'consumivel' },
        { composicaoTipo: 'consumiveis', descricao: 'EPI Diversos', quantidade: 1, unidade: 'vb', valorUnitario: 3099, tipoItem: 'consumivel' },
        // MATERIAIS
        { composicaoTipo: 'materiais', descricao: 'Perfil W 200x35,9 A572-50', quantidade: 180, unidade: 'm', valorUnitario: 285, tipoItem: 'material' },
        { composicaoTipo: 'materiais', descricao: 'Perfil U 150x50x3 A36', quantidade: 240, unidade: 'm', valorUnitario: 95, tipoItem: 'material' },
        { composicaoTipo: 'materiais', descricao: 'Cantoneira L 51x4,7 A36', quantidade: 320, unidade: 'm', valorUnitario: 28, tipoItem: 'material' },
        { composicaoTipo: 'materiais', descricao: 'Chapa 6,35mm A36', quantidade: 1850, unidade: 'kg', valorUnitario: 8.5, tipoItem: 'material' },
        { composicaoTipo: 'materiais', descricao: 'Parafuso ASTM A325 3/4"x2.1/2"', quantidade: 2400, unidade: 'un', valorUnitario: 3.8, tipoItem: 'material' },
        { composicaoTipo: 'materiais', descricao: 'Porca Sextavada 3/4"', quantidade: 2400, unidade: 'un', valorUnitario: 1.2, tipoItem: 'material' },
        { composicaoTipo: 'materiais', descricao: 'Arruela Lisa 3/4"', quantidade: 4800, unidade: 'un', valorUnitario: 0.45, tipoItem: 'material' },
        { composicaoTipo: 'materiais', descricao: 'Telha Metálica Trapezoidal', quantidade: 1100, unidade: 'm²', valorUnitario: 65, tipoItem: 'material' },
        { composicaoTipo: 'materiais', descricao: 'Calha Galvanizada', quantidade: 48, unidade: 'm', valorUnitario: 38, tipoItem: 'material' },
      ],
    });
    orcamentosCriados.push(orc1);

    // Orçamento 2: Mezanino 200m² (Em Análise)
    const orc2 = await this.criarOrcamentoSeed({
      nome: 'Mezanino 200m² - Logística XYZ',
      tipo: 'produto',
      status: 'em_analise',
      clienteNome: 'Logística XYZ S.A.',
      clienteCnpj: '98.765.432/0001-10',
      codigoProjeto: 'PROJ-MEZ-2026-002',
      areaTotalM2: 200,
      metrosLineares: 45,
      pesoTotalProjeto: 4200,
      itensExemplo: [
        // MOBILIZAÇÃO
        { composicaoTipo: 'mobilizacao', descricao: 'Transporte de Equipamentos', quantidade: 1, unidade: 'vb', valorUnitario: 1500, tipoItem: 'outros' },
        { composicaoTipo: 'mobilizacao', descricao: 'Montagem de Área de Trabalho', quantidade: 1, unidade: 'vb', valorUnitario: 800, tipoItem: 'outros' },
        // DESMOBILIZAÇÃO
        { composicaoTipo: 'desmobilizacao', descricao: 'Transporte de Retorno', quantidade: 1, unidade: 'vb', valorUnitario: 1200, tipoItem: 'outros' },
        // MO FABRICAÇÃO
        { composicaoTipo: 'mo_fabricacao', descricao: 'Soldador', quantidade: 120, unidade: 'h', valorUnitario: 45, tipoItem: 'mao_obra', cargo: 'Soldador' },
        { composicaoTipo: 'mo_fabricacao', descricao: 'Montador', quantidade: 80, unidade: 'h', valorUnitario: 35, tipoItem: 'mao_obra', cargo: 'Montador' },
        { composicaoTipo: 'mo_fabricacao', descricao: 'Auxiliar', quantidade: 100, unidade: 'h', valorUnitario: 25, tipoItem: 'mao_obra', cargo: 'Auxiliar' },
        // MO MONTAGEM
        { composicaoTipo: 'mo_montagem', descricao: 'Montador', quantidade: 160, unidade: 'h', valorUnitario: 40, tipoItem: 'mao_obra', cargo: 'Montador' },
        { composicaoTipo: 'mo_montagem', descricao: 'Auxiliar', quantidade: 80, unidade: 'h', valorUnitario: 22, tipoItem: 'mao_obra', cargo: 'Auxiliar' },
        // JATO/PINTURA
        { composicaoTipo: 'jato_pintura', descricao: 'Pintura Epóxi 2 demãos', quantidade: 400, unidade: 'm²', valorUnitario: 35, tipoItem: 'outros' },
        // FERRAMENTAS
        { composicaoTipo: 'ferramentas', descricao: 'Kit Ferramentas Diversas', quantidade: 1, unidade: 'vb', valorUnitario: 1500, tipoItem: 'ferramenta' },
        // FERRAMENTAS ELÉTRICAS
        { composicaoTipo: 'ferramentas_eletricas', descricao: 'Máquina de Solda', quantidade: 2, unidade: 'mês', valorUnitario: 800, tipoItem: 'ferramenta' },
        // CONSUMÍVEIS
        { composicaoTipo: 'consumiveis', descricao: 'Disco de Corte 7"', quantidade: 80, unidade: 'un', valorUnitario: 7, tipoItem: 'consumivel' },
        { composicaoTipo: 'consumiveis', descricao: 'Eletrodo E7018', quantidade: 50, unidade: 'kg', valorUnitario: 28, tipoItem: 'consumivel' },
        { composicaoTipo: 'consumiveis', descricao: 'EPI Diversos', quantidade: 1, unidade: 'vb', valorUnitario: 800, tipoItem: 'consumivel' },
        // MATERIAIS
        { composicaoTipo: 'materiais', descricao: 'Perfil I 200x100 A36', quantidade: 45, unidade: 'm', valorUnitario: 320, tipoItem: 'material' },
        { composicaoTipo: 'materiais', descricao: 'Viga U 150x50 A36', quantidade: 60, unidade: 'm', valorUnitario: 85, tipoItem: 'material' },
        { composicaoTipo: 'materiais', descricao: 'Piso Steel Deck', quantidade: 200, unidade: 'm²', valorUnitario: 95, tipoItem: 'material' },
        { composicaoTipo: 'materiais', descricao: 'Parafusos e Fixadores', quantidade: 1, unidade: 'vb', valorUnitario: 2500, tipoItem: 'material' },
        { composicaoTipo: 'materiais', descricao: 'Guarda-corpo', quantidade: 30, unidade: 'm', valorUnitario: 180, tipoItem: 'material' },
      ],
    });
    orcamentosCriados.push(orc2);

    // Orçamento 3: Serviço de Jateamento e Pintura (Rascunho)
    const orc3 = await this.criarOrcamentoSeed({
      nome: 'Jateamento e Pintura 500m² - Construtora Delta',
      tipo: 'servico',
      status: 'rascunho',
      clienteNome: 'Construtora Delta Ltda',
      clienteCnpj: '11.222.333/0001-44',
      codigoProjeto: 'SERV-JAT-2026-001',
      areaTotalM2: 500,
      itensExemplo: [
        // MOBILIZAÇÃO
        { composicaoTipo: 'mobilizacao', descricao: 'Transporte de Equipamentos de Jato', quantidade: 1, unidade: 'vb', valorUnitario: 3500, tipoItem: 'outros' },
        { composicaoTipo: 'mobilizacao', descricao: 'Montagem de Área Confinada', quantidade: 1, unidade: 'vb', valorUnitario: 2000, tipoItem: 'outros' },
        // DESMOBILIZAÇÃO
        { composicaoTipo: 'desmobilizacao', descricao: 'Desmontagem e Limpeza', quantidade: 1, unidade: 'vb', valorUnitario: 1500, tipoItem: 'outros' },
        { composicaoTipo: 'desmobilizacao', descricao: 'Transporte de Retorno', quantidade: 1, unidade: 'vb', valorUnitario: 2500, tipoItem: 'outros' },
        // MO TERCEIRIZADA
        { composicaoTipo: 'mo_terceirizados', descricao: 'Equipe de Jateamento (4 pessoas)', quantidade: 15, unidade: 'dia', valorUnitario: 1800, tipoItem: 'mao_obra' },
        { composicaoTipo: 'mo_terceirizados', descricao: 'Equipe de Pintura (3 pessoas)', quantidade: 10, unidade: 'dia', valorUnitario: 1200, tipoItem: 'mao_obra' },
        // JATO/PINTURA
        { composicaoTipo: 'jato_pintura', descricao: 'Jateamento Abrasivo SA 2.5', quantidade: 500, unidade: 'm²', valorUnitario: 18, tipoItem: 'outros' },
        { composicaoTipo: 'jato_pintura', descricao: 'Primer Epóxi Zinco', quantidade: 60, unidade: 'lt', valorUnitario: 120, tipoItem: 'material' },
        { composicaoTipo: 'jato_pintura', descricao: 'Acabamento Poliuretano', quantidade: 80, unidade: 'lt', valorUnitario: 95, tipoItem: 'material' },
        { composicaoTipo: 'jato_pintura', descricao: 'Thinner Especial', quantidade: 40, unidade: 'lt', valorUnitario: 25, tipoItem: 'consumivel' },
        // CONSUMÍVEIS
        { composicaoTipo: 'consumiveis', descricao: 'Granalha de Aço G-25', quantidade: 800, unidade: 'kg', valorUnitario: 4.5, tipoItem: 'consumivel' },
        { composicaoTipo: 'consumiveis', descricao: 'Fita Crepe Industrial', quantidade: 50, unidade: 'rl', valorUnitario: 12, tipoItem: 'consumivel' },
        { composicaoTipo: 'consumiveis', descricao: 'Lona Plástica', quantidade: 200, unidade: 'm²', valorUnitario: 3, tipoItem: 'consumivel' },
        { composicaoTipo: 'consumiveis', descricao: 'EPI Específico Jato', quantidade: 1, unidade: 'vb', valorUnitario: 2500, tipoItem: 'consumivel' },
        // FERRAMENTAS ELÉTRICAS (compressor)
        { composicaoTipo: 'ferramentas_eletricas', descricao: 'Aluguel Compressor 750 PCM', quantidade: 1, unidade: 'mês', valorUnitario: 8500, tipoItem: 'ferramenta' },
        { composicaoTipo: 'ferramentas_eletricas', descricao: 'Pistolas de Pintura Airless', quantidade: 2, unidade: 'mês', valorUnitario: 1200, tipoItem: 'ferramenta' },
      ],
    });
    orcamentosCriados.push(orc3);

    return {
      message: `Seed concluído! ${orcamentosCriados.length} orçamentos criados.`,
      orcamentos: orcamentosCriados,
    };
  }

  /**
   * Método auxiliar para criar orçamento de seed
   */
  private async criarOrcamentoSeed(dados: {
    nome: string;
    tipo: OrcamentoTipo;
    status: string;
    clienteNome: string;
    clienteCnpj: string;
    codigoProjeto: string;
    areaTotalM2: number;
    metrosLineares?: number;
    pesoTotalProjeto?: number;
    itensExemplo: Array<{
      composicaoTipo: ComposicaoTipo;
      descricao: string;
      quantidade: number;
      unidade: string;
      valorUnitario: number;
      tipoItem: TipoItem;
      cargo?: string;
    }>;
  }): Promise<Orcamento> {
    const numero = await this.gerarProximoNumero(dados.tipo);

    // Criar orçamento
    const orcamento = this.orcamentoRepository.create({
      numero,
      nome: dados.nome,
      tipo: dados.tipo,
      status: dados.status as any,
      clienteNome: dados.clienteNome,
      clienteCnpj: dados.clienteCnpj,
      codigoProjeto: dados.codigoProjeto,
      areaTotalM2: dados.areaTotalM2,
      metrosLineares: dados.metrosLineares,
      pesoTotalProjeto: dados.pesoTotalProjeto,
      tributos: {
        temISS: dados.tipo === 'servico',
        aliquotaISS: dados.tipo === 'servico' ? 3.0 : 0,
        aliquotaSimples: 11.8,
      },
      configuracoes: {
        bdi: 0,
        lucro: 0,
        encargos: 58.724,
      },
      createdBy: 1,
    });

    const savedOrcamento = await this.orcamentoRepository.save(orcamento);

    // Criar composições padrão
    const composicoes: ComposicaoCustos[] = [];
    for (const comp of COMPOSICOES_PADRAO) {
      const composicao = this.composicaoRepository.create({
        nome: comp.nome,
        tipo: comp.tipo,
        bdi: { percentual: comp.bdiPercentual, valor: 0 },
        custoDirecto: 0,
        subtotal: 0,
        percentualDoTotal: 0,
        ordem: comp.ordem,
        orcamentoId: savedOrcamento.id,
      });
      const savedComposicao = await this.composicaoRepository.save(composicao);
      composicoes.push(savedComposicao);
    }

    // Adicionar itens às composições
    for (const itemDados of dados.itensExemplo) {
      const composicao = composicoes.find((c) => c.tipo === itemDados.composicaoTipo);
      if (composicao) {
        const item = this.itemRepository.create({
          descricao: itemDados.descricao,
          quantidade: itemDados.quantidade,
          unidade: itemDados.unidade,
          valorUnitario: itemDados.valorUnitario,
          subtotal: itemDados.quantidade * itemDados.valorUnitario,
          tipoItem: itemDados.tipoItem,
          cargo: itemDados.cargo,
          ordem: 0,
          composicaoId: composicao.id,
        });
        await this.itemRepository.save(item);
      }
    }

    // Buscar orçamento completo e recalcular
    const orcamentoCompleto = await this.findOne(savedOrcamento.id);
    return this.recalcularESalvar(orcamentoCompleto);
  }

  // ==========================================
  // KPIs COMERCIAIS
  // ==========================================

  /**
   * Calcula KPIs comerciais para um mês específico
   * @param mesAno Formato: "YYYY-MM" (ex: "2026-03"). Se não informado, usa o mês atual.
   */
  async calcularKpis(mesAno?: string): Promise<KpisResponse> {
    // Definir mês de referência
    const hoje = new Date();
    const mesRef = mesAno || `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`;
    const [ano, mes] = mesRef.split('-').map(Number);

    // Buscar todos os orçamentos (com campos calculados)
    const todosOrcamentos = await this.findAll();

    // Filtrar orçamentos criados no mês
    const orcamentosMes = todosOrcamentos.filter((o) => {
      if (!o.createdAt) return false;
      const dataCreated = new Date(o.createdAt);
      return dataCreated.getFullYear() === ano && dataCreated.getMonth() + 1 === mes;
    });

    // Contagens
    const qtdOrcamentos = orcamentosMes.length;
    const valorOrcamentos = orcamentosMes.reduce((sum, o) => sum + Number(o.totalVenda || 0), 0);

    // Filtrar decisões (aprovados/rejeitados) no mês (baseado em updatedAt)
    const decisoesMes = todosOrcamentos.filter((o) => {
      if (!o.updatedAt) return false;
      const dataUpdated = new Date(o.updatedAt);
      return (
        dataUpdated.getFullYear() === ano &&
        dataUpdated.getMonth() + 1 === mes &&
        (o.status === 'aprovado' || o.status === 'rejeitado')
      );
    });

    const aprovadosMes = decisoesMes.filter((o) => o.status === 'aprovado');
    const rejeitadosMes = decisoesMes.filter((o) => o.status === 'rejeitado');

    // Taxa de conversão
    const taxaConversao =
      decisoesMes.length > 0
        ? (aprovadosMes.length / decisoesMes.length) * 100
        : null;

    // Margem Bruta (BDI / Receita Líquida dos aprovados no mês)
    const somaReceitaLiquida = aprovadosMes.reduce(
      (sum, o) => sum + Number(o.dre?.receitaLiquida || 0),
      0
    );
    const somaBdiTotal = aprovadosMes.reduce(
      (sum, o) => sum + Number(o.bdiTotal || 0),
      0
    );
    const margemBruta =
      somaReceitaLiquida > 0 ? (somaBdiTotal / somaReceitaLiquida) * 100 : null;

    // Margem Líquida (baseada no lucro separado)
    const aprovadosComLucro = aprovadosMes.filter(
      (o) => Number(o.lucroTotal || 0) > 0
    );
    let margemLiquida: number | null = null;
    if (aprovadosComLucro.length > 0) {
      const somaLucro = aprovadosComLucro.reduce(
        (sum, o) => sum + Number(o.lucroTotal || 0),
        0
      );
      const somaTotalVenda = aprovadosComLucro.reduce(
        (sum, o) => sum + Number(o.totalVenda || 0),
        0
      );
      margemLiquida = somaTotalVenda > 0 ? (somaLucro / somaTotalVenda) * 100 : null;
    }

    // Contagens por status (todos os orçamentos)
    const qtdAprovados = todosOrcamentos.filter((o) => o.status === 'aprovado').length;
    const qtdRejeitados = todosOrcamentos.filter((o) => o.status === 'rejeitado').length;
    const qtdEmAnalise = todosOrcamentos.filter((o) => o.status === 'em_analise').length;
    const qtdRascunho = todosOrcamentos.filter((o) => o.status === 'rascunho').length;
    const valorAprovados = todosOrcamentos
      .filter((o) => o.status === 'aprovado')
      .reduce((sum, o) => sum + Number(o.totalVenda || 0), 0);

    // Tendência (últimos 6 meses)
    const tendencia: KpisResponse['tendencia'] = [];
    const mesesNomes = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(ano, mes - 1 - i, 1);
      const anoTend = d.getFullYear();
      const mesTend = d.getMonth() + 1;
      const mesAnoTend = `${anoTend}-${String(mesTend).padStart(2, '0')}`;

      const orcTend = todosOrcamentos.filter((o) => {
        if (!o.createdAt) return false;
        const dataCreated = new Date(o.createdAt);
        return dataCreated.getFullYear() === anoTend && dataCreated.getMonth() + 1 === mesTend;
      });

      tendencia.push({
        mesAno: mesAnoTend,
        label: `${mesesNomes[mesTend - 1]}/${String(anoTend).slice(2)}`,
        qtdOrcamentos: orcTend.length,
        valorOrcamentos: orcTend.reduce((sum, o) => sum + Number(o.totalVenda || 0), 0),
      });
    }

    // Contar ações 5S do mês
    const acoes5SMes = await this.acao5sRepository.count({
      where: { mes: mesRef },
    });

    return {
      mesAno: mesRef,
      qtdOrcamentos,
      valorOrcamentos,
      taxaConversao,
      margemBruta,
      margemLiquida,
      acoes5S: acoes5SMes,
      qtdAprovados,
      qtdRejeitados,
      qtdEmAnalise,
      qtdRascunho,
      valorAprovados,
      tendencia,
    };
  }

  // ==========================================
  // AÇÕES 5S
  // ==========================================

  /**
   * Lista todas as ações 5S de um mês específico
   */
  async findAcoes5S(mesAno?: string): Promise<Acao5S[]> {
    const query = this.acao5sRepository.createQueryBuilder('a')
      .orderBy('a.data', 'ASC');

    if (mesAno) {
      query.where('a.mes = :mesAno', { mesAno });
    }

    return query.getMany();
  }

  /**
   * Cria uma nova ação 5S
   */
  async createAcao5S(dto: CreateAcao5SDto, userId: number): Promise<Acao5S> {
    const mes = dto.data.slice(0, 7); // "YYYY-MM"

    const acao = this.acao5sRepository.create({
      data: dto.data,
      descricao: dto.descricao,
      mes,
      createdBy: userId,
    });

    return this.acao5sRepository.save(acao);
  }

  /**
   * Remove uma ação 5S
   */
  async removeAcao5S(id: string): Promise<void> {
    const acao = await this.acao5sRepository.findOne({ where: { id } });
    if (!acao) {
      throw new NotFoundException(`Ação 5S com ID ${id} não encontrada`);
    }
    await this.acao5sRepository.remove(acao);
  }

  /**
   * Conta ações 5S de um mês
   */
  async countAcoes5S(mesAno: string): Promise<number> {
    return this.acao5sRepository.count({
      where: { mes: mesAno },
    });
  }
}

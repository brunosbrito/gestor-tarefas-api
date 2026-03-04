import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Proposta, StatusProposta, MoedaProposta } from './entities/proposta.entity';
import { ItemProposta, TipoItemProposta } from './entities/item-proposta.entity';
import { CreatePropostaDto } from './dto/create-proposta.dto';
import { UpdatePropostaDto, UpdateStatusDto } from './dto/update-proposta.dto';

@Injectable()
export class PropostasService {
  constructor(
    @InjectRepository(Proposta)
    private readonly propostaRepository: Repository<Proposta>,
    @InjectRepository(ItemProposta)
    private readonly itemRepository: Repository<ItemProposta>,
  ) {}

  private async gerarNumero(): Promise<string> {
    const ano = new Date().getFullYear();
    const ultimaProposta = await this.propostaRepository
      .createQueryBuilder('p')
      .where('p.numero LIKE :prefix', { prefix: `${ano}%` })
      .orderBy('p.numero', 'DESC')
      .getOne();

    let sequencial = 1;
    if (ultimaProposta) {
      const match = ultimaProposta.numero.match(/\d+$/);
      if (match) {
        sequencial = parseInt(match[0], 10) + 1;
      }
    }

    return `${ano}${String(sequencial).padStart(3, '0')}`;
  }

  async create(dto: CreatePropostaDto, userId: number): Promise<Proposta> {
    const numero = await this.gerarNumero();

    const proposta = this.propostaRepository.create({
      numero,
      titulo: dto.titulo,
      cliente: dto.cliente,
      vendedor: dto.vendedor,
      dataEmissao: new Date().toISOString().split('T')[0],
      dataValidade: dto.dataValidade,
      previsaoEntrega: dto.previsaoEntrega,
      orcamentoId: dto.orcamentoId,
      subtotalItens: 0,
      valorTotal: dto.valorTotal,
      moeda: dto.moeda || MoedaProposta.BRL,
      pagamento: dto.pagamento,
      observacoes: dto.observacoes,
      status: StatusProposta.RASCUNHO,
      createdBy: userId,
    });

    const savedProposta = await this.propostaRepository.save(proposta);

    // Criar itens se fornecidos
    if (dto.itens && dto.itens.length > 0) {
      let subtotal = 0;
      const itens: ItemProposta[] = [];

      for (let i = 0; i < dto.itens.length; i++) {
        const itemDto = dto.itens[i];
        const itemSubtotal = itemDto.quantidade * itemDto.valorUnitario;
        subtotal += itemSubtotal;

        const item = this.itemRepository.create({
          item: i + 1,
          nome: itemDto.nome,
          tipo: itemDto.tipo as TipoItemProposta,
          quantidade: itemDto.quantidade,
          unidade: itemDto.unidade,
          valorUnitario: itemDto.valorUnitario,
          subtotal: itemSubtotal,
          observacao: itemDto.observacao,
          proposta_id: savedProposta.id,
        });

        itens.push(item);
      }

      await this.itemRepository.save(itens);

      // Atualizar subtotal
      savedProposta.subtotalItens = subtotal;
      await this.propostaRepository.save(savedProposta);
    }

    return this.findOne(savedProposta.id);
  }

  async findAll(filtros?: {
    status?: StatusProposta;
    clienteNome?: string;
    dataInicio?: string;
    dataFim?: string;
    vendedor?: string;
  }): Promise<Proposta[]> {
    const query = this.propostaRepository
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.itens', 'itens')
      .orderBy('p.createdAt', 'DESC');

    if (filtros?.status) {
      query.andWhere('p.status = :status', { status: filtros.status });
    }

    if (filtros?.clienteNome) {
      query.andWhere("p.cliente->>'razaoSocial' ILIKE :nome", {
        nome: `%${filtros.clienteNome}%`,
      });
    }

    if (filtros?.vendedor) {
      query.andWhere("p.vendedor->>'nome' ILIKE :vendedor", {
        vendedor: `%${filtros.vendedor}%`,
      });
    }

    if (filtros?.dataInicio) {
      query.andWhere('p.dataEmissao >= :dataInicio', { dataInicio: filtros.dataInicio });
    }

    if (filtros?.dataFim) {
      query.andWhere('p.dataEmissao <= :dataFim', { dataFim: filtros.dataFim });
    }

    return query.getMany();
  }

  async findOne(id: string): Promise<Proposta> {
    const proposta = await this.propostaRepository.findOne({
      where: { id },
      relations: ['itens'],
    });

    if (!proposta) {
      throw new NotFoundException(`Proposta #${id} não encontrada`);
    }

    return proposta;
  }

  async update(id: string, dto: UpdatePropostaDto): Promise<Proposta> {
    const proposta = await this.findOne(id);
    Object.assign(proposta, dto);
    await this.propostaRepository.save(proposta);
    return this.findOne(id);
  }

  async updateStatus(id: string, dto: UpdateStatusDto): Promise<Proposta> {
    const proposta = await this.findOne(id);

    proposta.status = dto.novoStatus;

    if (dto.novoStatus === StatusProposta.REJEITADA) {
      proposta.motivoRejeicao = dto.motivoRejeicao;
      proposta.dataRejeicao = new Date();
    }

    if (dto.novoStatus === StatusProposta.APROVADA) {
      proposta.dataAprovacao = new Date();
      proposta.aprovadoPor = dto.aprovadoPor;
    }

    await this.propostaRepository.save(proposta);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const proposta = await this.findOne(id);
    await this.propostaRepository.remove(proposta);
  }

  async clonar(id: string, userId: number): Promise<Proposta> {
    const original = await this.findOne(id);
    const numero = await this.gerarNumero();

    const clone = this.propostaRepository.create({
      numero,
      titulo: `${original.titulo} (Cópia)`,
      cliente: original.cliente,
      vendedor: original.vendedor,
      dataEmissao: new Date().toISOString().split('T')[0],
      dataValidade: original.dataValidade,
      previsaoEntrega: original.previsaoEntrega,
      orcamentoId: original.orcamentoId,
      subtotalItens: original.subtotalItens,
      valorTotal: original.valorTotal,
      moeda: original.moeda,
      pagamento: original.pagamento,
      observacoes: original.observacoes,
      status: StatusProposta.RASCUNHO,
      createdBy: userId,
    });

    const savedClone = await this.propostaRepository.save(clone);

    // Clonar itens
    if (original.itens && original.itens.length > 0) {
      const itens = original.itens.map((item) =>
        this.itemRepository.create({
          item: item.item,
          nome: item.nome,
          tipo: item.tipo,
          quantidade: item.quantidade,
          unidade: item.unidade,
          valorUnitario: item.valorUnitario,
          subtotal: item.subtotal,
          observacao: item.observacao,
          proposta_id: savedClone.id,
        }),
      );
      await this.itemRepository.save(itens);
    }

    return this.findOne(savedClone.id);
  }

  async getProximoNumero(): Promise<{ numero: string }> {
    const numero = await this.gerarNumero();
    return { numero };
  }

  async findByCliente(cnpj: string): Promise<Proposta[]> {
    return this.propostaRepository
      .createQueryBuilder('p')
      .where("p.cliente->>'cnpj' = :cnpj", { cnpj })
      .orderBy('p.createdAt', 'DESC')
      .getMany();
  }

  async vincularOrcamento(id: string, orcamentoId: string): Promise<Proposta> {
    const proposta = await this.findOne(id);
    proposta.orcamentoId = orcamentoId;
    await this.propostaRepository.save(proposta);
    return this.findOne(id);
  }

  // ==========================================
  // ITENS
  // ==========================================

  async createItem(propostaId: string, itemDto: {
    nome: string;
    tipo: 'produto' | 'servico';
    quantidade: number;
    unidade?: string;
    valorUnitario: number;
    observacao?: string;
  }): Promise<ItemProposta> {
    const proposta = await this.findOne(propostaId);

    const maxItem = proposta.itens.reduce((max, i) => Math.max(max, i.item), 0);

    const item = this.itemRepository.create({
      item: maxItem + 1,
      nome: itemDto.nome,
      tipo: itemDto.tipo as TipoItemProposta,
      quantidade: itemDto.quantidade,
      unidade: itemDto.unidade,
      valorUnitario: itemDto.valorUnitario,
      subtotal: itemDto.quantidade * itemDto.valorUnitario,
      observacao: itemDto.observacao,
      proposta_id: propostaId,
    });

    const savedItem = await this.itemRepository.save(item);

    // Recalcular subtotal da proposta
    await this.recalcularSubtotal(propostaId);

    return savedItem;
  }

  async updateItem(propostaId: string, itemId: string, itemDto: Partial<{
    nome: string;
    tipo: 'produto' | 'servico';
    quantidade: number;
    unidade?: string;
    valorUnitario: number;
    observacao?: string;
  }>): Promise<ItemProposta> {
    const item = await this.itemRepository.findOne({
      where: { id: itemId, proposta_id: propostaId },
    });

    if (!item) {
      throw new NotFoundException(`Item #${itemId} não encontrado`);
    }

    Object.assign(item, itemDto);

    if (itemDto.quantidade !== undefined || itemDto.valorUnitario !== undefined) {
      item.subtotal = item.quantidade * item.valorUnitario;
    }

    const savedItem = await this.itemRepository.save(item);

    // Recalcular subtotal da proposta
    await this.recalcularSubtotal(propostaId);

    return savedItem;
  }

  async removeItem(propostaId: string, itemId: string): Promise<void> {
    const item = await this.itemRepository.findOne({
      where: { id: itemId, proposta_id: propostaId },
    });

    if (!item) {
      throw new NotFoundException(`Item #${itemId} não encontrado`);
    }

    await this.itemRepository.remove(item);

    // Recalcular subtotal da proposta
    await this.recalcularSubtotal(propostaId);
  }

  private async recalcularSubtotal(propostaId: string): Promise<void> {
    const proposta = await this.findOne(propostaId);
    const subtotal = proposta.itens.reduce((sum, i) => sum + Number(i.subtotal), 0);
    proposta.subtotalItens = subtotal;
    await this.propostaRepository.save(proposta);
  }
}

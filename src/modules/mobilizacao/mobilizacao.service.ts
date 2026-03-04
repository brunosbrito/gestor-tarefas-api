import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Mobilizacao, TipoMobilizacao, CategoriaMobilizacao } from './entities/mobilizacao.entity';
import { CreateMobilizacaoDto } from './dto/create-mobilizacao.dto';
import { UpdateMobilizacaoDto } from './dto/update-mobilizacao.dto';

@Injectable()
export class MobilizacaoService {
  constructor(
    @InjectRepository(Mobilizacao)
    private readonly repository: Repository<Mobilizacao>,
  ) {}

  async create(dto: CreateMobilizacaoDto): Promise<Mobilizacao> {
    const item = this.repository.create(dto);
    return this.repository.save(item);
  }

  async findAll(filtros?: {
    busca?: string;
    tipo?: TipoMobilizacao;
    categoria?: CategoriaMobilizacao;
    ativo?: boolean;
  }): Promise<Mobilizacao[]> {
    const where: any = {};

    if (filtros?.ativo !== undefined) {
      where.ativo = filtros.ativo;
    }
    if (filtros?.tipo) {
      where.tipo = filtros.tipo;
    }
    if (filtros?.categoria) {
      where.categoria = filtros.categoria;
    }

    let items = await this.repository.find({
      where,
      order: { tipo: 'ASC', categoria: 'ASC', codigo: 'ASC' },
    });

    if (filtros?.busca) {
      const busca = filtros.busca.toLowerCase();
      items = items.filter(
        (i) =>
          i.codigo.toLowerCase().includes(busca) ||
          i.descricao.toLowerCase().includes(busca),
      );
    }

    return items;
  }

  async findOne(id: number): Promise<Mobilizacao> {
    const item = await this.repository.findOne({ where: { id } });
    if (!item) {
      throw new NotFoundException(`Item de mobilização #${id} não encontrado`);
    }
    return item;
  }

  async update(id: number, dto: UpdateMobilizacaoDto): Promise<Mobilizacao> {
    const item = await this.findOne(id);
    Object.assign(item, dto);
    return this.repository.save(item);
  }

  async toggleAtivo(id: number): Promise<Mobilizacao> {
    const item = await this.findOne(id);
    item.ativo = !item.ativo;
    return this.repository.save(item);
  }

  async remove(id: number): Promise<void> {
    const item = await this.findOne(id);
    await this.repository.remove(item);
  }

  async seed(): Promise<{ message: string; total: number }> {
    const count = await this.repository.count();
    if (count > 0) {
      return { message: 'Itens de mobilização já existem no banco', total: count };
    }

    const itens: CreateMobilizacaoDto[] = [
      // MOBILIZAÇÃO - TRANSPORTE
      { tipo: TipoMobilizacao.MOBILIZACAO, codigo: 'MOB-TR-001', descricao: 'Frete de equipamentos (até 100km)', categoria: CategoriaMobilizacao.TRANSPORTE, unidade: 'vb', precoUnitario: 2500.00, ativo: true },
      { tipo: TipoMobilizacao.MOBILIZACAO, codigo: 'MOB-TR-002', descricao: 'Frete de equipamentos (acima 100km)', categoria: CategoriaMobilizacao.TRANSPORTE, unidade: 'km', precoUnitario: 8.50, ativo: true },
      { tipo: TipoMobilizacao.MOBILIZACAO, codigo: 'MOB-TR-003', descricao: 'Transporte de pessoal', categoria: CategoriaMobilizacao.TRANSPORTE, unidade: 'vb', precoUnitario: 1500.00, ativo: true },

      // MOBILIZAÇÃO - CANTEIRO
      { tipo: TipoMobilizacao.MOBILIZACAO, codigo: 'MOB-CT-001', descricao: 'Container escritório 20"', categoria: CategoriaMobilizacao.MONTAGEM_CANTEIRO, unidade: 'mês', precoUnitario: 1200.00, ativo: true },
      { tipo: TipoMobilizacao.MOBILIZACAO, codigo: 'MOB-CT-002', descricao: 'Container almoxarifado 20"', categoria: CategoriaMobilizacao.MONTAGEM_CANTEIRO, unidade: 'mês', precoUnitario: 900.00, ativo: true },
      { tipo: TipoMobilizacao.MOBILIZACAO, codigo: 'MOB-CT-003', descricao: 'Banheiro químico', categoria: CategoriaMobilizacao.MONTAGEM_CANTEIRO, unidade: 'mês', precoUnitario: 350.00, ativo: true },
      { tipo: TipoMobilizacao.MOBILIZACAO, codigo: 'MOB-CT-004', descricao: 'Tapume metálico (m linear)', categoria: CategoriaMobilizacao.MONTAGEM_CANTEIRO, unidade: 'm', precoUnitario: 85.00, ativo: true },

      // MOBILIZAÇÃO - EQUIPAMENTOS
      { tipo: TipoMobilizacao.MOBILIZACAO, codigo: 'MOB-EQ-001', descricao: 'Gerador 100kVA', categoria: CategoriaMobilizacao.EQUIPAMENTOS, unidade: 'mês', precoUnitario: 4500.00, ativo: true },
      { tipo: TipoMobilizacao.MOBILIZACAO, codigo: 'MOB-EQ-002', descricao: 'Compressor de ar 350pcm', categoria: CategoriaMobilizacao.EQUIPAMENTOS, unidade: 'mês', precoUnitario: 3200.00, ativo: true },
      { tipo: TipoMobilizacao.MOBILIZACAO, codigo: 'MOB-EQ-003', descricao: 'Máquina de solda', categoria: CategoriaMobilizacao.EQUIPAMENTOS, unidade: 'mês', precoUnitario: 800.00, ativo: true },

      // DESMOBILIZAÇÃO
      { tipo: TipoMobilizacao.DESMOBILIZACAO, codigo: 'DESMOB-TR-001', descricao: 'Frete retorno equipamentos (até 100km)', categoria: CategoriaMobilizacao.TRANSPORTE, unidade: 'vb', precoUnitario: 2500.00, ativo: true },
      { tipo: TipoMobilizacao.DESMOBILIZACAO, codigo: 'DESMOB-TR-002', descricao: 'Frete retorno equipamentos (acima 100km)', categoria: CategoriaMobilizacao.TRANSPORTE, unidade: 'km', precoUnitario: 8.50, ativo: true },
      { tipo: TipoMobilizacao.DESMOBILIZACAO, codigo: 'DESMOB-CT-001', descricao: 'Desmontagem de canteiro', categoria: CategoriaMobilizacao.MONTAGEM_CANTEIRO, unidade: 'vb', precoUnitario: 1500.00, ativo: true },
      { tipo: TipoMobilizacao.DESMOBILIZACAO, codigo: 'DESMOB-OUT-001', descricao: 'Limpeza final da área', categoria: CategoriaMobilizacao.OUTROS, unidade: 'vb', precoUnitario: 800.00, ativo: true },
    ];

    for (const dto of itens) {
      await this.create(dto);
    }

    return { message: 'Itens de mobilização inseridos com sucesso', total: itens.length };
  }
}

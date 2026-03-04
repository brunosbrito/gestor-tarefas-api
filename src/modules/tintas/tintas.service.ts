import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tinta, TipoTinta } from './entities/tinta.entity';
import { CreateTintaDto } from './dto/create-tinta.dto';
import { UpdateTintaDto } from './dto/update-tinta.dto';

@Injectable()
export class TintasService {
  constructor(
    @InjectRepository(Tinta)
    private readonly repository: Repository<Tinta>,
  ) {}

  async create(dto: CreateTintaDto): Promise<Tinta> {
    const tinta = this.repository.create(dto);
    return this.repository.save(tinta);
  }

  async findAll(filtros?: {
    busca?: string;
    tipo?: TipoTinta;
    fornecedor?: string;
    ativo?: boolean;
  }): Promise<Tinta[]> {
    const where: any = {};

    if (filtros?.ativo !== undefined) {
      where.ativo = filtros.ativo;
    }
    if (filtros?.tipo) {
      where.tipo = filtros.tipo;
    }
    if (filtros?.fornecedor) {
      where.fornecedor = filtros.fornecedor;
    }

    let tintas = await this.repository.find({
      where,
      order: { codigo: 'ASC' },
    });

    if (filtros?.busca) {
      const busca = filtros.busca.toLowerCase();
      tintas = tintas.filter(
        (t) =>
          t.codigo.toLowerCase().includes(busca) ||
          t.descricao.toLowerCase().includes(busca),
      );
    }

    return tintas;
  }

  async findOne(id: number): Promise<Tinta> {
    const tinta = await this.repository.findOne({ where: { id } });
    if (!tinta) {
      throw new NotFoundException(`Tinta ${id} não encontrada`);
    }
    return tinta;
  }

  async findByTipo(tipo: TipoTinta): Promise<Tinta[]> {
    return this.repository.find({
      where: { tipo, ativo: true },
      order: { codigo: 'ASC' },
    });
  }

  async update(id: number, dto: UpdateTintaDto): Promise<Tinta> {
    const tinta = await this.findOne(id);
    Object.assign(tinta, dto);
    return this.repository.save(tinta);
  }

  async remove(id: number): Promise<void> {
    const tinta = await this.findOne(id);
    tinta.ativo = false;
    await this.repository.save(tinta);
  }

  async seed(): Promise<{ message: string; total: number }> {
    const count = await this.repository.count();
    if (count > 0) {
      return { message: 'Tintas já existem no banco', total: count };
    }

    const tintas: Partial<Tinta>[] = [
      // PRIMERS
      {
        codigo: 'PR-ZN-01',
        descricao: 'Primer Epóxi Rico em Zinco - Sherwin Williams',
        tipo: TipoTinta.PRIMER,
        solidosVolume: 65,
        precoLitro: 85.90,
        fornecedor: 'Sherwin Williams',
        observacoes: 'Primer de alta performance para proteção catódica',
      },
      {
        codigo: 'PR-ZN-02',
        descricao: 'Primer Zinco Etil Silicato - WEG',
        tipo: TipoTinta.PRIMER,
        solidosVolume: 70,
        precoLitro: 92.50,
        fornecedor: 'WEG Tintas',
        observacoes: 'Excelente resistência à corrosão',
      },
      {
        codigo: 'PR-EP-01',
        descricao: 'Primer Epóxi Óxido de Ferro - Renner',
        tipo: TipoTinta.PRIMER,
        solidosVolume: 55,
        precoLitro: 58.90,
        fornecedor: 'Renner',
        observacoes: 'Primer universal para estruturas metálicas',
      },
      {
        codigo: 'PR-EP-02',
        descricao: 'Primer Epóxi Fosfato de Zinco - International',
        tipo: TipoTinta.PRIMER,
        solidosVolume: 60,
        precoLitro: 78.50,
        fornecedor: 'International',
        observacoes: 'Alta aderência em superfícies jateadas',
      },
      {
        codigo: 'PR-AL-01',
        descricao: 'Primer Alquídico Antiferrugem - Suvinil',
        tipo: TipoTinta.PRIMER,
        solidosVolume: 45,
        precoLitro: 42.90,
        fornecedor: 'Suvinil',
        observacoes: 'Uso interno, baixa agressividade',
      },

      // ACABAMENTOS
      {
        codigo: 'AC-EP-01',
        descricao: 'Esmalte Epóxi Brilhante - Sherwin Williams',
        tipo: TipoTinta.ACABAMENTO,
        solidosVolume: 55,
        precoLitro: 68.90,
        fornecedor: 'Sherwin Williams',
        observacoes: 'Acabamento de alta durabilidade',
      },
      {
        codigo: 'AC-EP-02',
        descricao: 'Esmalte Epóxi Fosco - WEG',
        tipo: TipoTinta.ACABAMENTO,
        solidosVolume: 52,
        precoLitro: 65.50,
        fornecedor: 'WEG Tintas',
        observacoes: 'Acabamento fosco industrial',
      },
      {
        codigo: 'AC-PU-01',
        descricao: 'Esmalte Poliuretano Brilhante - Renner',
        tipo: TipoTinta.ACABAMENTO,
        solidosVolume: 50,
        precoLitro: 95.90,
        fornecedor: 'Renner',
        observacoes: 'Alta resistência UV, uso externo',
      },
      {
        codigo: 'AC-PU-02',
        descricao: 'Esmalte Poliuretano Acetinado - International',
        tipo: TipoTinta.ACABAMENTO,
        solidosVolume: 48,
        precoLitro: 102.50,
        fornecedor: 'International',
        observacoes: 'Premium, excelente retenção de cor',
      },
      {
        codigo: 'AC-AL-01',
        descricao: 'Esmalte Sintético Brilhante - Suvinil',
        tipo: TipoTinta.ACABAMENTO,
        solidosVolume: 42,
        precoLitro: 38.90,
        fornecedor: 'Suvinil',
        observacoes: 'Uso geral, secagem rápida',
      },

      // SOLVENTES
      {
        codigo: 'SV-TN-01',
        descricao: 'Thinner para Epóxi - Sherwin Williams',
        tipo: TipoTinta.SOLVENTE,
        solidosVolume: 0,
        precoLitro: 28.90,
        fornecedor: 'Sherwin Williams',
        observacoes: 'Diluente específico para tintas epóxi',
      },
      {
        codigo: 'SV-TN-02',
        descricao: 'Thinner para Poliuretano - WEG',
        tipo: TipoTinta.SOLVENTE,
        solidosVolume: 0,
        precoLitro: 32.50,
        fornecedor: 'WEG Tintas',
        observacoes: 'Diluente específico para PU',
      },
      {
        codigo: 'SV-AG-01',
        descricao: 'Aguarrás Mineral - Itaqua',
        tipo: TipoTinta.SOLVENTE,
        solidosVolume: 0,
        precoLitro: 18.90,
        fornecedor: 'Itaqua',
        observacoes: 'Uso geral para tintas alquídicas',
      },
      {
        codigo: 'SV-XL-01',
        descricao: 'Xilol (Xileno) Industrial',
        tipo: TipoTinta.SOLVENTE,
        solidosVolume: 0,
        precoLitro: 22.50,
        fornecedor: 'Itaqua',
        observacoes: 'Solvente industrial multiuso',
      },
    ];

    await this.repository.save(tintas.map((t) => this.repository.create(t)));

    return { message: 'Tintas inseridas com sucesso', total: tintas.length };
  }
}

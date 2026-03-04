import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Epi } from './entities/epi.entity';
import { CreateEpiDto } from './dto/create-epi.dto';
import { UpdateEpiDto } from './dto/update-epi.dto';

@Injectable()
export class EpisService {
  constructor(
    @InjectRepository(Epi)
    private readonly repository: Repository<Epi>,
  ) {}

  async create(dto: CreateEpiDto): Promise<Epi> {
    const epi = this.repository.create(dto);
    return this.repository.save(epi);
  }

  async findAll(filtros?: {
    busca?: string;
    ativo?: boolean;
  }): Promise<Epi[]> {
    const where: any = {};

    if (filtros?.ativo !== undefined) {
      where.ativo = filtros.ativo;
    }

    let epis = await this.repository.find({
      where,
      order: { descricao: 'ASC' },
    });

    if (filtros?.busca) {
      const busca = filtros.busca.toLowerCase();
      epis = epis.filter(
        (e) =>
          e.descricao.toLowerCase().includes(busca) ||
          (e.ca && e.ca.toLowerCase().includes(busca)) ||
          (e.fabricante && e.fabricante.toLowerCase().includes(busca)),
      );
    }

    return epis;
  }

  async findOne(id: string): Promise<Epi> {
    const epi = await this.repository.findOne({ where: { id } });
    if (!epi) {
      throw new NotFoundException(`EPI ${id} não encontrado`);
    }
    return epi;
  }

  async update(id: string, dto: UpdateEpiDto): Promise<Epi> {
    const epi = await this.findOne(id);
    Object.assign(epi, dto);
    return this.repository.save(epi);
  }

  async toggleAtivo(id: string): Promise<Epi> {
    const epi = await this.findOne(id);
    epi.ativo = !epi.ativo;
    return this.repository.save(epi);
  }

  async remove(id: string): Promise<void> {
    const epi = await this.findOne(id);
    await this.repository.remove(epi);
  }

  async reajustarPrecos(
    tipo: 'percentual' | 'fixo',
    valor: number,
    escopo: 'todos' | 'ativos',
  ): Promise<number> {
    const where: any = {};
    if (escopo === 'ativos') {
      where.ativo = true;
    }

    const epis = await this.repository.find({ where });
    let count = 0;

    for (const epi of epis) {
      const novoValor =
        tipo === 'percentual'
          ? Number(epi.valorReferencia) * (1 + valor / 100)
          : Number(epi.valorReferencia) + valor;

      epi.valorReferencia = Math.max(0, Math.round(novoValor * 100) / 100);
      await this.repository.save(epi);
      count++;
    }

    return count;
  }

  async importar(dados: CreateEpiDto[], substituir: boolean): Promise<number> {
    if (substituir) {
      await this.repository.clear();
    }

    for (const dto of dados) {
      await this.create(dto);
    }

    return dados.length;
  }

  async seed(): Promise<{ message: string; total: number }> {
    const count = await this.repository.count();
    if (count > 0) {
      return { message: 'EPIs já existem no banco', total: count };
    }

    const episData: CreateEpiDto[] = [
      { descricao: 'Luva de raspa cano curto', unidade: 'par', ca: '12345', fabricante: 'Delta Plus', valorReferencia: 25.00 },
      { descricao: 'Luva de vaqueta mista', unidade: 'par', ca: '23456', fabricante: 'Vonder', valorReferencia: 35.00 },
      { descricao: 'Óculos de proteção incolor', unidade: 'un', ca: '34567', fabricante: '3M', valorReferencia: 15.00 },
      { descricao: 'Óculos de proteção fumê', unidade: 'un', ca: '34568', fabricante: '3M', valorReferencia: 18.00 },
      { descricao: 'Protetor auricular plug', unidade: 'par', ca: '45678', fabricante: '3M', valorReferencia: 8.00 },
      { descricao: 'Protetor auricular concha', unidade: 'un', ca: '45679', fabricante: 'MSA', valorReferencia: 45.00 },
      { descricao: 'Capacete classe A', unidade: 'un', ca: '56789', fabricante: 'MSA', valorReferencia: 55.00 },
      { descricao: 'Botina bico de aço', unidade: 'par', ca: '67890', fabricante: 'Marluvas', valorReferencia: 180.00 },
      { descricao: 'Avental de raspa', unidade: 'un', ca: '78901', fabricante: 'Delta Plus', valorReferencia: 65.00 },
      { descricao: 'Mangote de raspa', unidade: 'par', ca: '89012', fabricante: 'Delta Plus', valorReferencia: 35.00 },
      { descricao: 'Máscara respiradora PFF2', unidade: 'un', ca: '90123', fabricante: '3M', valorReferencia: 12.00 },
      { descricao: 'Cinto de segurança tipo paraquedista', unidade: 'un', ca: '01234', fabricante: 'Hércules', valorReferencia: 350.00 },
      { descricao: 'Talabarte Y com ABS', unidade: 'un', ca: '11234', fabricante: 'Hércules', valorReferencia: 280.00 },
      { descricao: 'Trava-quedas retrátil 3m', unidade: 'un', ca: '21234', fabricante: 'MSA', valorReferencia: 1200.00 },
    ];

    for (const dto of episData) {
      await this.create(dto);
    }

    return { message: 'EPIs inseridos com sucesso', total: episData.length };
  }
}

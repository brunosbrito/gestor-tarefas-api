import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Fornecedor, TipoFornecedor } from './entities/fornecedor.entity';
import { CreateFornecedorDto } from './dto/create-fornecedor.dto';
import { UpdateFornecedorDto } from './dto/update-fornecedor.dto';

@Injectable()
export class FornecedoresService {
  constructor(
    @InjectRepository(Fornecedor)
    private readonly repository: Repository<Fornecedor>,
  ) {}

  async create(dto: CreateFornecedorDto): Promise<Fornecedor> {
    const fornecedor = this.repository.create(dto);
    return this.repository.save(fornecedor);
  }

  async findAll(filtros?: {
    busca?: string;
    tipo?: TipoFornecedor;
    ativo?: boolean;
  }): Promise<Fornecedor[]> {
    const where: any = {};

    if (filtros?.ativo !== undefined) {
      where.ativo = filtros.ativo;
    }
    if (filtros?.tipo) {
      where.tipo = filtros.tipo;
    }

    let fornecedores = await this.repository.find({
      where,
      order: { razaoSocial: 'ASC' },
    });

    if (filtros?.busca) {
      const busca = filtros.busca.toLowerCase();
      fornecedores = fornecedores.filter(
        (f) =>
          f.razaoSocial.toLowerCase().includes(busca) ||
          (f.nomeFantasia && f.nomeFantasia.toLowerCase().includes(busca)) ||
          f.cnpj.includes(busca),
      );
    }

    return fornecedores;
  }

  async findOne(id: number): Promise<Fornecedor> {
    const fornecedor = await this.repository.findOne({ where: { id } });
    if (!fornecedor) {
      throw new NotFoundException(`Fornecedor ${id} não encontrado`);
    }
    return fornecedor;
  }

  async findByCnpj(cnpj: string): Promise<Fornecedor> {
    const fornecedor = await this.repository.findOne({ where: { cnpj } });
    if (!fornecedor) {
      throw new NotFoundException(`Fornecedor com CNPJ ${cnpj} não encontrado`);
    }
    return fornecedor;
  }

  async findByTipo(tipo: TipoFornecedor): Promise<Fornecedor[]> {
    return this.repository.find({
      where: { tipo, ativo: true },
      order: { razaoSocial: 'ASC' },
    });
  }

  async update(id: number, dto: UpdateFornecedorDto): Promise<Fornecedor> {
    const fornecedor = await this.findOne(id);
    Object.assign(fornecedor, dto);
    return this.repository.save(fornecedor);
  }

  async remove(id: number): Promise<void> {
    const fornecedor = await this.findOne(id);
    fornecedor.ativo = false;
    await this.repository.save(fornecedor);
  }

  async seed(): Promise<{ message: string; total: number }> {
    const count = await this.repository.count();
    if (count > 0) {
      return { message: 'Fornecedores já existem no banco', total: count };
    }

    const fornecedores: Partial<Fornecedor>[] = [
      // MATERIAIS
      {
        cnpj: '33.611.500/0001-19',
        razaoSocial: 'Gerdau Aços Longos S.A.',
        nomeFantasia: 'Gerdau',
        tipo: TipoFornecedor.MATERIAL,
        cidade: 'Porto Alegre',
        uf: 'RS',
        telefone: '(51) 3323-2000',
        email: 'comercial@gerdau.com.br',
        prazoEntregaDias: 15,
        condicaoPagamento: '28 DDL',
        observacoes: 'Fornecedor principal de perfis e barras',
      },
      {
        cnpj: '61.088.894/0001-08',
        razaoSocial: 'Açotel Comércio de Aço Ltda.',
        nomeFantasia: 'Açotel',
        tipo: TipoFornecedor.MATERIAL,
        cidade: 'São Paulo',
        uf: 'SP',
        telefone: '(11) 2291-1000',
        email: 'vendas@acotel.com.br',
        prazoEntregaDias: 10,
        condicaoPagamento: '30/60 dias',
        observacoes: 'Tubos e telhas',
      },
      {
        cnpj: '89.724.586/0001-60',
        razaoSocial: 'Ciser Parafusos e Porcas S.A.',
        nomeFantasia: 'Ciser',
        tipo: TipoFornecedor.MATERIAL,
        cidade: 'Joinville',
        uf: 'SC',
        telefone: '(47) 3441-5000',
        email: 'vendas@ciser.com.br',
        prazoEntregaDias: 7,
        condicaoPagamento: '30 dias',
        observacoes: 'Fixadores e parafusos',
      },

      // TINTAS
      {
        cnpj: '62.143.450/0001-15',
        razaoSocial: 'Sherwin-Williams do Brasil Ind. e Com. Ltda.',
        nomeFantasia: 'Sherwin Williams',
        tipo: TipoFornecedor.TINTA,
        cidade: 'São Paulo',
        uf: 'SP',
        telefone: '(11) 3053-7200',
        email: 'industrial@sherwin.com.br',
        prazoEntregaDias: 10,
        condicaoPagamento: '30/60 dias',
        observacoes: 'Tintas industriais premium',
      },
      {
        cnpj: '84.429.752/0001-23',
        razaoSocial: 'WEG Tintas Ltda.',
        nomeFantasia: 'WEG Tintas',
        tipo: TipoFornecedor.TINTA,
        cidade: 'Guaramirim',
        uf: 'SC',
        telefone: '(47) 3372-4000',
        email: 'tintas@weg.net',
        prazoEntregaDias: 12,
        condicaoPagamento: '30 dias',
        observacoes: 'Tintas e revestimentos industriais',
      },
      {
        cnpj: '92.781.335/0001-02',
        razaoSocial: 'Renner Herrmann S.A.',
        nomeFantasia: 'Renner',
        tipo: TipoFornecedor.TINTA,
        cidade: 'Gravataí',
        uf: 'RS',
        telefone: '(51) 3489-9500',
        email: 'tintas@rennerherrmann.com.br',
        prazoEntregaDias: 8,
        condicaoPagamento: '28 dias',
        observacoes: 'Tintas e vernizes industriais',
      },

      // CONSUMÍVEIS
      {
        cnpj: '59.283.127/0001-90',
        razaoSocial: 'ESAB Indústria e Comércio Ltda.',
        nomeFantasia: 'ESAB',
        tipo: TipoFornecedor.CONSUMIVEL,
        cidade: 'Contagem',
        uf: 'MG',
        telefone: '(31) 2191-9000',
        email: 'vendas@esab.com.br',
        prazoEntregaDias: 5,
        condicaoPagamento: '30 dias',
        observacoes: 'Consumíveis de soldagem',
      },
      {
        cnpj: '61.065.298/0001-04',
        razaoSocial: 'Norton Abrasivos Ltda.',
        nomeFantasia: 'Norton',
        tipo: TipoFornecedor.CONSUMIVEL,
        cidade: 'Guarulhos',
        uf: 'SP',
        telefone: '(11) 2464-4800',
        email: 'atendimento@saint-gobain.com',
        prazoEntregaDias: 5,
        condicaoPagamento: '30 dias',
        observacoes: 'Abrasivos e discos',
      },
      {
        cnpj: '35.820.448/0001-10',
        razaoSocial: 'White Martins Gases Industriais Ltda.',
        nomeFantasia: 'White Martins',
        tipo: TipoFornecedor.CONSUMIVEL,
        cidade: 'Rio de Janeiro',
        uf: 'RJ',
        telefone: '(21) 2131-1212',
        email: 'gases@whitemartins.com.br',
        prazoEntregaDias: 3,
        condicaoPagamento: '15 dias',
        observacoes: 'Gases industriais',
      },

      // EQUIPAMENTOS
      {
        cnpj: '60.389.127/0001-46',
        razaoSocial: 'Stanley Black & Decker Brasil Ltda.',
        nomeFantasia: 'DeWalt',
        tipo: TipoFornecedor.EQUIPAMENTO,
        cidade: 'Uberaba',
        uf: 'MG',
        telefone: '(34) 3318-3700',
        email: 'vendas@sbdinc.com',
        prazoEntregaDias: 10,
        condicaoPagamento: '30/60 dias',
        observacoes: 'Ferramentas elétricas profissionais',
      },
      {
        cnpj: '61.089.869/0001-00',
        razaoSocial: 'Robert Bosch Ltda.',
        nomeFantasia: 'Bosch',
        tipo: TipoFornecedor.EQUIPAMENTO,
        cidade: 'Campinas',
        uf: 'SP',
        telefone: '(19) 2103-1000',
        email: 'ferramentas@bosch.com.br',
        prazoEntregaDias: 10,
        condicaoPagamento: '30 dias',
        observacoes: 'Ferramentas elétricas e medição',
      },

      // SERVIÇOS
      {
        cnpj: '12.345.678/0001-90',
        razaoSocial: 'Jato Pintura Industrial Ltda.',
        nomeFantasia: 'JPI Jateamento',
        tipo: TipoFornecedor.SERVICO,
        cidade: 'Contagem',
        uf: 'MG',
        telefone: '(31) 3391-2000',
        email: 'comercial@jpi.com.br',
        prazoEntregaDias: 0,
        condicaoPagamento: '30 dias',
        observacoes: 'Serviço de jateamento e pintura',
      },
      {
        cnpj: '23.456.789/0001-12',
        razaoSocial: 'Transporte Pesado Brasil Ltda.',
        nomeFantasia: 'TPB Transportes',
        tipo: TipoFornecedor.SERVICO,
        cidade: 'Betim',
        uf: 'MG',
        telefone: '(31) 3592-1500',
        email: 'logistica@tpb.com.br',
        prazoEntregaDias: 0,
        condicaoPagamento: '15 dias',
        observacoes: 'Transporte de cargas especiais',
      },

      // LOCAÇÃO
      {
        cnpj: '34.567.890/0001-23',
        razaoSocial: 'Mills Estruturas e Serviços Ltda.',
        nomeFantasia: 'Mills',
        tipo: TipoFornecedor.LOCACAO,
        cidade: 'Rio de Janeiro',
        uf: 'RJ',
        telefone: '(21) 2121-8000',
        email: 'locacao@mills.com.br',
        prazoEntregaDias: 2,
        condicaoPagamento: 'Mensal',
        observacoes: 'Locação de plataformas e andaimes',
      },
      {
        cnpj: '45.678.901/0001-34',
        razaoSocial: 'Sotreq S.A.',
        nomeFantasia: 'Sotreq',
        tipo: TipoFornecedor.LOCACAO,
        cidade: 'Belo Horizonte',
        uf: 'MG',
        telefone: '(31) 2121-9000',
        email: 'rental@sotreq.com.br',
        prazoEntregaDias: 3,
        condicaoPagamento: 'Mensal',
        observacoes: 'Locação de equipamentos pesados',
      },
    ];

    await this.repository.save(fornecedores.map((f) => this.repository.create(f)));

    return { message: 'Fornecedores inseridos com sucesso', total: fornecedores.length };
  }
}

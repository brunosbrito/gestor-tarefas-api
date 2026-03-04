import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Cargo,
  CategoriaCargo,
  GrauInsalubridade,
  CustosDiversos,
  DEFAULT_CUSTOS,
} from './entities/cargo.entity';
import { CreateCargoDto } from './dto/create-cargo.dto';
import { UpdateCargoDto } from './dto/update-cargo.dto';

// Constantes de cálculo
const CALCULOS_MO = {
  INSALUBRIDADE: {
    nenhum: 0,
    minimo: 0.10,
    medio: 0.20,
    maximo: 0.40,
  },
  PERICULOSIDADE: 0.30,
  ENCARGOS_PADRAO: 0.587,
  SALARIO_MINIMO_REF: 1412.00, // Salário mínimo 2024
};

@Injectable()
export class CargosService {
  constructor(
    @InjectRepository(Cargo)
    private readonly repository: Repository<Cargo>,
  ) {}

  /**
   * Calcula o total de um custo composto rateado (uniforme, EPI)
   */
  private calcularCustoRateado(custo: { itens: any[]; periodoMeses: number }): number {
    if (!custo?.itens?.length) return 0;
    const totalItens = custo.itens.reduce(
      (sum, item) => sum + (item.quantidade * item.valorUnitario),
      0
    );
    return totalItens / (custo.periodoMeses || 1);
  }

  /**
   * Calcula o custo admissional rateado
   */
  private calcularCustoAdmissional(custo: { valorPorEvento: number; periodoMeses: number }): number {
    if (!custo) return 0;
    const eventos = custo.periodoMeses < 12 ? 2 : 3;
    return (custo.valorPorEvento * eventos) / (custo.periodoMeses || 1);
  }

  /**
   * Calcula todos os campos derivados do cargo
   */
  private calcularCampos(cargo: Cargo): void {
    const custos = cargo.custos || DEFAULT_CUSTOS;

    // B) Valor da Periculosidade (30% do salário base se ativo)
    cargo.valorPericulosidade = cargo.temPericulosidade
      ? Number(cargo.salarioBase) * CALCULOS_MO.PERICULOSIDADE
      : 0;

    // C) Valor da Insalubridade (baseado no salário mínimo)
    const percInsalubridade = CALCULOS_MO.INSALUBRIDADE[cargo.grauInsalubridade] || 0;
    cargo.valorInsalubridade = CALCULOS_MO.SALARIO_MINIMO_REF * percInsalubridade;

    // D) Total do Salário (A + B + C)
    cargo.totalSalario = Number(cargo.salarioBase) + cargo.valorPericulosidade + cargo.valorInsalubridade;

    // E) Encargos Sociais (percentual sobre total do salário)
    cargo.valorEncargos = cargo.totalSalario * CALCULOS_MO.ENCARGOS_PADRAO;

    // F) Total de Custos Diversos
    const alimentacaoTotal = custos.alimentacao
      ? (custos.alimentacao.cafeManha || 0) +
        (custos.alimentacao.almoco || 0) +
        (custos.alimentacao.janta || 0) +
        (custos.alimentacao.cestaBasica || 0)
      : 0;

    const uniformeRateado = this.calcularCustoRateado(custos.uniforme);
    const admissionalRateado = this.calcularCustoAdmissional(custos.despesasAdmissionais);
    const epiRateado = this.calcularCustoRateado(custos.epiEpc);

    cargo.totalCustosDiversos =
      alimentacaoTotal +
      (custos.transporte || 0) +
      uniformeRateado +
      admissionalRateado +
      (custos.assistenciaMedica || 0) +
      epiRateado +
      (custos.outros || 0);

    // H) Total dos custos de mão-de-obra sem BDI (D + E + F)
    cargo.totalCustosMO = cargo.totalSalario + cargo.valorEncargos + cargo.totalCustosDiversos;

    // Custo HH (H / G)
    cargo.custoHH = cargo.horasMes > 0 ? cargo.totalCustosMO / cargo.horasMes : 0;

    // Arredondar todos os valores para 2 casas decimais
    cargo.valorPericulosidade = Math.round(cargo.valorPericulosidade * 100) / 100;
    cargo.valorInsalubridade = Math.round(cargo.valorInsalubridade * 100) / 100;
    cargo.totalSalario = Math.round(cargo.totalSalario * 100) / 100;
    cargo.valorEncargos = Math.round(cargo.valorEncargos * 100) / 100;
    cargo.totalCustosDiversos = Math.round(cargo.totalCustosDiversos * 100) / 100;
    cargo.totalCustosMO = Math.round(cargo.totalCustosMO * 100) / 100;
    cargo.custoHH = Math.round(cargo.custoHH * 100) / 100;
  }

  async create(dto: CreateCargoDto): Promise<Cargo> {
    const cargo = this.repository.create({
      ...dto,
      custos: dto.custos || DEFAULT_CUSTOS,
    });
    this.calcularCampos(cargo);
    return this.repository.save(cargo);
  }

  async findAll(filtros?: {
    busca?: string;
    categoria?: CategoriaCargo;
    ativo?: boolean;
  }): Promise<Cargo[]> {
    const where: any = {};

    if (filtros?.ativo !== undefined) {
      where.ativo = filtros.ativo;
    }
    if (filtros?.categoria) {
      where.categoria = filtros.categoria;
    }

    let cargos = await this.repository.find({
      where,
      order: { categoria: 'ASC', nome: 'ASC' },
    });

    if (filtros?.busca) {
      const busca = filtros.busca.toLowerCase();
      cargos = cargos.filter(
        (c) =>
          c.nome.toLowerCase().includes(busca) ||
          (c.nivel && c.nivel.toLowerCase().includes(busca)),
      );
    }

    return cargos;
  }

  async findOne(id: string): Promise<Cargo> {
    const cargo = await this.repository.findOne({ where: { id } });
    if (!cargo) {
      throw new NotFoundException(`Cargo ${id} não encontrado`);
    }
    return cargo;
  }

  async findByCategoria(categoria: CategoriaCargo): Promise<Cargo[]> {
    return this.repository.find({
      where: { categoria, ativo: true },
      order: { nome: 'ASC' },
    });
  }

  async update(id: string, dto: UpdateCargoDto): Promise<Cargo> {
    const cargo = await this.findOne(id);
    Object.assign(cargo, dto);
    this.calcularCampos(cargo);
    return this.repository.save(cargo);
  }

  async remove(id: string): Promise<void> {
    const cargo = await this.findOne(id);
    cargo.ativo = false;
    await this.repository.save(cargo);
  }

  async hardDelete(id: string): Promise<void> {
    const cargo = await this.findOne(id);
    await this.repository.remove(cargo);
  }

  async seed(): Promise<{ message: string; total: number }> {
    const count = await this.repository.count();
    if (count > 0) {
      return { message: 'Cargos já existem no banco', total: count };
    }

    const custosProducao: CustosDiversos = {
      alimentacao: { cafeManha: 3.50, almoco: 18.00, janta: 0, cestaBasica: 200.00 },
      transporte: 220.00,
      uniforme: {
        itens: [
          { descricao: 'Calça jeans', quantidade: 2, valorUnitario: 85.00 },
          { descricao: 'Camisa manga longa', quantidade: 3, valorUnitario: 65.00 },
          { descricao: 'Botina de segurança', quantidade: 1, valorUnitario: 180.00 },
        ],
        periodoMeses: 12,
      },
      despesasAdmissionais: { valorPorEvento: 500, periodoMeses: 24 },
      assistenciaMedica: 150.00,
      epiEpc: {
        itens: [
          { descricao: 'Luvas de raspa', quantidade: 12, valorUnitario: 25.00 },
          { descricao: 'Óculos de proteção', quantidade: 4, valorUnitario: 15.00 },
          { descricao: 'Protetor auricular', quantidade: 6, valorUnitario: 8.00 },
        ],
        periodoMeses: 12,
      },
      outros: 50.00,
    };

    const cargosData = [
      // FABRICAÇÃO
      { nome: 'Soldador', nivel: 'I', salarioBase: 3200, categoria: CategoriaCargo.FABRICACAO, temPericulosidade: true, grauInsalubridade: GrauInsalubridade.NENHUM, custos: custosProducao },
      { nome: 'Soldador', nivel: 'II', salarioBase: 4200, categoria: CategoriaCargo.FABRICACAO, temPericulosidade: true, grauInsalubridade: GrauInsalubridade.NENHUM, custos: custosProducao },
      { nome: 'Soldador', nivel: 'III', salarioBase: 5500, categoria: CategoriaCargo.FABRICACAO, temPericulosidade: true, grauInsalubridade: GrauInsalubridade.NENHUM, custos: custosProducao },
      { nome: 'Caldeireiro', nivel: 'I', salarioBase: 3500, categoria: CategoriaCargo.FABRICACAO, temPericulosidade: true, grauInsalubridade: GrauInsalubridade.NENHUM, custos: custosProducao },
      { nome: 'Caldeireiro', nivel: 'II', salarioBase: 4500, categoria: CategoriaCargo.FABRICACAO, temPericulosidade: true, grauInsalubridade: GrauInsalubridade.NENHUM, custos: custosProducao },
      { nome: 'Auxiliar de Produção', nivel: null, salarioBase: 2200, categoria: CategoriaCargo.FABRICACAO, temPericulosidade: false, grauInsalubridade: GrauInsalubridade.NENHUM, custos: custosProducao },

      // MONTAGEM
      { nome: 'Montador', nivel: 'I', salarioBase: 3500, categoria: CategoriaCargo.MONTAGEM, temPericulosidade: true, grauInsalubridade: GrauInsalubridade.NENHUM, custos: custosProducao },
      { nome: 'Montador', nivel: 'II', salarioBase: 4500, categoria: CategoriaCargo.MONTAGEM, temPericulosidade: true, grauInsalubridade: GrauInsalubridade.NENHUM, custos: custosProducao },
      { nome: 'Montador', nivel: 'III', salarioBase: 5800, categoria: CategoriaCargo.MONTAGEM, temPericulosidade: true, grauInsalubridade: GrauInsalubridade.NENHUM, custos: custosProducao },
      { nome: 'Rigger', nivel: null, salarioBase: 4200, categoria: CategoriaCargo.MONTAGEM, temPericulosidade: true, grauInsalubridade: GrauInsalubridade.NENHUM, custos: custosProducao },

      // AMBOS
      { nome: 'Encarregado', nivel: null, salarioBase: 7000, categoria: CategoriaCargo.AMBOS, temPericulosidade: true, grauInsalubridade: GrauInsalubridade.NENHUM, custos: custosProducao },
    ];

    const cargos = cargosData.map((data) => {
      const cargo = this.repository.create({
        ...data,
        horasMes: 220,
        ativo: true,
      });
      this.calcularCampos(cargo);
      return cargo;
    });

    await this.repository.save(cargos);

    return { message: 'Cargos inseridos com sucesso', total: cargos.length };
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ferramenta, TipoFerramenta } from './entities/ferramenta.entity';
import { CreateFerramentaDto } from './dto/create-ferramenta.dto';
import { UpdateFerramentaDto } from './dto/update-ferramenta.dto';

@Injectable()
export class FerramentasService {
  constructor(
    @InjectRepository(Ferramenta)
    private readonly repository: Repository<Ferramenta>,
  ) {}

  private calcularCustos(valorAquisicao: number, vidaUtilMeses: number) {
    const custoMensal = Math.round((valorAquisicao / vidaUtilMeses) * 100) / 100;
    const custoDiario = Math.round((custoMensal / 22) * 100) / 100;
    return { custoMensal, custoDiario };
  }

  async create(dto: CreateFerramentaDto): Promise<Ferramenta> {
    const ferramenta = this.repository.create(dto);
    const { custoMensal, custoDiario } = this.calcularCustos(
      dto.valorAquisicao,
      dto.vidaUtilMeses || 24,
    );
    ferramenta.custoMensal = custoMensal;
    ferramenta.custoDiario = custoDiario;
    return this.repository.save(ferramenta);
  }

  async findAll(filtros?: {
    busca?: string;
    tipo?: TipoFerramenta;
    ativo?: boolean;
  }): Promise<Ferramenta[]> {
    const where: any = {};

    if (filtros?.ativo !== undefined) {
      where.ativo = filtros.ativo;
    }
    if (filtros?.tipo) {
      where.tipo = filtros.tipo;
    }

    let ferramentas = await this.repository.find({
      where,
      order: { tipo: 'ASC', descricao: 'ASC' },
    });

    if (filtros?.busca) {
      const busca = filtros.busca.toLowerCase();
      ferramentas = ferramentas.filter(
        (f) =>
          f.codigo.toLowerCase().includes(busca) ||
          f.descricao.toLowerCase().includes(busca),
      );
    }

    return ferramentas;
  }

  async findOne(id: number): Promise<Ferramenta> {
    const ferramenta = await this.repository.findOne({ where: { id } });
    if (!ferramenta) {
      throw new NotFoundException(`Ferramenta ${id} não encontrada`);
    }
    return ferramenta;
  }

  async findByTipo(tipo: TipoFerramenta): Promise<Ferramenta[]> {
    return this.repository.find({
      where: { tipo, ativo: true },
      order: { descricao: 'ASC' },
    });
  }

  async update(id: number, dto: UpdateFerramentaDto): Promise<Ferramenta> {
    const ferramenta = await this.findOne(id);
    Object.assign(ferramenta, dto);

    // Recalcular custos
    const { custoMensal, custoDiario } = this.calcularCustos(
      ferramenta.valorAquisicao,
      ferramenta.vidaUtilMeses,
    );
    ferramenta.custoMensal = custoMensal;
    ferramenta.custoDiario = custoDiario;

    return this.repository.save(ferramenta);
  }

  async remove(id: number): Promise<void> {
    const ferramenta = await this.findOne(id);
    ferramenta.ativo = false;
    await this.repository.save(ferramenta);
  }

  async seed(): Promise<{ message: string; total: number }> {
    const count = await this.repository.count();
    if (count > 0) {
      return { message: 'Ferramentas já existem no banco', total: count };
    }

    const ferramentasData = [
      // FERRAMENTAS MANUAIS
      { codigo: 'FM-MART', descricao: 'Martelo de Bola 500g', tipo: TipoFerramenta.MANUAL, valorAquisicao: 85.00, vidaUtilMeses: 36, fabricante: 'Tramontina' },
      { codigo: 'FM-CHAV-COMB', descricao: 'Jogo Chaves Combinadas 6-32mm', tipo: TipoFerramenta.MANUAL, valorAquisicao: 450.00, vidaUtilMeses: 48, fabricante: 'Gedore' },
      { codigo: 'FM-CHAV-ALLEN', descricao: 'Jogo Chaves Allen 1,5-10mm', tipo: TipoFerramenta.MANUAL, valorAquisicao: 120.00, vidaUtilMeses: 48, fabricante: 'Gedore' },
      { codigo: 'FM-ALICATE', descricao: 'Alicate Universal 8"', tipo: TipoFerramenta.MANUAL, valorAquisicao: 95.00, vidaUtilMeses: 36, fabricante: 'Tramontina' },
      { codigo: 'FM-TORQUES', descricao: 'Torquímetro de Estalo 40-200Nm', tipo: TipoFerramenta.MANUAL, valorAquisicao: 850.00, vidaUtilMeses: 60, fabricante: 'Gedore' },
      { codigo: 'FM-NIVEL', descricao: 'Nível de Bolha 60cm', tipo: TipoFerramenta.MANUAL, valorAquisicao: 180.00, vidaUtilMeses: 48, fabricante: 'Stanley' },
      { codigo: 'FM-ESQUADRO', descricao: 'Esquadro de Aço 30cm', tipo: TipoFerramenta.MANUAL, valorAquisicao: 120.00, vidaUtilMeses: 60, fabricante: 'Starrett' },
      { codigo: 'FM-LIMA', descricao: 'Jogo de Limas (5 pcs)', tipo: TipoFerramenta.MANUAL, valorAquisicao: 180.00, vidaUtilMeses: 24, fabricante: 'Nicholson' },

      // FERRAMENTAS ELÉTRICAS
      { codigo: 'FE-ESM-115', descricao: 'Esmerilhadeira Angular 4.1/2" 850W', tipo: TipoFerramenta.ELETRICA, valorAquisicao: 450.00, vidaUtilMeses: 18, fabricante: 'DeWalt', modelo: 'DWE4020', potencia: '850W' },
      { codigo: 'FE-ESM-180', descricao: 'Esmerilhadeira Angular 7" 2200W', tipo: TipoFerramenta.ELETRICA, valorAquisicao: 890.00, vidaUtilMeses: 18, fabricante: 'DeWalt', modelo: 'DWE490', potencia: '2200W' },
      { codigo: 'FE-FUR', descricao: 'Furadeira de Impacto 1/2" 750W', tipo: TipoFerramenta.ELETRICA, valorAquisicao: 520.00, vidaUtilMeses: 24, fabricante: 'Bosch', modelo: 'GSB 16 RE', potencia: '750W' },
      { codigo: 'FE-PAR-IMP', descricao: 'Parafusadeira de Impacto 18V', tipo: TipoFerramenta.ELETRICA, valorAquisicao: 1200.00, vidaUtilMeses: 24, fabricante: 'DeWalt', modelo: 'DCF899', potencia: '18V' },
      { codigo: 'FE-SERRA-CIRC', descricao: 'Serra Circular 7.1/4" 1800W', tipo: TipoFerramenta.ELETRICA, valorAquisicao: 680.00, vidaUtilMeses: 24, fabricante: 'Makita', modelo: '5007MG', potencia: '1800W' },
      { codigo: 'FE-MARTELETE', descricao: 'Martelete Perfurador SDS Plus 800W', tipo: TipoFerramenta.ELETRICA, valorAquisicao: 950.00, vidaUtilMeses: 24, fabricante: 'Bosch', modelo: 'GBH 2-26 DRE', potencia: '800W' },

      // EQUIPAMENTOS DE SOLDAGEM
      { codigo: 'FS-MIG', descricao: 'Máquina de Solda MIG 250A', tipo: TipoFerramenta.SOLDAGEM, valorAquisicao: 4500.00, vidaUtilMeses: 60, fabricante: 'ESAB', modelo: 'SMashweld 250', potencia: '250A' },
      { codigo: 'FS-TIG', descricao: 'Máquina de Solda TIG 200A', tipo: TipoFerramenta.SOLDAGEM, valorAquisicao: 3800.00, vidaUtilMeses: 60, fabricante: 'ESAB', modelo: 'Caddy TIG 2200i', potencia: '200A' },
      { codigo: 'FS-ELET', descricao: 'Máquina de Solda Eletrodo 400A', tipo: TipoFerramenta.SOLDAGEM, valorAquisicao: 2800.00, vidaUtilMeses: 60, fabricante: 'ESAB', modelo: 'Origo Arc 456', potencia: '400A' },
      { codigo: 'FS-TOCHA-MIG', descricao: 'Tocha MIG 350A 3m', tipo: TipoFerramenta.SOLDAGEM, valorAquisicao: 850.00, vidaUtilMeses: 12, fabricante: 'ESAB' },
      { codigo: 'FS-TOCHA-TIG', descricao: 'Tocha TIG 200A 4m', tipo: TipoFerramenta.SOLDAGEM, valorAquisicao: 650.00, vidaUtilMeses: 18, fabricante: 'ESAB' },

      // EQUIPAMENTOS DE CORTE
      { codigo: 'FC-MAÇARICO', descricao: 'Conjunto Oxicorte Completo', tipo: TipoFerramenta.CORTE, valorAquisicao: 1800.00, vidaUtilMeses: 48, fabricante: 'White Martins' },
      { codigo: 'FC-CUT-OFF', descricao: 'Serra Cut-Off 14" 2200W', tipo: TipoFerramenta.CORTE, valorAquisicao: 1200.00, vidaUtilMeses: 24, fabricante: 'DeWalt', modelo: 'D28720', potencia: '2200W' },
      { codigo: 'FC-POLICORTE', descricao: 'Policorte 14" 2000W', tipo: TipoFerramenta.CORTE, valorAquisicao: 980.00, vidaUtilMeses: 24, fabricante: 'Makita', potencia: '2000W' },

      // INSTRUMENTOS DE MEDIÇÃO
      { codigo: 'FD-TRENA-30', descricao: 'Trena de Fibra 30m', tipo: TipoFerramenta.MEDICAO, valorAquisicao: 120.00, vidaUtilMeses: 36, fabricante: 'Stanley' },
      { codigo: 'FD-TRENA-LASER', descricao: 'Trena Laser 50m', tipo: TipoFerramenta.MEDICAO, valorAquisicao: 450.00, vidaUtilMeses: 36, fabricante: 'Bosch', modelo: 'GLM 50 C' },
      { codigo: 'FD-NIVEL-LASER', descricao: 'Nível Laser de Linha', tipo: TipoFerramenta.MEDICAO, valorAquisicao: 850.00, vidaUtilMeses: 48, fabricante: 'Bosch', modelo: 'GLL 3-80' },
      { codigo: 'FD-PAQUIMETRO', descricao: 'Paquímetro Digital 150mm', tipo: TipoFerramenta.MEDICAO, valorAquisicao: 280.00, vidaUtilMeses: 60, fabricante: 'Mitutoyo' },
      { codigo: 'FD-MEDIDOR-ESP', descricao: 'Medidor de Espessura de Camada', tipo: TipoFerramenta.MEDICAO, valorAquisicao: 2500.00, vidaUtilMeses: 60, fabricante: 'Elcometer', observacoes: 'Para inspeção de pintura' },

      // EQUIPAMENTOS DE ELEVAÇÃO
      { codigo: 'FL-TALHA-1T', descricao: 'Talha Manual de Corrente 1 Ton', tipo: TipoFerramenta.ELEVACAO, valorAquisicao: 850.00, vidaUtilMeses: 60, fabricante: 'Yale' },
      { codigo: 'FL-TALHA-2T', descricao: 'Talha Manual de Corrente 2 Ton', tipo: TipoFerramenta.ELEVACAO, valorAquisicao: 1200.00, vidaUtilMeses: 60, fabricante: 'Yale' },
      { codigo: 'FL-CINTA-3T', descricao: 'Cinta de Elevação 3 Ton 4m', tipo: TipoFerramenta.ELEVACAO, valorAquisicao: 180.00, vidaUtilMeses: 24, fabricante: 'SpanSet' },
      { codigo: 'FL-MANILHA-2T', descricao: 'Manilha Reta 2 Ton', tipo: TipoFerramenta.ELEVACAO, valorAquisicao: 85.00, vidaUtilMeses: 60, fabricante: 'Gunnebo' },
    ];

    const ferramentas = ferramentasData.map((data) => {
      const ferramenta = this.repository.create(data);
      const { custoMensal, custoDiario } = this.calcularCustos(
        data.valorAquisicao,
        data.vidaUtilMeses,
      );
      ferramenta.custoMensal = custoMensal;
      ferramenta.custoDiario = custoDiario;
      return ferramenta;
    });

    await this.repository.save(ferramentas);

    return { message: 'Ferramentas inseridas com sucesso', total: ferramentas.length };
  }
}

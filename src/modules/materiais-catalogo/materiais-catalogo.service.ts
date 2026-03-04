import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, ILike } from 'typeorm';
import { MaterialCatalogo, MaterialCategoria } from './entities/material-catalogo.entity';
import { CreateMaterialCatalogoDto } from './dto/create-material-catalogo.dto';
import { UpdateMaterialCatalogoDto } from './dto/update-material-catalogo.dto';

@Injectable()
export class MateriaisCatalogoService {
  constructor(
    @InjectRepository(MaterialCatalogo)
    private readonly repository: Repository<MaterialCatalogo>,
  ) {}

  async create(dto: CreateMaterialCatalogoDto): Promise<MaterialCatalogo> {
    const material = this.repository.create(dto);
    return this.repository.save(material);
  }

  async findAll(filtros?: {
    busca?: string;
    categoria?: MaterialCategoria;
    fornecedor?: string;
    ativo?: boolean;
  }): Promise<MaterialCatalogo[]> {
    const where: any = {};

    if (filtros?.ativo !== undefined) {
      where.ativo = filtros.ativo;
    }
    if (filtros?.categoria) {
      where.categoria = filtros.categoria;
    }
    if (filtros?.fornecedor) {
      where.fornecedor = filtros.fornecedor;
    }

    let materiais = await this.repository.find({
      where,
      order: { codigo: 'ASC' },
    });

    // Filtro de busca (código ou descrição)
    if (filtros?.busca) {
      const busca = filtros.busca.toLowerCase();
      materiais = materiais.filter(
        (m) =>
          m.codigo.toLowerCase().includes(busca) ||
          m.descricao.toLowerCase().includes(busca),
      );
    }

    return materiais;
  }

  async findOne(id: number): Promise<MaterialCatalogo> {
    const material = await this.repository.findOne({ where: { id } });
    if (!material) {
      throw new NotFoundException(`Material ${id} não encontrado`);
    }
    return material;
  }

  async findByCategoria(categoria: MaterialCategoria): Promise<MaterialCatalogo[]> {
    return this.repository.find({
      where: { categoria, ativo: true },
      order: { codigo: 'ASC' },
    });
  }

  async findByFornecedor(fornecedor: string): Promise<MaterialCatalogo[]> {
    return this.repository.find({
      where: { fornecedor, ativo: true },
      order: { codigo: 'ASC' },
    });
  }

  async update(id: number, dto: UpdateMaterialCatalogoDto): Promise<MaterialCatalogo> {
    const material = await this.findOne(id);
    Object.assign(material, dto);
    return this.repository.save(material);
  }

  async remove(id: number): Promise<void> {
    const material = await this.findOne(id);
    material.ativo = false;
    await this.repository.save(material);
  }

  async seed(): Promise<{ message: string; total: number }> {
    const count = await this.repository.count();
    if (count > 0) {
      return { message: 'Materiais já existem no banco', total: count };
    }

    const materiais: Partial<MaterialCatalogo>[] = [
      // PERFIS U - Gerdau
      { codigo: 'PU-75X40', descricao: 'Perfil U 75x40x3,00mm - Gerdau', categoria: MaterialCategoria.PERFIL_U, fornecedor: 'Gerdau', unidade: 'm', precoUnitario: 45.50, precoKg: 6.50, pesoNominal: 4.58, perimetroM: 0.234, areaM2PorMetroLinear: 0.234 },
      { codigo: 'PU-100X50', descricao: 'Perfil U 100x50x3,00mm - Gerdau', categoria: MaterialCategoria.PERFIL_U, fornecedor: 'Gerdau', unidade: 'm', precoUnitario: 58.90, precoKg: 6.50, pesoNominal: 5.82, perimetroM: 0.300, areaM2PorMetroLinear: 0.300 },
      { codigo: 'PU-127X50', descricao: 'Perfil U 127x50x3,00mm - Gerdau', categoria: MaterialCategoria.PERFIL_U, fornecedor: 'Gerdau', unidade: 'm', precoUnitario: 72.30, precoKg: 6.50, pesoNominal: 6.90, perimetroM: 0.354, areaM2PorMetroLinear: 0.354 },
      { codigo: 'PU-152X51', descricao: 'Perfil U 152x51x3,00mm - Gerdau', categoria: MaterialCategoria.PERFIL_U, fornecedor: 'Gerdau', unidade: 'm', precoUnitario: 85.40, precoKg: 6.50, pesoNominal: 8.16, perimetroM: 0.406, areaM2PorMetroLinear: 0.406 },

      // PERFIS L - Gerdau
      { codigo: 'PL-25X25', descricao: 'Cantoneira L 25x25x3,00mm - Gerdau', categoria: MaterialCategoria.PERFIL_L, fornecedor: 'Gerdau', unidade: 'm', precoUnitario: 18.50, precoKg: 6.50, pesoNominal: 1.12, perimetroM: 0.094, areaM2PorMetroLinear: 0.094 },
      { codigo: 'PL-50X50', descricao: 'Cantoneira L 50x50x3,00mm - Gerdau', categoria: MaterialCategoria.PERFIL_L, fornecedor: 'Gerdau', unidade: 'm', precoUnitario: 32.80, precoKg: 6.50, pesoNominal: 2.26, perimetroM: 0.194, areaM2PorMetroLinear: 0.194 },
      { codigo: 'PL-75X75', descricao: 'Cantoneira L 75x75x6,00mm - Gerdau', categoria: MaterialCategoria.PERFIL_L, fornecedor: 'Gerdau', unidade: 'm', precoUnitario: 58.90, precoKg: 6.50, pesoNominal: 6.85, perimetroM: 0.288, areaM2PorMetroLinear: 0.288 },

      // TUBOS QUADRADOS - Açotel
      { codigo: 'TQ-30X30', descricao: 'Tubo Quadrado 30x30x2,00mm - Açotel', categoria: MaterialCategoria.TUBO_QUADRADO, fornecedor: 'Açotel', unidade: 'm', precoUnitario: 28.50, precoKg: 7.20, pesoNominal: 1.70, perimetroM: 0.120, areaM2PorMetroLinear: 0.120 },
      { codigo: 'TQ-40X40', descricao: 'Tubo Quadrado 40x40x2,00mm - Açotel', categoria: MaterialCategoria.TUBO_QUADRADO, fornecedor: 'Açotel', unidade: 'm', precoUnitario: 35.80, precoKg: 7.20, pesoNominal: 2.31, perimetroM: 0.160, areaM2PorMetroLinear: 0.160 },
      { codigo: 'TQ-50X50', descricao: 'Tubo Quadrado 50x50x2,00mm - Açotel', categoria: MaterialCategoria.TUBO_QUADRADO, fornecedor: 'Açotel', unidade: 'm', precoUnitario: 42.90, precoKg: 7.20, pesoNominal: 2.91, perimetroM: 0.200, areaM2PorMetroLinear: 0.200 },
      { codigo: 'TQ-60X60', descricao: 'Tubo Quadrado 60x60x3,00mm - Açotel', categoria: MaterialCategoria.TUBO_QUADRADO, fornecedor: 'Açotel', unidade: 'm', precoUnitario: 62.50, precoKg: 7.20, pesoNominal: 5.24, perimetroM: 0.240, areaM2PorMetroLinear: 0.240 },
      { codigo: 'TQ-80X80', descricao: 'Tubo Quadrado 80x80x3,00mm - Açotel', categoria: MaterialCategoria.TUBO_QUADRADO, fornecedor: 'Açotel', unidade: 'm', precoUnitario: 78.90, precoKg: 7.20, pesoNominal: 7.07, perimetroM: 0.320, areaM2PorMetroLinear: 0.320 },

      // TUBOS RETANGULARES - Açotel
      { codigo: 'TR-40X20', descricao: 'Tubo Retangular 40x20x2,00mm - Açotel', categoria: MaterialCategoria.TUBO_RETANGULAR, fornecedor: 'Açotel', unidade: 'm', precoUnitario: 32.50, precoKg: 7.20, pesoNominal: 1.70, perimetroM: 0.120, areaM2PorMetroLinear: 0.120 },
      { codigo: 'TR-60X40', descricao: 'Tubo Retangular 60x40x2,00mm - Açotel', categoria: MaterialCategoria.TUBO_RETANGULAR, fornecedor: 'Açotel', unidade: 'm', precoUnitario: 48.90, precoKg: 7.20, pesoNominal: 2.91, perimetroM: 0.200, areaM2PorMetroLinear: 0.200 },
      { codigo: 'TR-100X50', descricao: 'Tubo Retangular 100x50x3,00mm - Açotel', categoria: MaterialCategoria.TUBO_RETANGULAR, fornecedor: 'Açotel', unidade: 'm', precoUnitario: 85.50, precoKg: 7.20, pesoNominal: 6.71, perimetroM: 0.300, areaM2PorMetroLinear: 0.300 },

      // CHAPAS - Gerdau
      { codigo: 'CH-3MM', descricao: 'Chapa Fina 3,00mm (1200x3000) - Gerdau', categoria: MaterialCategoria.CHAPA_FINA, fornecedor: 'Gerdau', unidade: 'pç', precoUnitario: 650.00, precoKg: 6.50, pesoNominal: 84.78, perimetroM: null, areaM2PorMetroLinear: 3.60 },
      { codigo: 'CH-4.75MM', descricao: 'Chapa Fina 4,75mm (1200x3000) - Gerdau', categoria: MaterialCategoria.CHAPA_FINA, fornecedor: 'Gerdau', unidade: 'pç', precoUnitario: 980.00, precoKg: 6.50, pesoNominal: 134.24, perimetroM: null, areaM2PorMetroLinear: 3.60 },
      { codigo: 'CH-6.35MM', descricao: 'Chapa Grossa 6,35mm (1200x3000) - Gerdau', categoria: MaterialCategoria.CHAPA_GROSSA, fornecedor: 'Gerdau', unidade: 'pç', precoUnitario: 1250.00, precoKg: 6.50, pesoNominal: 179.50, perimetroM: null, areaM2PorMetroLinear: 3.60 },
      { codigo: 'CH-9.5MM', descricao: 'Chapa Grossa 9,5mm (1200x3000) - Gerdau', categoria: MaterialCategoria.CHAPA_GROSSA, fornecedor: 'Gerdau', unidade: 'pç', precoUnitario: 1850.00, precoKg: 6.50, pesoNominal: 268.56, perimetroM: null, areaM2PorMetroLinear: 3.60 },
      { codigo: 'CH-12.7MM', descricao: 'Chapa Grossa 12,7mm (1200x3000) - Gerdau', categoria: MaterialCategoria.CHAPA_GROSSA, fornecedor: 'Gerdau', unidade: 'pç', precoUnitario: 2450.00, precoKg: 6.50, pesoNominal: 359.06, perimetroM: null, areaM2PorMetroLinear: 3.60 },

      // BARRAS - Gerdau
      { codigo: 'BC-25X3', descricao: 'Barra Chata 25x3mm - Gerdau', categoria: MaterialCategoria.BARRA_CHATA, fornecedor: 'Gerdau', unidade: 'm', precoUnitario: 12.50, precoKg: 6.50, pesoNominal: 0.59, perimetroM: 0.056, areaM2PorMetroLinear: 0.056 },
      { codigo: 'BC-50X6', descricao: 'Barra Chata 50x6mm - Gerdau', categoria: MaterialCategoria.BARRA_CHATA, fornecedor: 'Gerdau', unidade: 'm', precoUnitario: 28.90, precoKg: 6.50, pesoNominal: 2.36, perimetroM: 0.112, areaM2PorMetroLinear: 0.112 },
      { codigo: 'BR-12.7', descricao: 'Barra Redonda Ø12,7mm (1/2") - Gerdau', categoria: MaterialCategoria.BARRA_REDONDA, fornecedor: 'Gerdau', unidade: 'm', precoUnitario: 15.80, precoKg: 6.50, pesoNominal: 0.99, perimetroM: 0.040, areaM2PorMetroLinear: 0.040 },
      { codigo: 'BR-19.05', descricao: 'Barra Redonda Ø19,05mm (3/4") - Gerdau', categoria: MaterialCategoria.BARRA_REDONDA, fornecedor: 'Gerdau', unidade: 'm', precoUnitario: 28.50, precoKg: 6.50, pesoNominal: 2.23, perimetroM: 0.060, areaM2PorMetroLinear: 0.060 },
      { codigo: 'BR-25.4', descricao: 'Barra Redonda Ø25,4mm (1") - Gerdau', categoria: MaterialCategoria.BARRA_REDONDA, fornecedor: 'Gerdau', unidade: 'm', precoUnitario: 42.80, precoKg: 6.50, pesoNominal: 3.97, perimetroM: 0.080, areaM2PorMetroLinear: 0.080 },

      // PARAFUSOS - Ciser
      { codigo: 'PAR-M12X30', descricao: 'Parafuso Sext. M12x30 Classe 8.8 - Ciser', categoria: MaterialCategoria.PARAFUSO, fornecedor: 'Ciser', unidade: 'pç', precoUnitario: 2.85, precoKg: null, pesoNominal: 0.042 },
      { codigo: 'PAR-M16X50', descricao: 'Parafuso Sext. M16x50 Classe 8.8 - Ciser', categoria: MaterialCategoria.PARAFUSO, fornecedor: 'Ciser', unidade: 'pç', precoUnitario: 5.90, precoKg: null, pesoNominal: 0.115 },
      { codigo: 'PAR-M20X60', descricao: 'Parafuso Sext. M20x60 Classe 8.8 - Ciser', categoria: MaterialCategoria.PARAFUSO, fornecedor: 'Ciser', unidade: 'pç', precoUnitario: 12.50, precoKg: null, pesoNominal: 0.220 },
      { codigo: 'POR-M12', descricao: 'Porca Sextavada M12 Classe 8 - Ciser', categoria: MaterialCategoria.PORCA, fornecedor: 'Ciser', unidade: 'pç', precoUnitario: 0.85, precoKg: null, pesoNominal: 0.018 },
      { codigo: 'POR-M16', descricao: 'Porca Sextavada M16 Classe 8 - Ciser', categoria: MaterialCategoria.PORCA, fornecedor: 'Ciser', unidade: 'pç', precoUnitario: 1.50, precoKg: null, pesoNominal: 0.038 },
      { codigo: 'ARR-M12', descricao: 'Arruela Lisa M12 - Ciser', categoria: MaterialCategoria.ARRUELA, fornecedor: 'Ciser', unidade: 'pç', precoUnitario: 0.35, precoKg: null, pesoNominal: 0.008 },
      { codigo: 'ARR-M16', descricao: 'Arruela Lisa M16 - Ciser', categoria: MaterialCategoria.ARRUELA, fornecedor: 'Ciser', unidade: 'pç', precoUnitario: 0.55, precoKg: null, pesoNominal: 0.015 },
      { codigo: 'CHU-M12X150', descricao: 'Chumbador Mecânico M12x150mm - Ciser', categoria: MaterialCategoria.CHUMBADOR, fornecedor: 'Ciser', unidade: 'pç', precoUnitario: 18.90, precoKg: null, pesoNominal: 0.180 },
      { codigo: 'CHU-M16X200', descricao: 'Chumbador Mecânico M16x200mm - Ciser', categoria: MaterialCategoria.CHUMBADOR, fornecedor: 'Ciser', unidade: 'pç', precoUnitario: 32.50, precoKg: null, pesoNominal: 0.380 },

      // TELHAS - Açotel
      { codigo: 'TT-40', descricao: 'Telha Trapezoidal 40 (0,50mm) - Açotel', categoria: MaterialCategoria.TELHA_TRAPEZOIDAL, fornecedor: 'Açotel', unidade: 'm', precoUnitario: 45.90, precoKg: null, pesoNominal: 4.89 },
      { codigo: 'TT-100', descricao: 'Telha Trapezoidal 100 (0,65mm) - Açotel', categoria: MaterialCategoria.TELHA_TRAPEZOIDAL, fornecedor: 'Açotel', unidade: 'm', precoUnitario: 68.50, precoKg: null, pesoNominal: 6.35 },
    ];

    await this.repository.save(materiais.map((m) => this.repository.create(m)));

    return { message: 'Materiais inseridos com sucesso', total: materiais.length };
  }
}

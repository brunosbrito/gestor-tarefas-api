import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Insumo, CategoriaInsumo } from './entities/insumo.entity';
import { CreateInsumoDto } from './dto/create-insumo.dto';
import { UpdateInsumoDto } from './dto/update-insumo.dto';

@Injectable()
export class InsumosService {
  constructor(
    @InjectRepository(Insumo)
    private readonly insumoRepository: Repository<Insumo>,
  ) {}

  async create(dto: CreateInsumoDto): Promise<Insumo> {
    // Verificar se código já existe
    const existente = await this.insumoRepository.findOne({
      where: { codigo: dto.codigo },
    });
    if (existente) {
      throw new ConflictException(`Insumo com código ${dto.codigo} já existe`);
    }

    const insumo = this.insumoRepository.create(dto);
    return this.insumoRepository.save(insumo);
  }

  async findAll(categoria?: CategoriaInsumo): Promise<Insumo[]> {
    const where: any = { ativo: true };
    if (categoria) {
      where.categoria = categoria;
    }
    return this.insumoRepository.find({
      where,
      order: { categoria: 'ASC', descricao: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Insumo> {
    const insumo = await this.insumoRepository.findOne({ where: { id } });
    if (!insumo) {
      throw new NotFoundException(`Insumo com ID ${id} não encontrado`);
    }
    return insumo;
  }

  async findByCodigo(codigo: string): Promise<Insumo> {
    const insumo = await this.insumoRepository.findOne({ where: { codigo } });
    if (!insumo) {
      throw new NotFoundException(`Insumo com código ${codigo} não encontrado`);
    }
    return insumo;
  }

  async search(termo: string): Promise<Insumo[]> {
    return this.insumoRepository.find({
      where: [
        { descricao: Like(`%${termo}%`), ativo: true },
        { codigo: Like(`%${termo}%`), ativo: true },
        { material: Like(`%${termo}%`), ativo: true },
      ],
      order: { descricao: 'ASC' },
    });
  }

  async update(id: string, dto: UpdateInsumoDto): Promise<Insumo> {
    const insumo = await this.findOne(id);
    Object.assign(insumo, dto);
    return this.insumoRepository.save(insumo);
  }

  async remove(id: string): Promise<void> {
    const insumo = await this.findOne(id);
    // Soft delete - apenas desativa
    insumo.ativo = false;
    await this.insumoRepository.save(insumo);
  }

  async hardRemove(id: string): Promise<void> {
    const insumo = await this.findOne(id);
    await this.insumoRepository.remove(insumo);
  }

  /**
   * Popula o banco com insumos padrão
   */
  async seed(): Promise<{ message: string; total: number }> {
    const existentes = await this.insumoRepository.count();
    if (existentes > 0) {
      return {
        message: `Já existem ${existentes} insumos no banco. Seed ignorado.`,
        total: existentes,
      };
    }

    const insumos: Partial<Insumo>[] = [
      // ==================== MATERIAIS ====================
      { codigo: 'MAT-001', descricao: 'Perfil W 200x35,9', categoria: 'material', unidade: 'm', valorUnitario: 285, material: 'ASTM A572-50', especificacao: 'Perfil W 200x35,9', pesoUnitario: 35.9 },
      { codigo: 'MAT-002', descricao: 'Perfil W 150x22,5', categoria: 'material', unidade: 'm', valorUnitario: 195, material: 'ASTM A572-50', especificacao: 'Perfil W 150x22,5', pesoUnitario: 22.5 },
      { codigo: 'MAT-003', descricao: 'Perfil U 150x50x3', categoria: 'material', unidade: 'm', valorUnitario: 95, material: 'ASTM A36', especificacao: 'Perfil U 150x50x3', pesoUnitario: 7.2 },
      { codigo: 'MAT-004', descricao: 'Perfil I 200x100', categoria: 'material', unidade: 'm', valorUnitario: 320, material: 'ASTM A36', especificacao: 'Perfil I 200x100', pesoUnitario: 28.5 },
      { codigo: 'MAT-005', descricao: 'Cantoneira L 51x4,7', categoria: 'material', unidade: 'm', valorUnitario: 28, material: 'ASTM A36', especificacao: 'Cantoneira L 51x4,7', pesoUnitario: 3.6 },
      { codigo: 'MAT-006', descricao: 'Cantoneira L 76x6,35', categoria: 'material', unidade: 'm', valorUnitario: 45, material: 'ASTM A36', especificacao: 'Cantoneira L 76x6,35', pesoUnitario: 7.1 },
      { codigo: 'MAT-007', descricao: 'Chapa 6,35mm', categoria: 'material', unidade: 'kg', valorUnitario: 8.5, material: 'ASTM A36', especificacao: 'Chapa 6,35mm (1/4")' },
      { codigo: 'MAT-008', descricao: 'Chapa 9,53mm', categoria: 'material', unidade: 'kg', valorUnitario: 8.2, material: 'ASTM A36', especificacao: 'Chapa 9,53mm (3/8")' },
      { codigo: 'MAT-009', descricao: 'Chapa 12,7mm', categoria: 'material', unidade: 'kg', valorUnitario: 8.0, material: 'ASTM A36', especificacao: 'Chapa 12,7mm (1/2")' },
      { codigo: 'MAT-010', descricao: 'Parafuso ASTM A325 3/4"x2.1/2"', categoria: 'material', unidade: 'un', valorUnitario: 3.8, material: 'ASTM A325', especificacao: '3/4" x 2.1/2"' },
      { codigo: 'MAT-011', descricao: 'Parafuso ASTM A325 7/8"x3"', categoria: 'material', unidade: 'un', valorUnitario: 5.2, material: 'ASTM A325', especificacao: '7/8" x 3"' },
      { codigo: 'MAT-012', descricao: 'Porca Sextavada 3/4"', categoria: 'material', unidade: 'un', valorUnitario: 1.2, material: 'ASTM A563' },
      { codigo: 'MAT-013', descricao: 'Arruela Lisa 3/4"', categoria: 'material', unidade: 'un', valorUnitario: 0.45, material: 'SAE 1020' },
      { codigo: 'MAT-014', descricao: 'Telha Metálica Trapezoidal', categoria: 'material', unidade: 'm²', valorUnitario: 65, especificacao: 'Trapezoidal 40/980 - 0,5mm' },
      { codigo: 'MAT-015', descricao: 'Calha Galvanizada', categoria: 'material', unidade: 'm', valorUnitario: 38, especificacao: 'Calha 333mm' },
      { codigo: 'MAT-016', descricao: 'Piso Steel Deck', categoria: 'material', unidade: 'm²', valorUnitario: 95, especificacao: 'Steel Deck MF-75' },
      { codigo: 'MAT-017', descricao: 'Guarda-corpo metálico', categoria: 'material', unidade: 'm', valorUnitario: 180, especificacao: 'Guarda-corpo h=1,10m' },

      // ==================== CONSUMÍVEIS ====================
      { codigo: 'CON-001', descricao: 'Disco de Corte 9"', categoria: 'consumivel', unidade: 'un', valorUnitario: 8.5, fabricante: 'Norton' },
      { codigo: 'CON-002', descricao: 'Disco de Corte 7"', categoria: 'consumivel', unidade: 'un', valorUnitario: 7.0, fabricante: 'Norton' },
      { codigo: 'CON-003', descricao: 'Disco de Desbaste 9"', categoria: 'consumivel', unidade: 'un', valorUnitario: 7.2, fabricante: 'Norton' },
      { codigo: 'CON-004', descricao: 'Disco de Desbaste 7"', categoria: 'consumivel', unidade: 'un', valorUnitario: 6.0, fabricante: 'Norton' },
      { codigo: 'CON-005', descricao: 'Eletrodo E6013 3,25mm', categoria: 'consumivel', unidade: 'kg', valorUnitario: 18, especificacao: 'AWS E6013' },
      { codigo: 'CON-006', descricao: 'Eletrodo E7018 3,25mm', categoria: 'consumivel', unidade: 'kg', valorUnitario: 28, especificacao: 'AWS E7018' },
      { codigo: 'CON-007', descricao: 'Eletrodo E7018 4,0mm', categoria: 'consumivel', unidade: 'kg', valorUnitario: 30, especificacao: 'AWS E7018' },
      { codigo: 'CON-008', descricao: 'Arame MIG ER70S-6 1,2mm', categoria: 'consumivel', unidade: 'kg', valorUnitario: 22, especificacao: 'AWS ER70S-6' },
      { codigo: 'CON-009', descricao: 'Lixa d\'água grão 80', categoria: 'consumivel', unidade: 'un', valorUnitario: 2.8 },
      { codigo: 'CON-010', descricao: 'Lixa d\'água grão 120', categoria: 'consumivel', unidade: 'un', valorUnitario: 2.5 },
      { codigo: 'CON-011', descricao: 'Broca HSS 8mm', categoria: 'consumivel', unidade: 'un', valorUnitario: 18 },
      { codigo: 'CON-012', descricao: 'Broca HSS 10mm', categoria: 'consumivel', unidade: 'un', valorUnitario: 22 },
      { codigo: 'CON-013', descricao: 'Broca HSS Kit (6 a 12mm)', categoria: 'consumivel', unidade: 'cx', valorUnitario: 85 },
      { codigo: 'CON-014', descricao: 'Granalha de Aço G-25', categoria: 'consumivel', unidade: 'kg', valorUnitario: 4.5 },
      { codigo: 'CON-015', descricao: 'EPI - Kit Soldador', categoria: 'consumivel', unidade: 'un', valorUnitario: 450, observacao: 'Avental, mangote, máscara, luvas' },
      { codigo: 'CON-016', descricao: 'EPI - Kit Montador', categoria: 'consumivel', unidade: 'un', valorUnitario: 380, observacao: 'Capacete, cinto, luvas, óculos' },
      { codigo: 'CON-017', descricao: 'Fita Crepe Industrial 48mm', categoria: 'consumivel', unidade: 'rl', valorUnitario: 12 },
      { codigo: 'CON-018', descricao: 'Lona Plástica', categoria: 'consumivel', unidade: 'm²', valorUnitario: 3 },

      // ==================== TINTAS ====================
      { codigo: 'TIN-001', descricao: 'Primer Epóxi Zinco', categoria: 'tinta', unidade: 'lt', valorUnitario: 120, fabricante: 'WEG', rendimento: 8, observacao: 'Rendimento: 8 m²/lt' },
      { codigo: 'TIN-002', descricao: 'Primer Epóxi', categoria: 'tinta', unidade: 'lt', valorUnitario: 85, fabricante: 'WEG', rendimento: 10, observacao: 'Rendimento: 10 m²/lt' },
      { codigo: 'TIN-003', descricao: 'Esmalte PU Amarelo Segurança', categoria: 'tinta', unidade: 'lt', valorUnitario: 95, fabricante: 'WEG', rendimento: 12, observacao: 'Rendimento: 12 m²/lt' },
      { codigo: 'TIN-004', descricao: 'Esmalte PU Cinza N6.5', categoria: 'tinta', unidade: 'lt', valorUnitario: 90, fabricante: 'WEG', rendimento: 12 },
      { codigo: 'TIN-005', descricao: 'Esmalte PU Vermelho Segurança', categoria: 'tinta', unidade: 'lt', valorUnitario: 95, fabricante: 'WEG', rendimento: 12 },
      { codigo: 'TIN-006', descricao: 'Acabamento Poliuretano', categoria: 'tinta', unidade: 'lt', valorUnitario: 95, fabricante: 'Sherwin-Williams', rendimento: 10 },
      { codigo: 'TIN-007', descricao: 'Thinner para Epóxi', categoria: 'tinta', unidade: 'lt', valorUnitario: 18 },
      { codigo: 'TIN-008', descricao: 'Thinner para PU', categoria: 'tinta', unidade: 'lt', valorUnitario: 25 },
      { codigo: 'TIN-009', descricao: 'Galvanização a Frio Spray', categoria: 'tinta', unidade: 'un', valorUnitario: 65, fabricante: 'Quimatic', observacao: 'Spray 300ml' },

      // ==================== MÃO DE OBRA ====================
      { codigo: 'MO-001', descricao: 'Soldador Qualificado', categoria: 'mao_obra', unidade: 'h', valorUnitario: 45, cargo: 'Soldador', encargosPercentual: 58.724 },
      { codigo: 'MO-002', descricao: 'Soldador Especializado', categoria: 'mao_obra', unidade: 'h', valorUnitario: 55, cargo: 'Soldador Especializado', encargosPercentual: 58.724 },
      { codigo: 'MO-003', descricao: 'Montador', categoria: 'mao_obra', unidade: 'h', valorUnitario: 35, cargo: 'Montador', encargosPercentual: 58.724 },
      { codigo: 'MO-004', descricao: 'Montador Especializado', categoria: 'mao_obra', unidade: 'h', valorUnitario: 50, cargo: 'Montador Especializado', encargosPercentual: 58.724 },
      { codigo: 'MO-005', descricao: 'Auxiliar de Produção', categoria: 'mao_obra', unidade: 'h', valorUnitario: 25, cargo: 'Auxiliar', encargosPercentual: 58.724 },
      { codigo: 'MO-006', descricao: 'Encarregado de Obra', categoria: 'mao_obra', unidade: 'h', valorUnitario: 60, cargo: 'Encarregado', encargosPercentual: 58.724 },
      { codigo: 'MO-007', descricao: 'Pintor Industrial', categoria: 'mao_obra', unidade: 'h', valorUnitario: 38, cargo: 'Pintor', encargosPercentual: 58.724 },
      { codigo: 'MO-008', descricao: 'Jatista', categoria: 'mao_obra', unidade: 'h', valorUnitario: 42, cargo: 'Jatista', encargosPercentual: 58.724 },
      { codigo: 'MO-009', descricao: 'Operador de Guindaste', categoria: 'mao_obra', unidade: 'h', valorUnitario: 65, cargo: 'Operador', encargosPercentual: 58.724 },
      { codigo: 'MO-010', descricao: 'Guincheiro', categoria: 'mao_obra', unidade: 'dia', valorUnitario: 280, cargo: 'Guincheiro', encargosPercentual: 58.724 },

      // ==================== FERRAMENTAS ====================
      { codigo: 'FER-001', descricao: 'Esmerilhadeira 9"', categoria: 'ferramenta', unidade: 'un', valorUnitario: 450, fabricante: 'Bosch' },
      { codigo: 'FER-002', descricao: 'Esmerilhadeira 7"', categoria: 'ferramenta', unidade: 'un', valorUnitario: 350, fabricante: 'Bosch' },
      { codigo: 'FER-003', descricao: 'Furadeira Industrial', categoria: 'ferramenta', unidade: 'un', valorUnitario: 680, fabricante: 'Bosch' },
      { codigo: 'FER-004', descricao: 'Marreta 5kg', categoria: 'ferramenta', unidade: 'un', valorUnitario: 45 },
      { codigo: 'FER-005', descricao: 'Kit Ferramentas Manuais', categoria: 'ferramenta', unidade: 'un', valorUnitario: 1140, observacao: 'Chaves, alicates, martelo, etc.' },
      { codigo: 'FER-006', descricao: 'Talha Manual 2t', categoria: 'ferramenta', unidade: 'un', valorUnitario: 850 },

      // ==================== EQUIPAMENTOS (Aluguel) ====================
      { codigo: 'EQP-001', descricao: 'Máquina de Solda MIG 400A', categoria: 'equipamento', unidade: 'mês', valorUnitario: 1200, observacao: 'Aluguel mensal' },
      { codigo: 'EQP-002', descricao: 'Máquina de Solda Eletrodo', categoria: 'equipamento', unidade: 'mês', valorUnitario: 450, observacao: 'Aluguel mensal' },
      { codigo: 'EQP-003', descricao: 'Compressor de Ar 250 PCM', categoria: 'equipamento', unidade: 'mês', valorUnitario: 1800, observacao: 'Aluguel mensal' },
      { codigo: 'EQP-004', descricao: 'Compressor de Ar 750 PCM', categoria: 'equipamento', unidade: 'mês', valorUnitario: 8500, observacao: 'Aluguel mensal - Jateamento' },
      { codigo: 'EQP-005', descricao: 'Pistola Airless Pintura', categoria: 'equipamento', unidade: 'mês', valorUnitario: 1200, observacao: 'Aluguel mensal' },
      { codigo: 'EQP-006', descricao: 'Andaime Tubular', categoria: 'equipamento', unidade: 'm²/mês', valorUnitario: 15, observacao: 'Aluguel por m² por mês' },
      { codigo: 'EQP-007', descricao: 'Plataforma Elevatória', categoria: 'equipamento', unidade: 'dia', valorUnitario: 850, observacao: 'Aluguel diário' },

      // ==================== SERVIÇOS ====================
      { codigo: 'SRV-001', descricao: 'Jateamento Sa 2.5', categoria: 'servico', unidade: 'm²', valorUnitario: 18, observacao: 'Serviço de jateamento abrasivo' },
      { codigo: 'SRV-002', descricao: 'Pintura Epóxi 2 demãos', categoria: 'servico', unidade: 'm²', valorUnitario: 35, observacao: 'Primer + acabamento' },
      { codigo: 'SRV-003', descricao: 'Transporte de Equipamentos', categoria: 'servico', unidade: 'vb', valorUnitario: 3500 },
      { codigo: 'SRV-004', descricao: 'Montagem de Canteiro', categoria: 'servico', unidade: 'vb', valorUnitario: 2500 },
      { codigo: 'SRV-005', descricao: 'Desmontagem de Canteiro', categoria: 'servico', unidade: 'vb', valorUnitario: 1800 },
    ];

    for (const insumoData of insumos) {
      const insumo = this.insumoRepository.create(insumoData);
      await this.insumoRepository.save(insumo);
    }

    return {
      message: `Seed concluído! ${insumos.length} insumos criados.`,
      total: insumos.length,
    };
  }
}

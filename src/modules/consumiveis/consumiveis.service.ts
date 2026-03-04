import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Consumivel, CategoriaConsumivel } from './entities/consumivel.entity';
import { CreateConsumivelDto } from './dto/create-consumivel.dto';
import { UpdateConsumivelDto } from './dto/update-consumivel.dto';

@Injectable()
export class ConsumiveisService {
  constructor(
    @InjectRepository(Consumivel)
    private readonly repository: Repository<Consumivel>,
  ) {}

  async create(dto: CreateConsumivelDto): Promise<Consumivel> {
    const consumivel = this.repository.create(dto);
    return this.repository.save(consumivel);
  }

  async findAll(filtros?: {
    busca?: string;
    categoria?: CategoriaConsumivel;
    ativo?: boolean;
  }): Promise<Consumivel[]> {
    const where: any = {};

    if (filtros?.ativo !== undefined) {
      where.ativo = filtros.ativo;
    }
    if (filtros?.categoria) {
      where.categoria = filtros.categoria;
    }

    let consumiveis = await this.repository.find({
      where,
      order: { codigo: 'ASC' },
    });

    if (filtros?.busca) {
      const busca = filtros.busca.toLowerCase();
      consumiveis = consumiveis.filter(
        (c) =>
          c.codigo.toLowerCase().includes(busca) ||
          c.descricao.toLowerCase().includes(busca),
      );
    }

    return consumiveis;
  }

  async findOne(id: number): Promise<Consumivel> {
    const consumivel = await this.repository.findOne({ where: { id } });
    if (!consumivel) {
      throw new NotFoundException(`Consumível ${id} não encontrado`);
    }
    return consumivel;
  }

  async findByCategoria(categoria: CategoriaConsumivel): Promise<Consumivel[]> {
    return this.repository.find({
      where: { categoria, ativo: true },
      order: { codigo: 'ASC' },
    });
  }

  async update(id: number, dto: UpdateConsumivelDto): Promise<Consumivel> {
    const consumivel = await this.findOne(id);
    Object.assign(consumivel, dto);
    return this.repository.save(consumivel);
  }

  async remove(id: number): Promise<void> {
    const consumivel = await this.findOne(id);
    consumivel.ativo = false;
    await this.repository.save(consumivel);
  }

  async seed(): Promise<{ message: string; total: number }> {
    const count = await this.repository.count();
    if (count > 0) {
      return { message: 'Consumíveis já existem no banco', total: count };
    }

    const consumiveis: Partial<Consumivel>[] = [
      // DISCOS DE CORTE
      { codigo: 'DC-115', descricao: 'Disco de Corte 115x1,0x22mm - Norton', categoria: CategoriaConsumivel.DISCO_CORTE, unidade: 'pç', precoUnitario: 4.50, fornecedor: 'Norton', rendimento: 15, especificacao: 'Para aço carbono' },
      { codigo: 'DC-180', descricao: 'Disco de Corte 180x1,6x22mm - Norton', categoria: CategoriaConsumivel.DISCO_CORTE, unidade: 'pç', precoUnitario: 8.90, fornecedor: 'Norton', rendimento: 25, especificacao: 'Para aço carbono' },
      { codigo: 'DC-230', descricao: 'Disco de Corte 230x3,0x22mm - Norton', categoria: CategoriaConsumivel.DISCO_CORTE, unidade: 'pç', precoUnitario: 12.50, fornecedor: 'Norton', rendimento: 40, especificacao: 'Para aço carbono' },
      { codigo: 'DC-300', descricao: 'Disco de Corte 300x3,0x25mm - DeWalt', categoria: CategoriaConsumivel.DISCO_CORTE, unidade: 'pç', precoUnitario: 28.90, fornecedor: 'DeWalt', rendimento: 60, especificacao: 'Para cut-off' },

      // DISCOS DE DESBASTE
      { codigo: 'DD-115', descricao: 'Disco de Desbaste 115x6,0x22mm - Norton', categoria: CategoriaConsumivel.DISCO_DESBASTE, unidade: 'pç', precoUnitario: 8.50, fornecedor: 'Norton', rendimento: 2.5, especificacao: 'kg removido' },
      { codigo: 'DD-180', descricao: 'Disco de Desbaste 180x6,0x22mm - Norton', categoria: CategoriaConsumivel.DISCO_DESBASTE, unidade: 'pç', precoUnitario: 15.90, fornecedor: 'Norton', rendimento: 5, especificacao: 'kg removido' },
      { codigo: 'DD-230', descricao: 'Disco de Desbaste 230x6,0x22mm - Norton', categoria: CategoriaConsumivel.DISCO_DESBASTE, unidade: 'pç', precoUnitario: 22.50, fornecedor: 'Norton', rendimento: 8, especificacao: 'kg removido' },

      // ELETRODOS
      { codigo: 'EL-6013-25', descricao: 'Eletrodo E6013 Ø2,5mm - ESAB', categoria: CategoriaConsumivel.ELETRODO, unidade: 'kg', precoUnitario: 18.90, fornecedor: 'ESAB', rendimento: 0.85, especificacao: 'Uso geral' },
      { codigo: 'EL-6013-32', descricao: 'Eletrodo E6013 Ø3,25mm - ESAB', categoria: CategoriaConsumivel.ELETRODO, unidade: 'kg', precoUnitario: 17.50, fornecedor: 'ESAB', rendimento: 0.85, especificacao: 'Uso geral' },
      { codigo: 'EL-7018-25', descricao: 'Eletrodo E7018 Ø2,5mm - ESAB', categoria: CategoriaConsumivel.ELETRODO, unidade: 'kg', precoUnitario: 28.90, fornecedor: 'ESAB', rendimento: 0.90, especificacao: 'Baixo hidrogênio' },
      { codigo: 'EL-7018-32', descricao: 'Eletrodo E7018 Ø3,25mm - ESAB', categoria: CategoriaConsumivel.ELETRODO, unidade: 'kg', precoUnitario: 26.50, fornecedor: 'ESAB', rendimento: 0.90, especificacao: 'Baixo hidrogênio' },

      // ARAME MIG
      { codigo: 'AM-08', descricao: 'Arame MIG ER70S-6 Ø0,8mm - ESAB', categoria: CategoriaConsumivel.ARAME_MIG, unidade: 'kg', precoUnitario: 15.90, fornecedor: 'ESAB', rendimento: 0.95, especificacao: 'Rolo 15kg' },
      { codigo: 'AM-10', descricao: 'Arame MIG ER70S-6 Ø1,0mm - ESAB', categoria: CategoriaConsumivel.ARAME_MIG, unidade: 'kg', precoUnitario: 14.50, fornecedor: 'ESAB', rendimento: 0.95, especificacao: 'Rolo 15kg' },
      { codigo: 'AM-12', descricao: 'Arame MIG ER70S-6 Ø1,2mm - ESAB', categoria: CategoriaConsumivel.ARAME_MIG, unidade: 'kg', precoUnitario: 13.90, fornecedor: 'ESAB', rendimento: 0.95, especificacao: 'Rolo 15kg' },

      // GÁS
      { codigo: 'GAS-CO2', descricao: 'CO2 Industrial - Cilindro 25kg', categoria: CategoriaConsumivel.GAS, unidade: 'kg', precoUnitario: 8.50, fornecedor: 'White Martins', especificacao: 'Pureza 99,5%' },
      { codigo: 'GAS-MIX', descricao: 'Mistura 75% Ar + 25% CO2 - Cilindro', categoria: CategoriaConsumivel.GAS, unidade: 'm³', precoUnitario: 45.00, fornecedor: 'White Martins', especificacao: 'Para MIG/MAG' },
      { codigo: 'GAS-O2', descricao: 'Oxigênio Industrial - Cilindro', categoria: CategoriaConsumivel.GAS, unidade: 'm³', precoUnitario: 28.00, fornecedor: 'White Martins', especificacao: 'Para oxicorte' },
      { codigo: 'GAS-AC', descricao: 'Acetileno Industrial - Cilindro', categoria: CategoriaConsumivel.GAS, unidade: 'kg', precoUnitario: 65.00, fornecedor: 'White Martins', especificacao: 'Para oxicorte' },

      // LIXAS
      { codigo: 'LX-40', descricao: 'Lixa Ferro Grão 40 - Norton', categoria: CategoriaConsumivel.LIXA, unidade: 'fl', precoUnitario: 2.80, fornecedor: 'Norton', especificacao: 'Desbaste grosso' },
      { codigo: 'LX-80', descricao: 'Lixa Ferro Grão 80 - Norton', categoria: CategoriaConsumivel.LIXA, unidade: 'fl', precoUnitario: 2.50, fornecedor: 'Norton', especificacao: 'Desbaste médio' },
      { codigo: 'LX-120', descricao: 'Lixa Ferro Grão 120 - Norton', categoria: CategoriaConsumivel.LIXA, unidade: 'fl', precoUnitario: 2.30, fornecedor: 'Norton', especificacao: 'Acabamento' },
      { codigo: 'DF-115', descricao: 'Disco Flap 115mm Grão 60 - Norton', categoria: CategoriaConsumivel.LIXA, unidade: 'pç', precoUnitario: 12.90, fornecedor: 'Norton', especificacao: 'Para esmerilhadeira' },
      { codigo: 'DF-180', descricao: 'Disco Flap 180mm Grão 60 - Norton', categoria: CategoriaConsumivel.LIXA, unidade: 'pç', precoUnitario: 22.50, fornecedor: 'Norton', especificacao: 'Para esmerilhadeira' },

      // ESCOVAS
      { codigo: 'EC-COPA', descricao: 'Escova de Aço Copa 3" - Carbografite', categoria: CategoriaConsumivel.ESCOVA, unidade: 'pç', precoUnitario: 18.90, fornecedor: 'Carbografite', especificacao: 'Para furadeira/esmerilhadeira' },
      { codigo: 'EC-CIRC', descricao: 'Escova de Aço Circular 6" - Carbografite', categoria: CategoriaConsumivel.ESCOVA, unidade: 'pç', precoUnitario: 35.50, fornecedor: 'Carbografite', especificacao: 'Para esmerilhadeira' },

      // EPI
      { codigo: 'EPI-LUV', descricao: 'Luva de Raspa Cano Curto', categoria: CategoriaConsumivel.EPI, unidade: 'par', precoUnitario: 15.90, fornecedor: 'Vonder', especificacao: 'Para soldador' },
      { codigo: 'EPI-OC', descricao: 'Óculos de Proteção Incolor', categoria: CategoriaConsumivel.EPI, unidade: 'pç', precoUnitario: 8.50, fornecedor: 'Vonder', especificacao: 'Antiembaçante' },
      { codigo: 'EPI-AB', descricao: 'Protetor Auricular Plug', categoria: CategoriaConsumivel.EPI, unidade: 'par', precoUnitario: 2.50, fornecedor: '3M', especificacao: 'Descartável' },
      { codigo: 'EPI-MASC', descricao: 'Máscara P2 para Poeira/Fumos', categoria: CategoriaConsumivel.EPI, unidade: 'pç', precoUnitario: 5.90, fornecedor: '3M', especificacao: 'Descartável' },
      { codigo: 'EPI-AV', descricao: 'Avental de Raspa 120cm', categoria: CategoriaConsumivel.EPI, unidade: 'pç', precoUnitario: 58.90, fornecedor: 'Vonder', especificacao: 'Para soldador' },
    ];

    await this.repository.save(consumiveis.map((c) => this.repository.create(c)));

    return { message: 'Consumíveis inseridos com sucesso', total: consumiveis.length };
  }
}

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
      return { message: 'Materiais já existem no banco. Use seed/bulk para forçar importação.', total: count };
    }
    return { message: 'Banco vazio. Use POST /materiais-catalogo/seed/bulk para importar materiais.', total: 0 };
  }

  async seedBulk(materiais: CreateMaterialCatalogoDto[]): Promise<{ message: string; criados: number; erros: number }> {
    let criados = 0;
    let erros = 0;

    for (const dto of materiais) {
      try {
        // Verificar se já existe pelo código
        const existente = await this.repository.findOne({ where: { codigo: dto.codigo } });
        if (existente) {
          // Atualizar material existente
          Object.assign(existente, dto);
          await this.repository.save(existente);
          criados++;
        } else {
          const material = this.repository.create(dto);
          await this.repository.save(material);
          criados++;
        }
      } catch (error) {
        erros++;
      }
    }

    return { message: `Importação concluída: ${criados} materiais processados, ${erros} erros`, criados, erros };
  }
}

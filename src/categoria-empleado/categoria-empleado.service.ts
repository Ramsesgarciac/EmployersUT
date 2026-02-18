import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoriaEmpleado } from './entities/categoria-empleado.entity';
import { CreateCategoriaEmpleadoDto } from './dto/create-categoria-empleado.dto';
import { UpdateCategoriaEmpleadoDto } from './dto/update-categoria-empleado.dto';

@Injectable()
export class CategoriaEmpleadoService {
  constructor(
    @InjectRepository(CategoriaEmpleado)
    private categoriaRepository: Repository<CategoriaEmpleado>,
  ) { }

  async create(createCategoriaDto: CreateCategoriaEmpleadoDto): Promise<CategoriaEmpleado> {
    const categoria = this.categoriaRepository.create(createCategoriaDto);
    return await this.categoriaRepository.save(categoria);
  }

  async findAll(): Promise<CategoriaEmpleado[]> {
    return await this.categoriaRepository.find({
      relations: ['empleados', 'actividades']
    });
  }

  async findOne(id: number): Promise<CategoriaEmpleado> {
    const categoria = await this.categoriaRepository.findOne({
      where: { id_cat_empleado: id },
      relations: ['empleados', 'actividades']
    });

    if (!categoria) {
      throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
    }

    return categoria;
  }

  async update(id: number, updateCategoriaDto: UpdateCategoriaEmpleadoDto): Promise<CategoriaEmpleado> {
    const categoria = await this.findOne(id);
    Object.assign(categoria, updateCategoriaDto);
    return await this.categoriaRepository.save(categoria);
  }

  async remove(id: number): Promise<void> {
    const categoria = await this.findOne(id);
    await this.categoriaRepository.remove(categoria);
  }
}


import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CatActividades } from './entities/cat-actividade.entity';
import { CategoriaEmpleado } from '../categoria-empleado/entities/categoria-empleado.entity';
import { CreateCatActividadeDto } from './dto/create-cat-actividade.dto';
import { UpdateCatActividadeDto } from './dto/update-cat-actividade.dto';

@Injectable()
export class CatActividadesService {
  constructor(
    @InjectRepository(CatActividades)
    private actividadesRepository: Repository<CatActividades>,
    @InjectRepository(CategoriaEmpleado)
    private categoriaRepository: Repository<CategoriaEmpleado>,
  ) { }

  async create(createDto: CreateCatActividadeDto): Promise<CatActividades> {
    // Verificar que la categoría existe
    const categoria = await this.categoriaRepository.findOne({
      where: { id_cat_empleado: createDto.id_cat_empleado }
    });

    if (!categoria) {
      throw new NotFoundException(
        `Categoría de empleado con ID ${createDto.id_cat_empleado} no encontrada`
      );
    }

    // Verificar si ya existe una actividad con el mismo nombre en esa categoría
    const existente = await this.actividadesRepository.findOne({
      where: {
        id_cat_empleado: createDto.id_cat_empleado,
        nombre: createDto.nombre
      }
    });

    if (existente) {
      throw new ConflictException(
        `Ya existe una actividad con el nombre "${createDto.nombre}" en esta categoría`
      );
    }

    const actividad = this.actividadesRepository.create(createDto);
    return await this.actividadesRepository.save(actividad);
  }

  async findAll(): Promise<CatActividades[]> {
    return await this.actividadesRepository.find({
      relations: ['categoria'],
      order: { nombre: 'ASC' }
    });
  }

  async findActivas(): Promise<CatActividades[]> {
    return await this.actividadesRepository.find({
      where: { activa: true },
      relations: ['categoria'],
      order: { nombre: 'ASC' }
    });
  }

  async findByCategoria(id_cat_empleado: number): Promise<CatActividades[]> {
    return await this.actividadesRepository.find({
      where: { id_cat_empleado },
      relations: ['categoria'],
      order: { nombre: 'ASC' }
    });
  }

  async findActivasByCategoria(id_cat_empleado: number): Promise<CatActividades[]> {
    return await this.actividadesRepository.find({
      where: {
        id_cat_empleado,
        activa: true
      },
      relations: ['categoria'],
      order: { nombre: 'ASC' }
    });
  }

  async findOne(id: number): Promise<CatActividades> {
    const actividad = await this.actividadesRepository.findOne({
      where: { id_cat_actividad: id },
      relations: ['categoria']
    });

    if (!actividad) {
      throw new NotFoundException(`Actividad con ID ${id} no encontrada`);
    }

    return actividad;
  }

  async update(id: number, updateDto: UpdateCatActividadeDto): Promise<CatActividades> {
    const actividad = await this.findOne(id);

    // Si se actualiza la categoría, verificar que existe
    if (updateDto.id_cat_empleado && updateDto.id_cat_empleado !== actividad.id_cat_empleado) {
      const categoria = await this.categoriaRepository.findOne({
        where: { id_cat_empleado: updateDto.id_cat_empleado }
      });

      if (!categoria) {
        throw new NotFoundException(
          `Categoría de empleado con ID ${updateDto.id_cat_empleado} no encontrada`
        );
      }
    }

    // Verificar duplicados si se actualiza el nombre
    if (updateDto.nombre && updateDto.nombre !== actividad.nombre) {
      const duplicado = await this.actividadesRepository.findOne({
        where: {
          id_cat_empleado: updateDto.id_cat_empleado || actividad.id_cat_empleado,
          nombre: updateDto.nombre
        }
      });

      if (duplicado && duplicado.id_cat_actividad !== id) {
        throw new ConflictException(
          `Ya existe una actividad con el nombre "${updateDto.nombre}" en esta categoría`
        );
      }
    }

    Object.assign(actividad, updateDto);
    return await this.actividadesRepository.save(actividad);
  }

  async desactivar(id: number): Promise<CatActividades> {
    const actividad = await this.findOne(id);
    actividad.activa = false;
    return await this.actividadesRepository.save(actividad);
  }

  async activar(id: number): Promise<CatActividades> {
    const actividad = await this.findOne(id);
    actividad.activa = true;
    return await this.actividadesRepository.save(actividad);
  }

  async remove(id: number): Promise<void> {
    const actividad = await this.findOne(id);
    await this.actividadesRepository.remove(actividad);
  }

  async contarPorCategoria(id_cat_empleado: number): Promise<number> {
    return await this.actividadesRepository.count({
      where: { id_cat_empleado, activa: true }
    });
  }
}
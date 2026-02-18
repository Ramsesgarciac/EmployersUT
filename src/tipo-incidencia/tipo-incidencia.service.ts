import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TipoIncidencia } from './entities/tipo-incidencia.entity';
import { CreateTipoIncidenciaDto } from './dto/create-tipo-incidencia.dto';
import { UpdateTipoIncidenciaDto } from './dto/update-tipo-incidencia.dto';

@Injectable()
export class TipoIncidenciaService {
  constructor(
    @InjectRepository(TipoIncidencia)
    private tipoIncidenciaRepository: Repository<TipoIncidencia>,
  ) { }

  async create(createTipoIncidenciaDto: CreateTipoIncidenciaDto): Promise<TipoIncidencia> {
    // Verificar si ya existe un tipo con el mismo nombre
    const existente = await this.tipoIncidenciaRepository.findOne({
      where: { nombre: createTipoIncidenciaDto.nombre }
    });

    if (existente) {
      throw new ConflictException(`Ya existe un tipo de incidencia con el nombre "${createTipoIncidenciaDto.nombre}"`);
    }

    const tipoIncidencia = this.tipoIncidenciaRepository.create(createTipoIncidenciaDto);
    return await this.tipoIncidenciaRepository.save(tipoIncidencia);
  }

  async findAll(): Promise<TipoIncidencia[]> {
    return await this.tipoIncidenciaRepository.find({
      order: { nombre: 'ASC' }
    });
  }

  async findOne(id: number): Promise<TipoIncidencia> {
    const tipoIncidencia = await this.tipoIncidenciaRepository.findOne({
      where: { id_tipo_incidencia: id }
    });

    if (!tipoIncidencia) {
      throw new NotFoundException(`Tipo de incidencia con ID ${id} no encontrado`);
    }

    return tipoIncidencia;
  }

  async findWithIncidencias(id: number): Promise<TipoIncidencia> {
    const tipoIncidencia = await this.tipoIncidenciaRepository.findOne({
      where: { id_tipo_incidencia: id },
      relations: ['incidencias', 'incidencias.empleado']
    });

    if (!tipoIncidencia) {
      throw new NotFoundException(`Tipo de incidencia con ID ${id} no encontrado`);
    }

    return tipoIncidencia;
  }

  async update(id: number, updateTipoIncidenciaDto: UpdateTipoIncidenciaDto): Promise<TipoIncidencia> {
    const tipoIncidencia = await this.findOne(id);

    // Verificar duplicados si se actualiza el nombre
    if (updateTipoIncidenciaDto.nombre && updateTipoIncidenciaDto.nombre !== tipoIncidencia.nombre) {
      const duplicado = await this.tipoIncidenciaRepository.findOne({
        where: { nombre: updateTipoIncidenciaDto.nombre }
      });

      if (duplicado) {
        throw new ConflictException(`Ya existe un tipo de incidencia con el nombre "${updateTipoIncidenciaDto.nombre}"`);
      }
    }

    Object.assign(tipoIncidencia, updateTipoIncidenciaDto);
    return await this.tipoIncidenciaRepository.save(tipoIncidencia);
  }

  async remove(id: number): Promise<void> {
    const tipoIncidencia = await this.tipoIncidenciaRepository.findOne({
      where: { id_tipo_incidencia: id },
      relations: ['incidencias']
    });

    if (!tipoIncidencia) {
      throw new NotFoundException(`Tipo de incidencia con ID ${id} no encontrado`);
    }

    // Verificar si tiene incidencias asociadas
    if (tipoIncidencia.incidencias && tipoIncidencia.incidencias.length > 0) {
      throw new ConflictException(
        `No se puede eliminar el tipo de incidencia "${tipoIncidencia.nombre}" porque tiene ${tipoIncidencia.incidencias.length} incidencia(s) asociada(s).`
      );
    }

    await this.tipoIncidenciaRepository.remove(tipoIncidencia);
  }

  async countIncidencias(id: number): Promise<number> {
    const tipoIncidencia = await this.tipoIncidenciaRepository.findOne({
      where: { id_tipo_incidencia: id },
      relations: ['incidencias']
    });

    if (!tipoIncidencia) {
      throw new NotFoundException(`Tipo de incidencia con ID ${id} no encontrado`);
    }

    return tipoIncidencia.incidencias?.length || 0;
  }
}

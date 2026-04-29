import {
  Injectable,
  NotFoundException
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { FaltaAdministrativa } from './entities/falta-administrativa.entity';

import { CreateFaltaAdministrativaDto } from './dto/create-falta-administrativa.dto';
import { UpdateFaltaAdministrativaDto } from './dto/update-falta-administrativa.dto';

import { EmpleadoService } from '../empleado/empleado.service';

@Injectable()
export class FaltaAdministrativaService {

  constructor(

    @InjectRepository(FaltaAdministrativa)
    private faltaRepository: Repository<FaltaAdministrativa>,

    private empleadoService: EmpleadoService

  ) { }

  async create(
    createDto: CreateFaltaAdministrativaDto
  ): Promise<FaltaAdministrativa> {

    // Verificar empleado existente
    await this.empleadoService.findOne(createDto.id_empleado);

    const falta = this.faltaRepository.create(createDto);

    return await this.faltaRepository.save(falta);
  }

  async findAll(): Promise<FaltaAdministrativa[]> {

    return await this.faltaRepository.find({
      relations: ['empleado'],
      order: {
        id_falta_administrativa: 'DESC'
      }
    });
  }

  async findOne(id: number): Promise<FaltaAdministrativa> {

    const falta = await this.faltaRepository.findOne({
      where: {
        id_falta_administrativa: id
      },
      relations: ['empleado']
    });

    if (!falta) {
      throw new NotFoundException(
        `Falta administrativa con ID ${id} no encontrada`
      );
    }

    return falta;
  }

  async findByEmpleado(
    id_empleado: number
  ): Promise<FaltaAdministrativa[]> {

    return await this.faltaRepository.find({
      where: {
        id_empleado
      },
      relations: ['empleado'],
      order: {
        fecha: 'DESC'
      }
    });
  }

  async update(
    id: number,
    updateDto: UpdateFaltaAdministrativaDto
  ): Promise<FaltaAdministrativa> {

    const falta = await this.findOne(id);

    if (updateDto.id_empleado) {
      await this.empleadoService.findOne(updateDto.id_empleado);
    }

    Object.assign(falta, updateDto);

    return await this.faltaRepository.save(falta);
  }

  async remove(id: number): Promise<void> {

    const falta = await this.findOne(id);

    await this.faltaRepository.remove(falta);
  }
}

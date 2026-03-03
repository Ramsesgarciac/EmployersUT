import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Empleado } from './entities/empleado.entity';
import { CreateEmpleadoDto } from './dto/create-empleado.dto';
import { UpdateEmpleadoDto } from './dto/update-empleado.dto';
import { EventoService } from '../evento/evento.service';

@Injectable()
export class EmpleadoService {
  constructor(
    @InjectRepository(Empleado)
    private empleadoRepository: Repository<Empleado>,
    private eventoService: EventoService,
  ) { }

  async create(createEmpleadoDto: CreateEmpleadoDto): Promise<Empleado> {
    // Verificar si ya existe empleado con mismo CURP o RFC
    const existente = await this.empleadoRepository.findOne({
      where: [
        { curp: createEmpleadoDto.curp },
        { rfc: createEmpleadoDto.rfc },
        { numero_empleado: createEmpleadoDto.numero_empleado }
      ]
    });

    if (existente) {
      throw new ConflictException('Ya existe un empleado con ese CURP, RFC o número de empleado');
    }

    // Crear empleado
    const empleado = this.empleadoRepository.create(createEmpleadoDto);
    const empleadoGuardado = await this.empleadoRepository.save(empleado);

    // Crear evento de "Alta en el trabajo" automáticamente
    try {
      await this.eventoService.create({
        id_empleado: empleadoGuardado.id_empleado,
        id_tipo_evento: 4,  // ID del tipo "Alta en el trabajo"
        fecha_evento: new Date(),
        cargo_nuevo: createEmpleadoDto.puesto,
        salario_nuevo: createEmpleadoDto.salario_actual
      });
    } catch (error) {
      console.error('Error al crear evento de alta:', error);
    }

    return empleadoGuardado;
  }

  async findAll(): Promise<Empleado[]> {
    return await this.empleadoRepository.find({
      relations: ['categoria', 'incidencias', 'documentos', 'hojaVida', 'contratos'],
      order: { id_empleado: 'DESC' }
    });
  }

  async findActive(): Promise<Empleado[]> {
    return await this.empleadoRepository.find({
      where: { activo: true },
      relations: ['categoria'],
      order: { nombre: 'ASC' }
    });
  }

  async findDisctive(): Promise<Empleado[]> {
    return await this.empleadoRepository.find({
      where: { activo: false },
      relations: ['categoria'],
      order: { nombre: 'ASC' }
    });
  }

  async findOne(id: number): Promise<Empleado> {
    const empleado = await this.empleadoRepository.findOne({
      where: { id_empleado: id },
      relations: ['categoria', 'incidencias', 'documentos', 'hojaVida', 'contratos']
    });

    if (!empleado) {
      throw new NotFoundException(`Empleado con ID ${id} no encontrado`);
    }

    return empleado;
  }

  async update(id: number, updateEmpleadoDto: UpdateEmpleadoDto): Promise<Empleado> {
    const empleado = await this.findOne(id);

    // Verificar duplicados si se actualizan campos únicos
    if (updateEmpleadoDto.curp || updateEmpleadoDto.rfc || updateEmpleadoDto.numero_empleado) {
      const duplicado = await this.empleadoRepository.findOne({
        where: [
          { curp: updateEmpleadoDto.curp },
          { rfc: updateEmpleadoDto.rfc },
          { numero_empleado: updateEmpleadoDto.numero_empleado }
        ]
      });

      if (duplicado && duplicado.id_empleado !== id) {
        throw new ConflictException('Ya existe un empleado con esos datos');
      }
    }

    Object.assign(empleado, updateEmpleadoDto);
    return await this.empleadoRepository.save(empleado);
  }

  async deactivate(id: number): Promise<Empleado> {
    const empleado = await this.findOne(id);

    //  Primero desactivar el empleado
    empleado.activo = false;
    const empleadoDesactivado = await this.empleadoRepository.save(empleado);

    //  Crear evento de "Baja" automáticamente (ID 5)
    try {
      await this.eventoService.createEventoSinValidacion({
        id_empleado: empleadoDesactivado.id_empleado,
        id_tipo_evento: 5,  // ID del tipo "Baja del empleado"
        fecha_evento: new Date(),
        cargo_anterior: empleadoDesactivado.puesto,
      });
    } catch (error) {
      console.error('Error al crear evento de baja:', error);
    }

    return empleadoDesactivado;
  }

  async remove(id: number): Promise<void> {
    const empleado = await this.findOne(id);
    await this.empleadoRepository.remove(empleado);
  }

  async findByCategoria(id_categoria: number): Promise<Empleado[]> {
    return await this.empleadoRepository.find({
      where: { id_categoria },
      relations: ['categoria']
    });
  }

  async findByNumeroEmpleado(numero_empleado: number): Promise<Empleado> {
    const empleado = await this.empleadoRepository.findOne({
      where: { numero_empleado },
      relations: ['categoria']
    });

    if (!empleado) {
      throw new NotFoundException(`Empleado con número ${numero_empleado} no encontrado`);
    }

    return empleado;
  }
}
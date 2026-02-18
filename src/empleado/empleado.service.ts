import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Empleado } from './entities/empleado.entity';
import { CreateEmpleadoDto } from './dto/create-empleado.dto';
import { UpdateEmpleadoDto } from './dto/update-empleado.dto';

@Injectable()
export class EmpleadoService {
  constructor(
    @InjectRepository(Empleado)
    private empleadoRepository: Repository<Empleado>,
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

    const empleado = this.empleadoRepository.create(createEmpleadoDto);
    return await this.empleadoRepository.save(empleado);
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


  //Al momento de subir un documento poner como prefijo el nombre y el numero de empleado de el trabajador en el nombre del documento


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
    empleado.activo = false;
    return await this.empleadoRepository.save(empleado);
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
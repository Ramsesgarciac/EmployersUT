import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Evento } from './entities/evento.entity';
import { HojaVida } from '../hoja-vida/entities/hoja-vida.entity';
import { Empleado } from '../empleado/entities/empleado.entity';
import { CatalogoEventos } from '../catalogo-eventos/entities/catalogo-evento.entity';
import { CreateEventoDto } from './dto/create-evento.dto';
import { UpdateEventoDto } from './dto/update-evento.dto';

@Injectable()
export class EventoService {
  constructor(
    @InjectRepository(Evento)
    private eventoRepository: Repository<Evento>,
    @InjectRepository(HojaVida)
    private hojaVidaRepository: Repository<HojaVida>,
    @InjectRepository(Empleado)
    private empleadoRepository: Repository<Empleado>,
    @InjectRepository(CatalogoEventos)
    private catalogoRepository: Repository<CatalogoEventos>,
  ) { }

  async create(createEventoDto: CreateEventoDto): Promise<Evento> {
    const { id_empleado, ...eventoData } = createEventoDto;

    // Verificar que el empleado existe y está activo
    const empleado = await this.empleadoRepository.findOne({
      where: { id_empleado }
    });

    if (!empleado) {
      throw new NotFoundException(`Empleado con ID ${id_empleado} no encontrado`);
    }

    if (!empleado.activo) {
      throw new BadRequestException(
        'No se pueden agregar eventos a un empleado inactivo'
      );
    }

    // Verificar que el tipo de evento existe
    const tipoEvento = await this.catalogoRepository.findOne({
      where: { id_tipo_evento: eventoData.id_tipo_evento }
    });

    if (!tipoEvento) {
      throw new NotFoundException(
        `Tipo de evento con ID ${eventoData.id_tipo_evento} no encontrado`
      );
    }

    // Buscar o crear hoja de vida
    let hojaVida = await this.hojaVidaRepository.findOne({
      where: { id_empleado }
    });

    if (!hojaVida) {
      hojaVida = this.hojaVidaRepository.create({ id_empleado });
      hojaVida = await this.hojaVidaRepository.save(hojaVida);
    }

    // Crear evento
    const evento = this.eventoRepository.create({
      ...eventoData,
      id_hoja_vida: hojaVida.id_hoja_vida
    });

    return await this.eventoRepository.save(evento);
  }

  async findByEmpleado(id_empleado: number): Promise<Evento[]> {
    const hojaVida = await this.hojaVidaRepository.findOne({
      where: { id_empleado }
    });

    if (!hojaVida) {
      return [];
    }

    return await this.eventoRepository.find({
      where: { id_hoja_vida: hojaVida.id_hoja_vida },
      relations: ['tipoEvento'],
      order: { fecha_evento: 'DESC' }
    });
  }

  async findOne(id: number): Promise<Evento> {
    const evento = await this.eventoRepository.findOne({
      where: { id_evento: id },
      relations: ['tipoEvento', 'hojaVida', 'hojaVida.empleado']
    });

    if (!evento) {
      throw new NotFoundException(`Evento con ID ${id} no encontrado`);
    }

    return evento;
  }

  async update(id: number, updateEventoDto: UpdateEventoDto): Promise<Evento> {
    const evento = await this.findOne(id);

    // Verificar tipo de evento si se está actualizando
    if (updateEventoDto.id_tipo_evento) {
      const tipoEvento = await this.catalogoRepository.findOne({
        where: { id_tipo_evento: updateEventoDto.id_tipo_evento }
      });

      if (!tipoEvento) {
        throw new NotFoundException(
          `Tipo de evento con ID ${updateEventoDto.id_tipo_evento} no encontrado`
        );
      }
    }

    Object.assign(evento, updateEventoDto);
    return await this.eventoRepository.save(evento);
  }

  async remove(id: number): Promise<void> {
    const evento = await this.findOne(id);
    await this.eventoRepository.remove(evento);
  }
}
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TipoContrato } from './entities/tipo-contrato.entity';
import { CreateTipoContratoDto } from './dto/create-tipo-contrato.dto';
import { UpdateTipoContratoDto } from './dto/update-tipo-contrato.dto';

@Injectable()
export class TipoContratoService {
  constructor(
    @InjectRepository(TipoContrato)
    private tipoContratoRepository: Repository<TipoContrato>,
  ) { }

  async create(createDto: CreateTipoContratoDto): Promise<TipoContrato> {
    const tipoContrato = this.tipoContratoRepository.create(createDto);
    return await this.tipoContratoRepository.save(tipoContrato);
  }

  async findAll(): Promise<TipoContrato[]> {
    return await this.tipoContratoRepository.find({
      order: { nombre: 'ASC' }
    });
  }

  async findOne(id: number): Promise<TipoContrato> {
    const tipoContrato = await this.tipoContratoRepository.findOne({
      where: { id_tipo_contrato: id }
    });

    if (!tipoContrato) {
      throw new NotFoundException(`Tipo de contrato con ID ${id} no encontrado`);
    }

    return tipoContrato;
  }

  async update(id: number, updateDto: UpdateTipoContratoDto): Promise<TipoContrato> {
    const tipoContrato = await this.findOne(id);
    Object.assign(tipoContrato, updateDto);
    return await this.tipoContratoRepository.save(tipoContrato);
  }

  async remove(id: number): Promise<void> {
    const tipoContrato = await this.tipoContratoRepository.findOne({
      where: { id_tipo_contrato: id },
      relations: ['contratos']
    });

    if (!tipoContrato) {
      throw new NotFoundException(`Tipo de contrato con ID ${id} no encontrado`);
    }

    if (tipoContrato.contratos && tipoContrato.contratos.length > 0) {
      throw new ConflictException(
        `No se puede eliminar porque hay ${tipoContrato.contratos.length} contrato(s) asociado(s)`
      );
    }

    await this.tipoContratoRepository.remove(tipoContrato);
  }
}
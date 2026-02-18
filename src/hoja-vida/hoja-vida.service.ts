import { Injectable } from '@nestjs/common';
import { CreateHojaVidaDto } from './dto/create-hoja-vida.dto';
import { UpdateHojaVidaDto } from './dto/update-hoja-vida.dto';

@Injectable()
export class HojaVidaService {
  create(createHojaVidaDto: CreateHojaVidaDto) {
    return 'This action adds a new hojaVida';
  }

  findAll() {
    return `This action returns all hojaVida`;
  }

  findOne(id: number) {
    return `This action returns a #${id} hojaVida`;
  }

  update(id: number, updateHojaVidaDto: UpdateHojaVidaDto) {
    return `This action updates a #${id} hojaVida`;
  }

  remove(id: number) {
    return `This action removes a #${id} hojaVida`;
  }
}

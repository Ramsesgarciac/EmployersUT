import { Injectable } from '@nestjs/common';
import { CreateTipoDocDto } from './dto/create-tipo-doc.dto';
import { UpdateTipoDocDto } from './dto/update-tipo-doc.dto';

@Injectable()
export class TipoDocService {
  create(createTipoDocDto: CreateTipoDocDto) {
    return 'This action adds a new tipoDoc';
  }

  findAll() {
    return `This action returns all tipoDoc`;
  }

  findOne(id: number) {
    return `This action returns a #${id} tipoDoc`;
  }

  update(id: number, updateTipoDocDto: UpdateTipoDocDto) {
    return `This action updates a #${id} tipoDoc`;
  }

  remove(id: number) {
    return `This action removes a #${id} tipoDoc`;
  }
}

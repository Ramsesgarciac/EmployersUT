import { Injectable } from '@nestjs/common';
import { CreateDocEmpleadoDto } from './dto/create-doc-empleado.dto';
import { UpdateDocEmpleadoDto } from './dto/update-doc-empleado.dto';

@Injectable()
export class DocEmpleadoService {
  create(createDocEmpleadoDto: CreateDocEmpleadoDto) {
    return 'This action adds a new docEmpleado';
  }

  findAll() {
    return `This action returns all docEmpleado`;
  }

  findOne(id: number) {
    return `This action returns a #${id} docEmpleado`;
  }

  update(id: number, updateDocEmpleadoDto: UpdateDocEmpleadoDto) {
    return `This action updates a #${id} docEmpleado`;
  }

  remove(id: number) {
    return `This action removes a #${id} docEmpleado`;
  }
}

import { Test, TestingModule } from '@nestjs/testing';
import { DocEmpleadoController } from './doc-empleado.controller';
import { DocEmpleadoService } from './doc-empleado.service';

describe('DocEmpleadoController', () => {
  let controller: DocEmpleadoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocEmpleadoController],
      providers: [DocEmpleadoService],
    }).compile();

    controller = module.get<DocEmpleadoController>(DocEmpleadoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

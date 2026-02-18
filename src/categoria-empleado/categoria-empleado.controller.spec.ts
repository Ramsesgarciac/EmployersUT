import { Test, TestingModule } from '@nestjs/testing';
import { CategoriaEmpleadoController } from './categoria-empleado.controller';
import { CategoriaEmpleadoService } from './categoria-empleado.service';

describe('CategoriaEmpleadoController', () => {
  let controller: CategoriaEmpleadoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriaEmpleadoController],
      providers: [CategoriaEmpleadoService],
    }).compile();

    controller = module.get<CategoriaEmpleadoController>(CategoriaEmpleadoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

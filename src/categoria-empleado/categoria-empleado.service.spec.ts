import { Test, TestingModule } from '@nestjs/testing';
import { CategoriaEmpleadoService } from './categoria-empleado.service';

describe('CategoriaEmpleadoService', () => {
  let service: CategoriaEmpleadoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CategoriaEmpleadoService],
    }).compile();

    service = module.get<CategoriaEmpleadoService>(CategoriaEmpleadoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

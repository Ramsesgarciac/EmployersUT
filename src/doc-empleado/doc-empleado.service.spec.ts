import { Test, TestingModule } from '@nestjs/testing';
import { DocEmpleadoService } from './doc-empleado.service';

describe('DocEmpleadoService', () => {
  let service: DocEmpleadoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DocEmpleadoService],
    }).compile();

    service = module.get<DocEmpleadoService>(DocEmpleadoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { TipoDocService } from './tipo-doc.service';

describe('TipoDocService', () => {
  let service: TipoDocService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TipoDocService],
    }).compile();

    service = module.get<TipoDocService>(TipoDocService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

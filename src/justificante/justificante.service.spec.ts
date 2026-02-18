import { Test, TestingModule } from '@nestjs/testing';
import { JustificanteService } from './justificante.service';

describe('JustificanteService', () => {
  let service: JustificanteService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JustificanteService],
    }).compile();

    service = module.get<JustificanteService>(JustificanteService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { FaltaAdministrativaService } from './falta-administrativa.service';

describe('FaltaAdministrativaService', () => {
  let service: FaltaAdministrativaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FaltaAdministrativaService],
    }).compile();

    service = module.get<FaltaAdministrativaService>(FaltaAdministrativaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

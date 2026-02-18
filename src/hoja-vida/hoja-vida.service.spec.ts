import { Test, TestingModule } from '@nestjs/testing';
import { HojaVidaService } from './hoja-vida.service';

describe('HojaVidaService', () => {
  let service: HojaVidaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HojaVidaService],
    }).compile();

    service = module.get<HojaVidaService>(HojaVidaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { CatActividadesService } from './cat-actividades.service';

describe('CatActividadesService', () => {
  let service: CatActividadesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CatActividadesService],
    }).compile();

    service = module.get<CatActividadesService>(CatActividadesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

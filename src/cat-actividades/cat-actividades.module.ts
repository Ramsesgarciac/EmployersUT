import { Module } from '@nestjs/common';
import { CatActividadesService } from './cat-actividades.service';
import { CatActividadesController } from './cat-actividades.controller';

@Module({
  controllers: [CatActividadesController],
  providers: [CatActividadesService],
})
export class CatActividadesModule {}

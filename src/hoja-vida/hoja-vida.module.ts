import { Module } from '@nestjs/common';
import { HojaVidaService } from './hoja-vida.service';
import { HojaVidaController } from './hoja-vida.controller';

@Module({
  controllers: [HojaVidaController],
  providers: [HojaVidaService],
})
export class HojaVidaModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdendumService } from './adendum.service';
import { AdendumController } from './adendum.controller';
import { Adendum } from './entities/adendum.entity';
import { Empleado } from '../empleado/entities/empleado.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Adendum, Empleado])],
  controllers: [AdendumController],
  providers: [AdendumService],
  exports: [AdendumService],
})
export class AdendumModule { }

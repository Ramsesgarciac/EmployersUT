import { Module } from '@nestjs/common';
import { TipoDocService } from './tipo-doc.service';
import { TipoDocController } from './tipo-doc.controller';

@Module({
  controllers: [TipoDocController],
  providers: [TipoDocService],
})
export class TipoDocModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IngestController } from './ingest.controller';
import { IngestService } from './ingest.service';
import { Event } from '../../database/entities/event.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Event])],
    controllers: [IngestController],
    providers: [IngestService],
})
export class IngestModule { }

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QueryController } from './query.controller';
import { QueryService } from './query.service';
import { Event } from '../../database/entities/event.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Event])],
    controllers: [QueryController],
    providers: [QueryService],
})
export class QueryModule { }

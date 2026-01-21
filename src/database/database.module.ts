import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Event } from './entities/event.entity';

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService): TypeOrmModuleOptions => {
                const dbConfig = configService.get<TypeOrmModuleOptions>('database');
                if (!dbConfig) {
                    throw new Error('Database configuration not found');
                }
                return dbConfig;
            },
            inject: [ConfigService],
        }),
        TypeOrmModule.forFeature([Event]),
    ],
    exports: [TypeOrmModule],
})
export class DatabaseModule { }

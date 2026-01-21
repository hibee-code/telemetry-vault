import { IsOptional, IsEnum, IsString, IsDateString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { EventType } from '../../../database/entities/event.entity';

export enum GroupByField {
    SERVICE = 'service',
    TYPE = 'type',
}

export class QueryEventsDto {
    @ApiProperty({
        description: 'Start time for filtering events (ISO 8601)',
        example: '2026-01-20T00:00:00Z',
        required: false,
    })
    @IsOptional()
    @IsDateString()
    startTime?: string;

    @ApiProperty({
        description: 'End time for filtering events (ISO 8601)',
        example: '2026-01-21T23:59:59Z',
        required: false,
    })
    @IsOptional()
    @IsDateString()
    endTime?: string;

    @ApiProperty({
        description: 'Filter by event type',
        enum: EventType,
        required: false,
    })
    @IsOptional()
    @IsEnum(EventType)
    eventType?: EventType;

    @ApiProperty({
        description: 'Filter by service name',
        example: 'api-gateway',
        required: false,
    })
    @IsOptional()
    @IsString()
    serviceName?: string;

    @ApiProperty({
        description: 'Page number (1-indexed)',
        example: 1,
        default: 1,
        required: false,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @ApiProperty({
        description: 'Number of results per page',
        example: 100,
        default: 100,
        minimum: 1,
        maximum: 1000,
        required: false,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(1000)
    limit?: number = 100;

    @ApiProperty({
        description: 'Group results by field for aggregation',
        enum: GroupByField,
        required: false,
    })
    @IsOptional()
    @IsEnum(GroupByField)
    groupBy?: GroupByField;
}

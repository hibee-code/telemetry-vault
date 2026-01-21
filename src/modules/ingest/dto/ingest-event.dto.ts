import { IsString, IsEnum, IsNotEmpty, IsDateString, IsObject, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EventType } from '../../../database/entities/event.entity';

export class IngestEventDto {
    @ApiProperty({
        description: 'Unique event identifier for idempotency',
        example: 'evt_1234567890abcdef',
        maxLength: 255,
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    eventId: string;

    @ApiProperty({
        description: 'Type of telemetry event',
        enum: EventType,
        example: EventType.LOG,
    })
    @IsEnum(EventType)
    @IsNotEmpty()
    eventType: EventType;

    @ApiProperty({
        description: 'Name of the service that generated the event',
        example: 'api-gateway',
        maxLength: 255,
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    serviceName: string;

    @ApiProperty({
        description: 'Event timestamp in ISO 8601 format',
        example: '2026-01-21T12:00:00Z',
    })
    @IsDateString()
    @IsNotEmpty()
    timestamp: string;

    @ApiProperty({
        description: 'Event payload (flexible JSON structure)',
        example: {
            level: 'info',
            message: 'User logged in',
            userId: '12345',
            ip: '192.168.1.1',
        },
    })
    @IsObject()
    @IsNotEmpty()
    payload: Record<string, any>;
}

export class IngestResponseDto {
    @ApiProperty({
        description: 'Number of events successfully ingested',
        example: 10,
    })
    ingested: number;

    @ApiProperty({
        description: 'Number of duplicate events skipped',
        example: 2,
    })
    duplicates: number;

    @ApiProperty({
        description: 'Response message',
        example: 'Events ingested successfully',
    })
    message: string;
}

import {
    Controller,
    Post,
    Body,
    Req,
    HttpCode,
    HttpStatus,
    ValidationPipe,
} from '@nestjs/common';
import type { Request } from 'express';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiSecurity,
    ApiBody,
} from '@nestjs/swagger';
import { IngestService } from './ingest.service';
import { IngestEventDto, IngestResponseDto } from './dto/ingest-event.dto';

@ApiTags('Ingestion')
@ApiSecurity('api-key')
@Controller('ingest')
export class IngestController {
    constructor(private readonly ingestService: IngestService) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: 'Ingest telemetry events',
        description:
            'Ingest one or more telemetry events. Supports batch ingestion and ensures idempotency via event_id.',
    })
    @ApiBody({
        description: 'Single event or array of events to ingest',
        type: [IngestEventDto],
        examples: {
            single: {
                summary: 'Single event',
                value: {
                    eventId: 'evt_1234567890',
                    eventType: 'log',
                    serviceName: 'api-gateway',
                    timestamp: '2026-01-21T12:00:00Z',
                    payload: {
                        level: 'info',
                        message: 'User logged in',
                        userId: '12345',
                    },
                },
            },
            batch: {
                summary: 'Batch of events',
                value: [
                    {
                        eventId: 'evt_1234567890',
                        eventType: 'log',
                        serviceName: 'api-gateway',
                        timestamp: '2026-01-21T12:00:00Z',
                        payload: { level: 'info', message: 'User logged in' },
                    },
                    {
                        eventId: 'evt_0987654321',
                        eventType: 'metric',
                        serviceName: 'payment-service',
                        timestamp: '2026-01-21T12:01:00Z',
                        payload: { metric: 'payment.processed', value: 1 },
                    },
                ],
            },
        },
    })
    @ApiResponse({
        status: 201,
        description: 'Events ingested successfully',
        type: IngestResponseDto,
    })
    @ApiResponse({
        status: 400,
        description: 'Invalid request body',
    })
    @ApiResponse({
        status: 401,
        description: 'Missing or invalid API key',
    })
    @ApiResponse({
        status: 429,
        description: 'Rate limit exceeded',
    })
    @ApiResponse({
        status: 500,
        description: 'Internal server error',
    })
    async ingest(
        @Body(new ValidationPipe({ transform: true }))
        body: IngestEventDto | IngestEventDto[],
        @Req() req: Request,
    ): Promise<IngestResponseDto> {
        const events = Array.isArray(body) ? body : [body];
        const tenantId = req.tenantId!; // Auth middleware ensures this exists

        const { ingested, duplicates } = await this.ingestService.ingestEvents(
            events,
            tenantId,
        );

        return {
            ingested,
            duplicates,
            message: 'Events ingested successfully',
        };
    }
}

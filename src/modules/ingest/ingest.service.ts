import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Event } from '../../database/entities/event.entity';
import { IngestEventDto } from './dto/ingest-event.dto';
import { LoggerService } from '../../observability/logger.service';
import { TracerService } from '../../observability/tracer.service';

@Injectable()
export class IngestService {
    private batchSize: number;

    constructor(
        @InjectRepository(Event)
        private eventRepository: Repository<Event>,
        private configService: ConfigService,
        private logger: LoggerService,
        private tracer: TracerService,
    ) {
        this.batchSize = this.configService.get<number>('app.ingest.batchSize') ?? 100;
    }

    /**
     * Ingest events with batch processing and idempotency
     */
    async ingestEvents(
        events: IngestEventDto[],
        tenantId: string,
    ): Promise<{ ingested: number; duplicates: number }> {
        return this.tracer.withSpan(
            'ingest.events',
            async (span) => {
                span.setAttribute('tenant_id', tenantId);
                span.setAttribute('event_count', events.length);

                const startTime = Date.now();
                let totalIngested = 0;
                let totalDuplicates = 0;

                // Process events in batches
                for (let i = 0; i < events.length; i += this.batchSize) {
                    const batch = events.slice(i, i + this.batchSize);
                    const { ingested, duplicates } = await this.processBatch(batch, tenantId);

                    totalIngested += ingested;
                    totalDuplicates += duplicates;
                }

                const duration = Date.now() - startTime;

                this.logger.logWithMetadata('info', 'Events ingested', {
                    tenantId,
                    totalEvents: events.length,
                    ingested: totalIngested,
                    duplicates: totalDuplicates,
                    duration: `${duration}ms`,
                    throughput: `${Math.round((events.length / duration) * 1000)} events/sec`,
                });

                span.setAttribute('ingested', totalIngested);
                span.setAttribute('duplicates', totalDuplicates);

                return { ingested: totalIngested, duplicates: totalDuplicates };
            },
            { operation: 'ingest', tenant_id: tenantId },
        );
    }

    /**
     * Process a batch of events with idempotency handling
     */
    private async processBatch(
        batch: IngestEventDto[],
        tenantId: string,
    ): Promise<{ ingested: number; duplicates: number }> {
        const entities = batch.map((dto) => {
            const event = new Event();
            event.eventId = dto.eventId;
            event.tenantId = tenantId;
            event.eventType = dto.eventType;
            event.serviceName = dto.serviceName;
            event.timestamp = new Date(dto.timestamp);
            event.payload = dto.payload;
            return event;
        });

        try {
            // Use INSERT ... ON CONFLICT DO NOTHING for idempotency
            // This is more efficient than checking for duplicates first
            const result = await this.eventRepository
                .createQueryBuilder()
                .insert()
                .into(Event)
                .values(entities)
                .orIgnore() // PostgreSQL: ON CONFLICT DO NOTHING
                .execute();

            const ingested = result.identifiers.length;
            const duplicates = batch.length - ingested;

            return { ingested, duplicates };
        } catch (error) {
            this.logger.error(
                `Failed to ingest batch for tenant ${tenantId}: ${error.message}`,
                error.stack,
                'IngestService',
            );
            throw error;
        }
    }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Event } from '../../database/entities/event.entity';
import {
    QueryEventsDto,
    GroupByField,
} from './dto/query-events.dto';
import {
    QueryResponseDto,
    AggregationResponseDto,
    PaginationMetadata,
} from './dto/query-response.dto';
import { LoggerService } from '../../observability/logger.service';
import { TracerService } from '../../observability/tracer.service';

@Injectable()
export class QueryService {
    constructor(
        @InjectRepository(Event)
        private eventRepository: Repository<Event>,
        private logger: LoggerService,
        private tracer: TracerService,
    ) { }

    /**
     * Query events with filtering and pagination
     */
    async queryEvents(
        queryDto: QueryEventsDto,
        tenantId: string,
    ): Promise<QueryResponseDto | AggregationResponseDto> {
        return this.tracer.withSpan(
            'query.events',
            async (span) => {
                span.setAttribute('tenant_id', tenantId);
                span.setAttribute('has_aggregation', !!queryDto.groupBy);

                const startTime = Date.now();

                // If groupBy is specified, return aggregation
                if (queryDto.groupBy) {
                    const result = await this.aggregateEvents(queryDto, tenantId);

                    const duration = Date.now() - startTime;
                    this.logger.logWithMetadata('info', 'Events aggregated', {
                        tenantId,
                        groupBy: queryDto.groupBy,
                        resultCount: result.data.length,
                        duration: `${duration}ms`,
                    });

                    return result;
                }

                // Otherwise, return paginated results
                const queryBuilder = this.buildQueryBuilder(queryDto, tenantId);

                // Get total count
                const total = await queryBuilder.getCount();

                // Apply pagination
                const page = queryDto.page ?? 1;
                const limit = queryDto.limit ?? 100;
                const offset = (page - 1) * limit;

                const events = await queryBuilder
                    .orderBy('event.timestamp', 'DESC')
                    .skip(offset)
                    .take(limit)
                    .getMany();

                const duration = Date.now() - startTime;

                this.logger.logWithMetadata('info', 'Events queried', {
                    tenantId,
                    filters: {
                        startTime: queryDto.startTime,
                        endTime: queryDto.endTime,
                        eventType: queryDto.eventType,
                        serviceName: queryDto.serviceName,
                    },
                    page,
                    limit,
                    total,
                    resultCount: events.length,
                    duration: `${duration}ms`,
                });

                const pagination: PaginationMetadata = {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                    hasNext: page * limit < total,
                    hasPrev: page > 1,
                };

                return { data: events, pagination };
            },
            { operation: 'query', tenant_id: tenantId },
        );
    }

    /**
     * Aggregate events by service or type
     */
    private async aggregateEvents(
        queryDto: QueryEventsDto,
        tenantId: string,
    ): Promise<AggregationResponseDto> {
        const queryBuilder = this.buildQueryBuilder(queryDto, tenantId);

        const groupByColumn =
            queryDto.groupBy === GroupByField.SERVICE
                ? 'event.serviceName'
                : 'event.eventType';

        const results = await queryBuilder
            .select(groupByColumn, 'key')
            .addSelect('COUNT(*)', 'count')
            .groupBy(groupByColumn)
            .orderBy('count', 'DESC')
            .getRawMany();

        const data = results.map((row) => ({
            key: row.key,
            count: parseInt(row.count, 10),
        }));

        const total = data.reduce((sum, item) => sum + item.count, 0);

        return { data, total };
    }

    /**
     * Build query with filters and tenant isolation
     */
    private buildQueryBuilder(
        queryDto: QueryEventsDto,
        tenantId: string,
    ): SelectQueryBuilder<Event> {
        const queryBuilder = this.eventRepository
            .createQueryBuilder('event')
            .where('event.tenantId = :tenantId', { tenantId });

        // Apply time range filters
        if (queryDto.startTime) {
            queryBuilder.andWhere('event.timestamp >= :startTime', {
                startTime: new Date(queryDto.startTime),
            });
        }

        if (queryDto.endTime) {
            queryBuilder.andWhere('event.timestamp <= :endTime', {
                endTime: new Date(queryDto.endTime),
            });
        }

        // Apply event type filter
        if (queryDto.eventType) {
            queryBuilder.andWhere('event.eventType = :eventType', {
                eventType: queryDto.eventType,
            });
        }

        // Apply service name filter
        if (queryDto.serviceName) {
            queryBuilder.andWhere('event.serviceName = :serviceName', {
                serviceName: queryDto.serviceName,
            });
        }

        return queryBuilder;
    }
}

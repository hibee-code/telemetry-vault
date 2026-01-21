import { ApiProperty } from '@nestjs/swagger';
import { Event } from '../../../database/entities/event.entity';

export class PaginationMetadata {
    @ApiProperty({ description: 'Current page number', example: 1 })
    page: number;

    @ApiProperty({ description: 'Results per page', example: 100 })
    limit: number;

    @ApiProperty({ description: 'Total number of results', example: 1500 })
    total: number;

    @ApiProperty({ description: 'Total number of pages', example: 15 })
    totalPages: number;

    @ApiProperty({ description: 'Whether there is a next page', example: true })
    hasNext: boolean;

    @ApiProperty({ description: 'Whether there is a previous page', example: false })
    hasPrev: boolean;
}

export class QueryResponseDto {
    @ApiProperty({
        description: 'Array of events matching the query',
        type: [Event],
    })
    data: Event[];

    @ApiProperty({
        description: 'Pagination metadata',
        type: PaginationMetadata,
    })
    pagination: PaginationMetadata;
}

export class AggregationResult {
    @ApiProperty({ description: 'Aggregation key (service name or event type)' })
    key: string;

    @ApiProperty({ description: 'Count of events for this key' })
    count: number;
}

export class AggregationResponseDto {
    @ApiProperty({
        description: 'Aggregation results',
        type: [AggregationResult],
    })
    data: AggregationResult[];

    @ApiProperty({
        description: 'Total count across all groups',
        example: 1500,
    })
    total: number;
}

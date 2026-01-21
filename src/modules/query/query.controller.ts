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
import { QueryService } from './query.service';
import { QueryEventsDto } from './dto/query-events.dto';
import { QueryResponseDto, AggregationResponseDto } from './dto/query-response.dto';

@ApiTags('Query')
@ApiSecurity('api-key')
@Controller('query')
export class QueryController {
    constructor(private readonly queryService: QueryService) { }

    @Post()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Query telemetry events',
        description:
            'Query events with filtering, pagination, and optional aggregation. Supports time range, event type, and service name filters.',
    })
    @ApiBody({
        description: 'Query parameters',
        type: QueryEventsDto,
        examples: {
            simple: {
                summary: 'Simple query with pagination',
                value: {
                    page: 1,
                    limit: 100,
                },
            },
            filtered: {
                summary: 'Filtered query by time and service',
                value: {
                    startTime: '2026-01-20T00:00:00Z',
                    endTime: '2026-01-21T23:59:59Z',
                    serviceName: 'api-gateway',
                    eventType: 'log',
                    page: 1,
                    limit: 50,
                },
            },
            aggregation: {
                summary: 'Aggregation by service',
                value: {
                    startTime: '2026-01-20T00:00:00Z',
                    endTime: '2026-01-21T23:59:59Z',
                    groupBy: 'service',
                },
            },
        },
    })
    @ApiResponse({
        status: 200,
        description: 'Query executed successfully',
        type: QueryResponseDto,
    })
    @ApiResponse({
        status: 400,
        description: 'Invalid query parameters',
    })
    @ApiResponse({
        status: 401,
        description: 'Missing or invalid API key',
    })
    @ApiResponse({
        status: 500,
        description: 'Internal server error',
    })
    async query(
        @Body(new ValidationPipe({ transform: true })) queryDto: QueryEventsDto,
        @Req() req: Request,
    ): Promise<QueryResponseDto | AggregationResponseDto> {
        const tenantId = req.tenantId!; // Auth middleware ensures this exists
        return this.queryService.queryEvents(queryDto, tenantId);
    }
}

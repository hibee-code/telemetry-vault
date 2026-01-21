import { Injectable } from '@nestjs/common';
import { trace, context, SpanStatusCode, Span } from '@opentelemetry/api';

@Injectable()
export class TracerService {
    private tracer = trace.getTracer('telemetry-vault', '1.0.0');

    /**
     * Start a new span for tracing
     */
    startSpan(name: string, attributes?: Record<string, any>): Span {
        const span = this.tracer.startSpan(name, {
            attributes,
        });
        return span;
    }

    /**
     * Execute a function within a span context
     */
    async withSpan<T>(
        name: string,
        fn: (span: Span) => Promise<T>,
        attributes?: Record<string, any>,
    ): Promise<T> {
        const span = this.startSpan(name, attributes);

        try {
            const result = await context.with(trace.setSpan(context.active(), span), () => fn(span));
            span.setStatus({ code: SpanStatusCode.OK });
            return result;
        } catch (error) {
            span.setStatus({
                code: SpanStatusCode.ERROR,
                message: error.message,
            });
            span.recordException(error);
            throw error;
        } finally {
            span.end();
        }
    }

    /**
     * Add event to current span
     */
    addEvent(name: string, attributes?: Record<string, any>) {
        const span = trace.getActiveSpan();
        if (span) {
            span.addEvent(name, attributes);
        }
    }

    /**
     * Set attribute on current span
     */
    setAttribute(key: string, value: any) {
        const span = trace.getActiveSpan();
        if (span) {
            span.setAttribute(key, value);
        }
    }
}

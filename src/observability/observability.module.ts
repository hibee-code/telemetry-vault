import { Module, Global } from '@nestjs/common';
import { LoggerService } from './logger.service';
import { TracerService } from './tracer.service';

@Global()
@Module({
    providers: [LoggerService, TracerService],
    exports: [LoggerService, TracerService],
})
export class ObservabilityModule { }

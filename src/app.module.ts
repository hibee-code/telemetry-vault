import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { ObservabilityModule } from './observability/observability.module';
import { IngestModule } from './modules/ingest/ingest.module';
import { QueryModule } from './modules/query/query.module';
import { AuthMiddleware } from './common/middleware/auth.middleware';
import { RateLimitMiddleware } from './common/middleware/rate-limit.middleware';

import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    ObservabilityModule,
    IngestModule,
    QueryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply auth middleware to all routes except health check
    consumer
      .apply(AuthMiddleware)
      .exclude('health')
      .forRoutes('*');

    // Apply rate limiting middleware after auth
    consumer.apply(RateLimitMiddleware).forRoutes('*');
  }
}

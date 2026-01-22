import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { swaggerConfig } from './config/swagger.config';
import { AppModule } from './app.module';
import { LoggerService } from './observability/logger.service';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  // Get logger service
  const logger = app.get(LoggerService);
  app.useLogger(logger);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter(logger));

  // Global logging interceptor
  app.useGlobalInterceptors(new LoggingInterceptor(logger));

  // Swagger documentation
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    jsonDocumentUrl: 'api/docs-json',
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);

  logger.log(`🚀 Telemetry Vault is running on: http://localhost:${port}`, 'Bootstrap');
  logger.log(`📚 API Documentation: http://localhost:${port}/api/docs`, 'Bootstrap');
}

bootstrap();

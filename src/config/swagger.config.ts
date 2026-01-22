import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
    .setTitle('Telemetry Vault API')
    .setDescription(
        `High-throughput telemetry ingestion service.
    
    `,
    )
    .setVersion('1.0.0')
    .addServer('http://localhost:3000', 'Local Environment')
    .addServer('https://api.staging.telemetry-vault.com', 'Staging Environment')
    .addServer('https://api.telemetry-vault.com', 'Production Environment')
    .addApiKey(
        {
            type: 'apiKey',
            name: 'X-API-Key',
            in: 'header',
            description: 'API key for tenant authentication',
        },
        'api-key',
    )
    .addTag('Ingestion', 'Endpoints for ingesting telemetry data')
    .addTag('Query', 'Endpoints for querying and analyzing data')
    .addBearerAuth()
    .build();

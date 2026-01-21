import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateEventsTable1737460000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create events table
        await queryRunner.createTable(
            new Table({
                name: 'events',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        generationStrategy: 'uuid',
                        default: 'uuid_generate_v4()',
                    },
                    {
                        name: 'event_id',
                        type: 'varchar',
                        length: '255',
                        isNullable: false,
                        comment: 'Client-provided event ID for idempotency',
                    },
                    {
                        name: 'tenant_id',
                        type: 'varchar',
                        length: '100',
                        isNullable: false,
                        comment: 'Tenant identifier from API key',
                    },
                    {
                        name: 'event_type',
                        type: 'enum',
                        enum: ['log', 'metric', 'trace'],
                        isNullable: false,
                        comment: 'Type of telemetry event',
                    },
                    {
                        name: 'service_name',
                        type: 'varchar',
                        length: '255',
                        isNullable: false,
                        comment: 'Name of the service that generated the event',
                    },
                    {
                        name: 'timestamp',
                        type: 'timestamptz',
                        isNullable: false,
                        comment: 'Event timestamp (client-provided)',
                    },
                    {
                        name: 'payload',
                        type: 'jsonb',
                        isNullable: false,
                        comment: 'Event payload (flexible JSON structure)',
                    },
                    {
                        name: 'created_at',
                        type: 'timestamptz',
                        default: 'now()',
                        isNullable: false,
                        comment: 'Server timestamp when event was ingested',
                    },
                ],
            }),
            true,
        );

        // Create unique index for idempotency
        await queryRunner.createIndex(
            'events',
            new TableIndex({
                name: 'idx_event_id_tenant',
                columnNames: ['event_id', 'tenant_id'],
                isUnique: true,
            }),
        );

        // Create composite index for tenant + timestamp queries
        await queryRunner.createIndex(
            'events',
            new TableIndex({
                name: 'idx_event_tenant_timestamp',
                columnNames: ['tenant_id', 'timestamp'],
            }),
        );

        // Create composite index for tenant + type + timestamp queries
        await queryRunner.createIndex(
            'events',
            new TableIndex({
                name: 'idx_event_tenant_type_timestamp',
                columnNames: ['tenant_id', 'event_type', 'timestamp'],
            }),
        );

        // Create composite index for tenant + service + timestamp queries
        await queryRunner.createIndex(
            'events',
            new TableIndex({
                name: 'idx_event_tenant_service_timestamp',
                columnNames: ['tenant_id', 'service_name', 'timestamp'],
            }),
        );

        // Enable UUID extension if not already enabled
        await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('events');
    }
}

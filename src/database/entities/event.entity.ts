import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    Index,
} from 'typeorm';

export enum EventType {
    LOG = 'log',
    METRIC = 'metric',
    TRACE = 'trace',
}

@Entity('events')
@Index('idx_event_tenant_timestamp', ['tenantId', 'timestamp'])
@Index('idx_event_tenant_type_timestamp', ['tenantId', 'eventType', 'timestamp'])
@Index('idx_event_tenant_service_timestamp', ['tenantId', 'serviceName', 'timestamp'])
export class Event {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'event_id', type: 'varchar', length: 255 })
    @Index('idx_event_id_tenant', ['eventId', 'tenantId'], { unique: true })
    eventId: string;

    @Column({ name: 'tenant_id', type: 'varchar', length: 100 })
    tenantId: string;

    @Column({
        name: 'event_type',
        type: 'enum',
        enum: EventType,
    })
    eventType: EventType;

    @Column({ name: 'service_name', type: 'varchar', length: 255 })
    serviceName: string;

    @Column({ type: 'timestamptz' })
    timestamp: Date;

    @Column({ type: 'jsonb' })
    payload: Record<string, any>;

    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    createdAt: Date;
}

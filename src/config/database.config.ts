import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';


export default registerAs('database', (): TypeOrmModuleOptions => {
    // Validate required environment variables
    const requiredEnvVars = [
        'DB_HOST',
        'DB_PORT',
        'DB_USERNAME',
        'DB_PASSWORD',
        'DB_DATABASE',
    ];

    const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

    if (missingVars.length > 0) {
        throw new Error(
            `Missing required database environment variables: ${missingVars.join(', ')}. ` +
            'Please ensure all variables are set in your .env file.'
        );
    }

    return {
        type: 'postgres',
        host: process.env.DB_HOST!,
        port: parseInt(process.env.DB_PORT!, 10),
        username: process.env.DB_USERNAME!,
        password: process.env.DB_PASSWORD!,
        database: process.env.DB_DATABASE!,
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
        synchronize: process.env.DB_SYNCHRONIZE === 'true',
        logging: process.env.DB_LOGGING === 'true',
        poolSize: 50,
        extra: {
            max: 50,
            min: 10,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000,
        },
    };
});

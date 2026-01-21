import { registerAs } from '@nestjs/config';

/**
 * Application configuration factory
 * All values are read from environment variables
 * Validates required configuration on startup
 */
export default registerAs('app', () => {
    // Validate required environment variables
    const requiredEnvVars = ['API_KEYS'];
    const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

    if (missingVars.length > 0) {
        throw new Error(
            `Missing required environment variables: ${missingVars.join(', ')}. ` +
            'Please ensure all variables are set in your .env file.'
        );
    }

    return {
        nodeEnv: process.env.NODE_ENV || 'development',
        port: parseInt(process.env.PORT || '3000', 10),
        apiKeys: parseApiKeys(process.env.API_KEYS!),
        rateLimit: {
            windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
            maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '1000', 10),
        },
        ingest: {
            batchSize: parseInt(process.env.INGEST_BATCH_SIZE || '100', 10),
        },
        observability: {
            logLevel: process.env.LOG_LEVEL || 'info',
            enableTracing: process.env.ENABLE_TRACING === 'true',
        },
    };
});

/**
 * Parse API keys from environment variable
 * Format: key1:tenant1,key2:tenant2
 * @throws Error if API_KEYS format is invalid
 */
function parseApiKeys(apiKeysStr: string): Map<string, string> {
    const apiKeys = new Map<string, string>();

    if (!apiKeysStr || apiKeysStr.trim() === '') {
        throw new Error(
            'API_KEYS environment variable is empty. ' +
            'Format: key1:tenant1,key2:tenant2'
        );
    }

    const pairs = apiKeysStr.split(',');
    for (const pair of pairs) {
        const [key, tenantId] = pair.split(':');
        if (!key || !tenantId) {
            throw new Error(
                `Invalid API_KEYS format: "${pair}". ` +
                'Expected format: key:tenant'
            );
        }
        apiKeys.set(key.trim(), tenantId.trim());
    }

    if (apiKeys.size === 0) {
        throw new Error('No valid API keys found in API_KEYS environment variable');
    }

    return apiKeys;
}

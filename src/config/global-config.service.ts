import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';

export interface DatabaseConfig {
  url: string;
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  ssl: boolean;
  logging: boolean;
  synchronize: boolean;
  migrationsRun: boolean;
}

export interface JwtConfig {
  secret: string;
  refreshSecret: string;
  expiresIn: string;
  refreshExpiresIn: string;
  issuer: string;
  audience: string;
}

export interface SecurityConfig {
  bcryptRounds: number;
  corsOrigins: string[];
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };
  helmet: {
    contentSecurityPolicy: boolean;
    hsts: boolean;
    noSniff: boolean;
    frameguard: boolean;
  };
}

export interface ServerConfig {
  port: number;
  host: string;
  nodeEnv: string;
  apiPrefix: string;
  swaggerEnabled: boolean;
  swaggerPath: string;
  logLevel: string;
  timezone: string;
}

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db: number;
  ttl: number;
  maxRetriesPerRequest: number;
}

export interface StorageConfig {
  provider: 'local' | 's3' | 'gcs';
  local: {
    uploadPath: string;
    maxFileSize: number;
  };
  s3: {
    region: string;
    bucket: string;
    accessKeyId: string;
    secretAccessKey: string;
  };
  gcs: {
    projectId: string;
    keyFilename: string;
    bucket: string;
  };
}

export interface EmailConfig {
  provider: 'smtp' | 'sendgrid' | 'ses';
  smtp: {
    host: string;
    port: number;
    secure: boolean;
    username: string;
    password: string;
  };
  sendgrid: {
    apiKey: string;
  };
  ses: {
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
  };
  from: {
    name: string;
    email: string;
  };
}

export interface MonitoringConfig {
  enabled: boolean;
  prometheus: {
    enabled: boolean;
    path: string;
  };
  sentry: {
    enabled: boolean;
    dsn: string;
    environment: string;
  };
  healthCheck: {
    enabled: boolean;
    path: string;
    timeout: number;
  };
}

export interface HRSystemConfig {
  database: DatabaseConfig;
  jwt: JwtConfig;
  security: SecurityConfig;
  server: ServerConfig;
  redis: RedisConfig;
  storage: StorageConfig;
  email: EmailConfig;
  monitoring: MonitoringConfig;
}

@Injectable()
export class GlobalConfigService {
  constructor(private configService: ConfigService) {}

  get database(): DatabaseConfig {
    return {
      url: this.configService.get<string>('DATABASE_URL', ''),
      host: this.configService.get<string>('DB_HOST', 'localhost'),
      port: this.configService.get<number>('DB_PORT', 5432),
      username: this.configService.get<string>('DB_USERNAME', 'postgres'),
      password: this.configService.get<string>('DB_PASSWORD', ''),
      database: this.configService.get<string>('DB_DATABASE', 'hr_system'),
      ssl: this.configService.get<boolean>('DB_SSL', false),
      logging: this.configService.get<boolean>('DB_LOGGING', false),
      synchronize: this.configService.get<boolean>('DB_SYNCHRONIZE', false),
      migrationsRun: this.configService.get<boolean>('DB_MIGRATIONS_RUN', true),
    };
  }

  get jwt(): JwtConfig {
    return {
      secret: this.configService.get<string>('JWT_SECRET', ''),
      refreshSecret: this.configService.get<string>('JWT_REFRESH_SECRET', ''),
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN', '1h'),
      refreshExpiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
      issuer: this.configService.get<string>('JWT_ISSUER', 'hr-system'),
      audience: this.configService.get<string>('JWT_AUDIENCE', 'hr-system-users'),
    };
  }

  get security(): SecurityConfig {
    return {
      bcryptRounds: this.configService.get<number>('BCRYPT_ROUNDS', 12),
      corsOrigins: this.configService
        .get<string>('CORS_ORIGINS', 'http://localhost:3000')
        .split(',')
        .map(origin => origin.trim()),
      rateLimit: {
        windowMs: this.configService.get<number>('RATE_LIMIT_WINDOW_MS', 60000),
        maxRequests: this.configService.get<number>('RATE_LIMIT_MAX_REQUESTS', 100),
      },
      helmet: {
        contentSecurityPolicy: this.configService.get<boolean>('HELMET_CSP', true),
        hsts: this.configService.get<boolean>('HELMET_HSTS', true),
        noSniff: this.configService.get<boolean>('HELMET_NO_SNIFF', true),
        frameguard: this.configService.get<boolean>('HELMET_FRAMEGUARD', true),
      },
    };
  }

  get server(): ServerConfig {
    return {
      port: this.configService.get<number>('PORT', 3000),
      host: this.configService.get<string>('HOST', '0.0.0.0'),
      nodeEnv: this.configService.get<string>('NODE_ENV', 'development'),
      apiPrefix: this.configService.get<string>('API_PREFIX', 'api/v1'),
      swaggerEnabled: this.configService.get<boolean>('SWAGGER_ENABLED', true),
      swaggerPath: this.configService.get<string>('SWAGGER_PATH', 'api'),
      logLevel: this.configService.get<string>('LOG_LEVEL', 'info'),
      timezone: this.configService.get<string>('TZ', 'UTC'),
    };
  }

  get redis(): RedisConfig {
    return {
      host: this.configService.get<string>('REDIS_HOST', 'localhost'),
      port: this.configService.get<number>('REDIS_PORT', 6379),
      password: this.configService.get<string>('REDIS_PASSWORD'),
      db: this.configService.get<number>('REDIS_DB', 0),
      ttl: this.configService.get<number>('REDIS_TTL', 3600),
      maxRetriesPerRequest: this.configService.get<number>('REDIS_MAX_RETRIES', 3),
    };
  }

  get storage(): StorageConfig {
    const provider = this.configService.get<'local' | 's3' | 'gcs'>('STORAGE_PROVIDER', 'local');
    
    return {
      provider,
      local: {
        uploadPath: this.configService.get<string>('STORAGE_LOCAL_PATH', './uploads'),
        maxFileSize: this.configService.get<number>('STORAGE_MAX_FILE_SIZE', 10485760), // 10MB
      },
      s3: {
        region: this.configService.get<string>('AWS_S3_REGION', 'us-east-1'),
        bucket: this.configService.get<string>('AWS_S3_BUCKET', ''),
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID', ''),
        secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY', ''),
      },
      gcs: {
        projectId: this.configService.get<string>('GCS_PROJECT_ID', ''),
        keyFilename: this.configService.get<string>('GCS_KEY_FILENAME', ''),
        bucket: this.configService.get<string>('GCS_BUCKET', ''),
      },
    };
  }

  get email(): EmailConfig {
    const provider = this.configService.get<'smtp' | 'sendgrid' | 'ses'>('EMAIL_PROVIDER', 'smtp');
    
    return {
      provider,
      smtp: {
        host: this.configService.get<string>('SMTP_HOST', 'localhost'),
        port: this.configService.get<number>('SMTP_PORT', 587),
        secure: this.configService.get<boolean>('SMTP_SECURE', false),
        username: this.configService.get<string>('SMTP_USERNAME', ''),
        password: this.configService.get<string>('SMTP_PASSWORD', ''),
      },
      sendgrid: {
        apiKey: this.configService.get<string>('SENDGRID_API_KEY', ''),
      },
      ses: {
        region: this.configService.get<string>('AWS_SES_REGION', 'us-east-1'),
        accessKeyId: this.configService.get<string>('AWS_SES_ACCESS_KEY_ID', ''),
        secretAccessKey: this.configService.get<string>('AWS_SES_SECRET_ACCESS_KEY', ''),
      },
      from: {
        name: this.configService.get<string>('EMAIL_FROM_NAME', 'HR System'),
        email: this.configService.get<string>('EMAIL_FROM_ADDRESS', 'noreply@hr-system.com'),
      },
    };
  }

  get monitoring(): MonitoringConfig {
    return {
      enabled: this.configService.get<boolean>('MONITORING_ENABLED', true),
      prometheus: {
        enabled: this.configService.get<boolean>('PROMETHEUS_ENABLED', true),
        path: this.configService.get<string>('PROMETHEUS_PATH', '/metrics'),
      },
      sentry: {
        enabled: this.configService.get<boolean>('SENTRY_ENABLED', false),
        dsn: this.configService.get<string>('SENTRY_DSN', ''),
        environment: this.configService.get<string>('SENTRY_ENVIRONMENT', 'development'),
      },
      healthCheck: {
        enabled: this.configService.get<boolean>('HEALTH_CHECK_ENABLED', true),
        path: this.configService.get<string>('HEALTH_CHECK_PATH', '/health'),
        timeout: this.configService.get<number>('HEALTH_CHECK_TIMEOUT', 5000),
      },
    };
  }

  get config(): HRSystemConfig {
    return {
      database: this.database,
      jwt: this.jwt,
      security: this.security,
      server: this.server,
      redis: this.redis,
      storage: this.storage,
      email: this.email,
      monitoring: this.monitoring,
    };
  }

  // Validation methods
  validateRequired(): void {
    const requiredVars = [
      'DATABASE_URL',
      'JWT_SECRET',
      'JWT_REFRESH_SECRET',
    ];

    const missing = requiredVars.filter(
      (varName) => !this.configService.get(varName),
    );

    if (missing.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missing.join(', ')}`,
      );
    }
  }

  validateJwtSecrets(): void {
    const jwtSecret = this.configService.get<string>('JWT_SECRET', '');
    const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET', '');

    if (jwtSecret.length < 32) {
      throw new Error('JWT_SECRET must be at least 32 characters long');
    }

    if (refreshSecret.length < 32) {
      throw new Error('JWT_REFRESH_SECRET must be at least 32 characters long');
    }

    if (jwtSecret === refreshSecret) {
      throw new Error('JWT_SECRET and JWT_REFRESH_SECRET must be different');
    }
  }

  validateProductionSettings(): void {
    const nodeEnv = this.configService.get<string>('NODE_ENV', 'development');
    
    if (nodeEnv === 'production') {
      const productionChecks = [
        {
          condition: this.database.ssl,
          message: 'SSL must be enabled in production (DB_SSL=true)',
        },
        {
          condition: !this.database.synchronize,
          message: 'Database synchronization must be disabled in production (DB_SYNCHRONIZE=false)',
        },
        {
          condition: this.security.bcryptRounds >= 12,
          message: 'Bcrypt rounds must be at least 12 in production',
        },
        {
          condition: this.server.logLevel !== 'debug',
          message: 'Log level should not be debug in production',
        },
      ];

      const failedChecks = productionChecks.filter(check => !check.condition);
      
      if (failedChecks.length > 0) {
        throw new Error(
          `Production validation failed:\n${failedChecks
            .map(check => `- ${check.message}`)
            .join('\n')}`,
        );
      }
    }
  }

  // Utility methods
  isDevelopment(): boolean {
    return this.server.nodeEnv === 'development';
  }

  isProduction(): boolean {
    return this.server.nodeEnv === 'production';
  }

  isTest(): boolean {
    return this.server.nodeEnv === 'test';
  }
}

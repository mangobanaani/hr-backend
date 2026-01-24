import { ValidationPipe, RequestMethod } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import * as compression from 'compression';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { PaginationHeadersInterceptor } from './common/interceptors/pagination-headers.interceptor';
import { ResponseTimeInterceptor } from './common/interceptors/response-time.interceptor';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    bodyParser: true,
  });

  // Compression middleware for response optimization
  app.use(compression({
    filter: (req, res) => {
      if (req.headers['x-no-compression']) {
        return false;
      }
      return compression.filter(req, res);
    },
    threshold: 1024, // Only compress responses larger than 1KB
  }));

  // Security middleware
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
        },
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
    }),
  );

  // CORS configuration - unified and secure
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') ?? [
    'http://localhost:3000',
  ];

  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) {
        callback(null, true);
        return;
      }

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: [
      'X-Total-Count',
      'X-Page',
      'X-Per-Page',
      'X-Total-Pages',
      'X-Next-Cursor',
      'X-Has-More',
      'X-Request-ID',
      'X-Response-Time',
      'Link',
    ],
    maxAge: 86400, // 24 hours
  });

  // Global validation pipe with strict validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      disableErrorMessages: false,
      validationError: {
        target: false,
      },
    }),
  );

  // Global exception filter for standardized error responses
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global interceptors
  app.useGlobalInterceptors(
    new PaginationHeadersInterceptor(),
    new ResponseTimeInterceptor(),
  );

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle(process.env.SWAGGER_TITLE ?? 'HR System API')
    .setDescription(
      process.env.SWAGGER_DESCRIPTION ??
        'Complete HR Management System API with 100% Swagger coverage for all HR functions',
    )
    .setVersion(process.env.SWAGGER_VERSION ?? '1.0.0')
    .addServer('http://localhost:3000/api/v1', 'Development Server')
    .addBearerAuth() // restored for authentication
    .addTag('Application', 'Application information and health endpoints')
    .addTag('health', 'Health check and monitoring endpoints')
    .addTag('auth', 'Authentication endpoints')
    .addTag('employees', 'Employee management endpoints')
    .addTag('departments', 'Department management endpoints')
    .addTag('benefits', 'Employee benefits management endpoints')
    .addTag('performance', 'Performance evaluation and review endpoints')
    .addTag('training', 'Training programs and employee development endpoints')
    .addTag(
      'time-tracking',
      'Time tracking and attendance management endpoints',
    )
    .addTag('expenses', 'Expense reports and reimbursement endpoints')
    .addTag('projects', 'Project management and assignment endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  // Global prefix - but allow root controller at both / and /api/v1
  app.setGlobalPrefix('api/v1', {
    exclude: [{ path: '', method: RequestMethod.GET }],
  });

  const port = Number(process.env.PORT) || 3000; // Default port set to 3000
  await app.listen(port);

  // eslint-disable-next-line no-console
  console.log(
    `HR System API is running on: http://localhost:${String(port)}/api/v1`,
  );
  // eslint-disable-next-line no-console
  console.log(
    `API Documentation available at: http://localhost:${String(port)}/api/docs`,
  );
}

bootstrap().catch((error: unknown) => {
  // eslint-disable-next-line no-console
  console.error('Failed to start the application:', error);
  process.exit(1);
});

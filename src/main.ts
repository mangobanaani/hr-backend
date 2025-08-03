import { ValidationPipe, RequestMethod } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

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

  // CORS configuration
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') ?? [
      'http://localhost:3000',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
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

  // Enable CORS
  const frontendUrls = process.env.FRONTEND_URLS?.split(',') ?? [
    'http://localhost:3000',
  ];
  app.enableCors({
    origin: frontendUrls,
    credentials: true,
  });

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

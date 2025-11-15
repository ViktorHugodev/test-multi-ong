import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { winstonLoggerConfig } from './common/logger/winston-logger.config';

async function bootstrap() {
  // Create app with Winston logger
  const app = await NestFactory.create(AppModule, {
    logger: winstonLoggerConfig,
  });

  const logger = new Logger('Bootstrap');
  const configService = app.get(ConfigService);

  // Global prefix
  app.setGlobalPrefix('api');

  // CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false, // Permite propriedades extras (mais flexível)
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const port = configService.get<number>('app.port') || 3333;
  await app.listen(port);

  logger.log(`🚀 Application is running on: http://localhost:${port}/api`);
  logger.log(`📝 Environment: ${configService.get('app.environment')}`);
  logger.log(`🔐 JWT configured`);
  logger.log(`📦 Redis configured for Bull queues`);
  logger.log(`🗄️ Database connected`);
  logger.log(`📊 Winston logger configured (${process.env.NODE_ENV === 'production' ? 'JSON' : 'Pretty'} format)`);
}

bootstrap().catch((error) => {
  console.error('❌ Application failed to start:', error);
  process.exit(1);
});

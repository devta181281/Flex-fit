import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter, LoggingInterceptor, TransformInterceptor } from './common';

async function bootstrap() {
    const logger = new Logger('Bootstrap');
    const app = await NestFactory.create(AppModule);

    // Enable CORS
    app.enableCors({
        origin: [
            'http://localhost:3000', // Admin panel
            'http://localhost:19006', // Expo web
            'exp://localhost:19000', // Expo app
        ],
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        credentials: true,
    });

    // Global exception filter - consistent error responses
    app.useGlobalFilters(new HttpExceptionFilter());

    // Global interceptors
    app.useGlobalInterceptors(
        new LoggingInterceptor(),      // Request/response logging
        new TransformInterceptor(),    // Consistent response format
    );

    // Global validation pipe
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
            transformOptions: {
                enableImplicitConversion: true,
            },
        }),
    );

    // API prefix
    app.setGlobalPrefix('api');

    // Swagger documentation
    const config = new DocumentBuilder()
        .setTitle('FlexFit API')
        .setDescription('FlexFit - Gym Day Pass Booking Platform API')
        .setVersion('1.0')
        .addBearerAuth()
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);

    const port = process.env.BACKEND_PORT || 3001;
    await app.listen(port);

    logger.log(`🚀 FlexFit API running on: http://localhost:${port}`);
    logger.log(`📚 API Docs available at: http://localhost:${port}/api/docs`);
}

bootstrap();


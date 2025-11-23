import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule, ApiExcludeEndpoint } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix("api/v1");

  //Ejecutar las validaciones realizadas en los DTO's
  app.useGlobalPipes(
    new ValidationPipe({
      //Tirar error si el usuario envía datos que no correspondan, lanzar error.
      whitelist: true,
      forbidNonWhitelisted: true,
      // Parsea en el controlador al tipo de dato que definamos en el parámetro (los querys siempre llegan como strings)
      transform: true,
    })
  );

  //Swagger
  const config = new DocumentBuilder()
    .setTitle('Swokosky Airlines API')
    .setDescription('Documentación de la API de Swokosky Airlines')
    .setVersion('1.0')
    // => aquí definimos el esquema Bearer (JWT)
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        in: 'header'
      },
      'bearerAuth' // <-- nombre del esquema, usar este ID en @ApiBearerAuth(...)
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: { persistAuthorization: true } // mantiene token entre reloads
  });

  console.log('Swagger disponible en: /api/docs');

  
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(
    `\x1b[32m🚀 Servidor iniciado exitosamente en:\x1b[0m \x1b[36mPuerto: ${port}\x1b[0m`
  );
}
bootstrap();

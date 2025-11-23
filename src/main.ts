import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  console.log(
    `\x1b[32m🚀 Servidor iniciado exitosamente en:\x1b[0m \x1b[36mPuerto: ${port}\x1b[0m`
  );
}
bootstrap();

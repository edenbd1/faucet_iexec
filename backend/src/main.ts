import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS
  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });

  const port = 4000;
  await app.listen(port);
  console.log(`Server started on http://localhost:${port}`);
}
bootstrap();

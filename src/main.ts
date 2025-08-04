import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { RestartExceptionFilter } from './core/restart.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalFilters(new RestartExceptionFilter());

  const config = new DocumentBuilder()
    .setTitle('Пример API')
    .setDescription('Описание API')
    .setVersion('1.0')
    .addTag('пример')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('doks', app, document);

  process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
    setTimeout(() => process.exit(1), 1000);
  });

  process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    setTimeout(() => process.exit(1), 1000);
  });

  await app.listen(3000);
}
bootstrap();

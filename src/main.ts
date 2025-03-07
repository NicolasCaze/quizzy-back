import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableCors({
    origin: '*',
    methods: 'GET, POST, PUT, DELETE, PATCH',
    exposedHeaders: ['Location'],
    credentials: true,
  });
  const config = new DocumentBuilder()
    .setTitle('Quizzy API')
    .setDescription('API pour le projet Quizzy')
    .setVersion('1.0')
    .addBearerAuth() // Si tu utilises l'authentification JWT
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

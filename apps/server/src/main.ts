import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import fs from 'node:fs';
import path from 'node:path';
import { AppModule } from './app.module.js';

async function bootstrap() {
  let httpsOptions: { key: Buffer; cert: Buffer } | undefined;

  const keyPath = process.env.SSL_KEY_PATH || path.resolve(process.cwd(), '../../certificates/localhost-key.pem');
  const certPath = process.env.SSL_CERT_PATH || path.resolve(process.cwd(), '../../certificates/localhost.pem');

  if (fs.existsSync(keyPath) && fs.existsSync(certPath) && process.env.USE_HTTPS === 'true') {
    httpsOptions = {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath),
    };
  }

  const app = await NestFactory.create(AppModule, {
    httpsOptions,
  });

  app.enableShutdownHooks();

  const clientUrl = process.env.APP_URL || 'https://localhost:8000';
  app.enableCors({
    origin: [
      clientUrl,
      'https://localhost:8000',
      'http://localhost:8000',
      'https://127.0.0.1:8000',
      'http://127.0.0.1:8000',
      'http://localhost:3000',
    ],
    credentials: true,
  });

  app.use(cookieParser());
  app.setGlobalPrefix('api');

  const port = process.env.PORT ?? 8001;
  await app.listen(port);
  const protocol = httpsOptions ? 'https' : 'http';
  console.log(`🚀 Server is running on ${protocol}://localhost:${port}/api`);
}

await bootstrap();

/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Catch, ExceptionFilter, ArgumentsHost } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import * as process from 'process';

@Catch()
export class RestartExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(RestartExceptionFilter.name);

  catch(exception: Error, host: ArgumentsHost) {
    this.logger.error(`Critical error: ${exception.message}`, exception.stack);

    // Проверяем, является ли ошибка критической для перезапуска
    if (this.isCriticalError(exception)) {
      this.logger.warn('Attempting to restart the server...');
      setTimeout(() => this.restartServer(), 1000);
    }

    // Отправляем ответ клиенту (если это HTTP-запрос)
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    if (response && response.status) {
      response.status(500).json({
        statusCode: 500,
        message: 'Internal server error (restarting)',
      });
    }
  }

  private isCriticalError(error: Error): boolean {
    return (
      error.message.includes('RST_STREAM') ||
      error.message.includes('ECONNREFUSED') ||
      error.message.includes('SERVER_ERROR')
    );
  }

  private restartServer() {
    process.exit(1); // Завершаем процесс с кодом ошибки (PM2/Nodemon перезапустят)
  }
}
import { Module, OnModuleInit, Injectable } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OrderBook } from './scalpingBot/main';

const scalpingBotService = new OrderBook();

@Injectable()
class ScalpingBotService implements OnModuleInit {
  async onModuleInit() {
    await scalpingBotService.subscribe();
    // Запуск бота при старте приложения
    // startScalpingBot(config.poolPublicKeyStr);
  }
}

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, ScalpingBotService],
})
export class AppModule {}

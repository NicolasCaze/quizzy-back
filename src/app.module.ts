import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PingController } from './controller/ping/ping.controller';
import { PingService } from './service/ping/ping.service';

@Module({
  imports: [],
  controllers: [AppController, PingController],
  providers: [AppService, PingService],
})
export class AppModule {}

import { Controller, Get, HttpStatus } from '@nestjs/common';
import { PingService } from 'src/ping/ping.service';

@Controller('ping')
export class PingController {
    constructor(private readonly pingService : PingService ) {}
    
    @Get()
    getPing(): HttpStatus {
      return this.pingService.getPing();
    }
}

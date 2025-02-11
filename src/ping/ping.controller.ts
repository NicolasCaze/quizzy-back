import { Controller, Get, HttpStatus } from '@nestjs/common';
import { PingService } from './ping.service';

@Controller('ping')
export class PingController {
    constructor(private readonly pingService : PingService ) {}
    
    @Get()
    getPing(): String {
      return this.pingService.getPing();
    }
}

import { Controller, Get, HttpStatus } from '@nestjs/common';
import { PingService } from '../service/ping.service';

@Controller('ping')
export class PingController {
    constructor(private readonly pingService : PingService ) {}
    
    @Get()
    getPing(): {status: string} {
      return {status : this.pingService.getPing()};
    }
}

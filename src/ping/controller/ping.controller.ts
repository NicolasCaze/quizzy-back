import { Controller, Get, HttpStatus } from '@nestjs/common';
import { PingService } from '../service/ping.service';

@Controller('ping')
export class PingController {
    constructor(private readonly pingService : PingService ) {}
    
    @Get()
    getPing(): Promise<{ status: string; details: { database: string; }; }> {
      return this.pingService.getPing();
    }
}

import { Controller, Get } from '@nestjs/common';
import { PingService } from '../service/ping.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('ping')
@ApiTags('Ping') // Regroupe ce contrôleur sous "Ping" dans Swagger
export class PingController {
    constructor(private readonly pingService: PingService) {}

    @Get()
    @ApiOperation({ summary: 'Vérifier l’état du serveur et de la base de données' })
    @ApiResponse({
        status: 200,
        description: 'Le serveur est en ligne et la connexion à la base de données est vérifiée',
        schema: {
            type: 'object',
            properties: {
                status: { type: 'string', example: 'ok' },
                details: {
                    type: 'object',
                    properties: {
                        database: { type: 'string', example: 'connected' }
                    }
                }
            }
        }
    })
    getPing(): Promise<{ status: string; details: { database: string } }> {
        return this.pingService.getPing();
    }
}

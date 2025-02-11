import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

@Injectable()
export class PingService {
    getPing() : HttpStatus {
        try {
            // Simuler un retour correct
            return HttpStatus.OK;
          } catch (error) {
            // Simuler une erreur interne
            throw new HttpException(
              {
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
              },
              HttpStatus.INTERNAL_SERVER_ERROR,
            );
          }
    }
}

import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

@Injectable()
export class PingService {
    getPing() : String {
      try {
        return 'Ok';
      } catch (error) {
        throw new HttpException({
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Internal Server Error',
        }, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }    
}

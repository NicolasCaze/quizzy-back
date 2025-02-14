import { Test, TestingModule } from '@nestjs/testing';
import { PingService } from '../service/ping.service';
import { HttpException, InternalServerErrorException } from '@nestjs/common';

describe('PingService', () => {
  let service: PingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PingService],
    }).compile();

    service = module.get<PingService>(PingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getPing', () => {
    it('should return "Ok"', () => {
      expect(service.getPing()).toBe('Ok');
    });
    it( 'should be error', () => {
      jest.spyOn(service, 'getPing').mockImplementation(() => {throw new HttpException({status: 500,error: 'Internal Server Error',}, 500);});
      try {
        service.getPing();
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.status).toBe(500);
      }
    });
  });
});

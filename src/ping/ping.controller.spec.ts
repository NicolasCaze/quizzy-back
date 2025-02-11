import { Test, TestingModule } from '@nestjs/testing';
import { PingController } from './ping.controller';
import { PingService } from './ping.service';

describe('PingController', () => {
  let controller: PingController;
  let service: PingService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PingController],
      providers: [PingService],
    }).compile();

    controller = module.get<PingController>(PingController);
    service = module.get<PingService>(PingService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getPing', () => {
    it('should return "Ok"', () => {
      jest.spyOn(service, 'getPing').mockImplementation(() => 'Ok');
      expect(controller.getPing()).toBe('Ok');
    });
  });
});

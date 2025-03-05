import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    
    await app.init();
  });

  describe('/api/ping', () => {
    it('should return 200', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/ping')
        .expect(200)

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('Ok');
    })
  })
});

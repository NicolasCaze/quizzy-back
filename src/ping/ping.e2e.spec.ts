import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';
import { FirebaseAdmin, FirebaseConstants } from 'nestjs-firebase';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let mockFirebaseAdmin: Partial<FirebaseAdmin>;

  beforeEach(async () => {
    const mockDocRef = {
      set: jest.fn(),
      get: jest.fn(),
    };

    const mockCollection = {
      doc: jest.fn().mockReturnValue(mockDocRef)
    };

    mockFirebaseAdmin = {
      firestore: {
        collection: jest.fn().mockReturnValue(mockCollection)
      } as any
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(FirebaseConstants.FIREBASE_TOKEN)
      .useValue(mockFirebaseAdmin)
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/api/ping', () => {

    it('should return 200 and status OK when Firestore is available', async () => {
      jest.spyOn(mockFirebaseAdmin.firestore.collection('healthcheck').doc('ping'), 'get')
        .mockResolvedValue({ exists: true } as any);
        

      const response = await request(app.getHttpServer()).get('/ping');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        status: 'OK',
        details: { database: 'OK' },
      });
    });

    it('should return 200 and status Partial when Firestore is unavailable', async () => {
      jest.spyOn(mockFirebaseAdmin.firestore.collection('healthcheck').doc('ping'), 'get')
        .mockRejectedValue(new Error('Firestore unavailable'));

      const response = await request(app.getHttpServer()).get('/ping');

      console.log('Response:', response.body); // DEBUG pour voir ce qui est renvoyé

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        status: 'Partial',
        details: { database: 'KO' },
      });
    });
  });

});

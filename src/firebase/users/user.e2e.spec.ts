import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../app.module';
import { FakeAuthMiddleware } from '../../auth/middleware/fake-auth.middleware.service';

describe('UserControllers (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(new FakeAuthMiddleware().use);
    await app.init();

    /*const firebaseService = moduleFixture.get(FirebaseService);
    await firebaseService.deleteUser(<uid>)*/
  });

  it('POST /users ()', () => {
    //const userId = Math.floor(Math.random() * 1000000000);
    FakeAuthMiddleware.SetUser('test-uid');
    return request(app.getHttpServer())
      .post('/users')
      .send({username: 'tesre'})
      .expect(201);
  });

});

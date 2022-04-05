import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let orderId: number

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  
  it('/POST estimate-price', () => {
    return request(app.getHttpServer())
    .post('/api/estimate-price')
    .send({
      "pair": "BTC-USDT",
      "volume": 1.2,
      "side": "buy"
    })
    .expect(201)
    .then( response => {
      expect(JSON.parse(response.text)).toEqual({
        estimatedPrice: expect.any(Number), 
        expirationDate: expect.any(String), 
        orderId: expect.any(Number)
      })
      orderId = JSON.parse(response.text).orderId
    })
  });

  it('/POST place-order', () => {
    return request(app.getHttpServer())
      .post('/api/place-order')
      .send({
        "orderId": orderId
    })
      .expect(201)
      .then( response => {expect(JSON.parse(response.text)).toEqual({estimatedPrice: expect.any(Number), executedPrice: expect.any(Number)})})
  });

})

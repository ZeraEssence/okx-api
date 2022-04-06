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

  afterEach(async () => {
    await app.close();
  });

  describe('/POST api/estimate-price/', () => {
    it('return estimated price, expiration date and order id', () => {
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

    it('invalid or empty pair', () => {
      return request(app.getHttpServer())
      .post('/api/estimate-price')
      .send({
        "pair": "123-ABCD",
        "volume": 1.2,
        "side": "buy"
      })
      .expect(400)
      .then((response: any) => {
        expect(JSON.parse(response.text).message)
        .toEqual('Could not estimate price. Please, verify the entered pair. It may be possible that the entered pair is not available.')
      })
    });

    it('invalid or empty volume', () => {
      return request(app.getHttpServer())
      .post('/api/estimate-price')
      .send({
        "pair": "BTC-USDT",
        "volume": -4,
        "side": "buy"
      })
      .expect(400)
      .then((response: any) => {
        expect(JSON.parse(response.text).message)
        .toEqual('Could not estimate price. Please, verify the entered volume')
      })
    });

    it('invalid or empty side', () => {
      return request(app.getHttpServer())
      .post('/api/estimate-price')
      .send({
        "pair": "BTC-USDT",
        "volume": 1.2,
        "side": ""
      })
      .expect(400)
      .then((response: any) => {
        expect(JSON.parse(response.text).message)
        .toEqual('Could not estimate price. Please, enter a valid side (buy/sell).')
      })
    });

    it('volume too high', () => {
      return request(app.getHttpServer())
      .post('/api/estimate-price')
      .send({
        "pair": "BTC-USDT",
        "volume": 9999999999999,
        "side": "buy"
      })
      .expect(400)
      .then((response: any) => {
        expect(JSON.parse(response.text).message)
        .toEqual('Could not estimate price. Please, enter a lower volume.')
      })
    });

  })

  describe('/POST api/place-order', () => {
    it('return estimated price and executed price', () => {
      return request(app.getHttpServer())
        .post('/api/place-order')
        .send({
          "orderId": orderId
      })
        .expect(201)
        .then( response => {expect(JSON.parse(response.text)).toEqual({estimatedPrice: expect.any(Number), executedPrice: expect.any(Number)})})
    });

    it('invalid or empty order id', () => {
      return request(app.getHttpServer())
      .post('/api/place-order')
      .send({
        "orderId": 0
      })
      .expect(400)
      .then((response: any) => {
        expect(JSON.parse(response.text).message)
        .toEqual('Estimated order not found. Please, provide a valid order id.')
      })
    });

    it('inexisting order', () => {
      return request(app.getHttpServer())
      .post('/api/place-order')
      .send({
        "orderId": 9999999
      })
      .expect(400)
      .then((response: any) => {
        expect(JSON.parse(response.text).message)
        .toEqual('Could not find an order with that order id. Please, provide another order id.')
      })
    });
  })
})

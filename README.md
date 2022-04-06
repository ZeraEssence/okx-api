# OKX Exchange API

This is an API that uses OKX API to estimate trade prices and execute orders.

## Install

    npm install
    docker-compose up

## Run the app

    npm run start

## Run the tests

    npm run test:e2e
    
## Environment Variables

    OKX_URL=
    API_KEY=
    SECRET_KEY=
    OK_ACCESS_PASSPHRASE=
    OPERATING_FEE= 0.0025
    SPREAD= 0.005
    EXPIRATION_SECONDS= 45

# REST API

This is an example of how the service works:

## Estimate a price

This endpoint estimates a price given a pair, volume and side. It returns an estimated price, an estimation expiration date, and an estimation order ID, to execute it later.

### Request

`POST api/estimate-price/`

    body: {
      "pair": "BTC-USDT",
      "volume": 1.2,
      "side": "buy"
    }

### Response

    {
      "estimatedPrice": 46263.9664875,
      "expirationDate": "2022-04-05T18:48:57.537Z",
      "orderId": 5
    }

## Execute an order

This endpoint receives an order ID, to execute an estimated order, with its pair and volume. It returns the estimated and executed price.

### Request

`POST api/place-order/`

    body: {
      orderId: 5
    }

### Response

    {
      "estimatedPrice": 46263.9664875,
      "executedPrice": 46269.12733874999
    }

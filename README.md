# OKX Exchange API

This is an API that uses OKX to estimate trade prices and execute orders.

## Install

    npm install
    docker-compose up

## Run the app

    npm run start

## Run the tests

    npm run test:e2e
    
## Variables de entorno

    OKX_URL = API Url
    API_KEY = API Key
    SECRET_KEY = API Secret Key
    OK_ACCESS_PASSPHRASE = API Passphrase
    OPERATING_FEE= Desired fee to add to total price ( 0.01 = 1% )
    SPREAD= Desired spread to add to total price ( 0.01 = 1% )
    EXPIRATION_SECONDS= Seconds to add to order expiration date (Expiration date: Current date + EXPIRATION_SECONDS)

# REST API

This is an example of how the service works

## Estimate a price

This endpoint estimates a price given a pair, volume and side. It returns the estimated price, the estimation expiration date, and the estimation order ID, to execute it later.

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

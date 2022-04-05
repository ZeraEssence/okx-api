import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import axios, { AxiosRequestConfig } from 'axios';
import { EstimatedOrder } from './models/estimated-order.model';
import { ExecutedOrder } from './models/executed-order.model';
import { Utils } from './utils/utils';

@Injectable()
export class AppService {

  constructor(private readonly utils: Utils) {}

  async getOrderBooks(pair: string): Promise<{asks: {}, bids: {}, ts: string}> {
    const config : AxiosRequestConfig = {
      headers: {
        "content-type": "application/json",
        "accept": "application/json",
        "x-simulated-trading": 1 
      }
    }
    const orderBooks = await axios.get(
      `${process.env.OKX_URL}api/v5/market/books?instId=${pair}&sz=400`, config
    )
    return orderBooks.data.data[0]
  }

  async getOrderAveragePrice(pair: string, orderId: number): Promise<number> {
    const timeStamp = this.utils.getTimeStamp()
    const config = {
      headers: { 
        "OK-ACCESS-KEY": process.env.API_KEY,
        "OK-ACCESS-PASSPHRASE": process.env.OK_ACCESS_PASSPHRASE,
        "content-type": "application/json",
        "accept": "application/json",
        "x-simulated-trading": 1,
        "OK-ACCESS-TIMESTAMP": timeStamp, 
        "OK-ACCESS-SIGN": await this.utils.getAccessSign(timeStamp, 'GET', `/api/v5/trade/order?instId=${pair}&ordId=${orderId}`) }
    }
    const orderDetails = await axios.get(
      `${process.env.OKX_URL}api/v5/trade/order?instId=${pair}&ordId=${orderId}`, config
    )
    return +orderDetails.data.data[0].avgPx
  }

  async placeOrder(body): Promise<any> {
    const timeStamp = this.utils.getTimeStamp()
    const config = {
      headers: { 
        "OK-ACCESS-KEY": process.env.API_KEY,
        "OK-ACCESS-PASSPHRASE": process.env.OK_ACCESS_PASSPHRASE,
        "content-type": "application/json",
        "accept": "application/json",
        "x-simulated-trading": 1,
        "OK-ACCESS-TIMESTAMP": timeStamp, 
        "OK-ACCESS-SIGN": await this.utils.getAccessSign(timeStamp, 'POST', `/api/v5/trade/order`, body) }
    }
    const order = await axios.post(`${process.env.OKX_URL}api/v5/trade/order`, body, config)
    return order.data.data[0]
  }

  async executeOrder(orderId: number): Promise<{estimatedPrice: number, executedPrice: number}> {
    const estimatedOrder = await EstimatedOrder.findOne({where: {id: orderId}})
    if (!estimatedOrder) {
      throw new HttpException('Estimated order not found. Please, provide a valid orderId', HttpStatus.BAD_REQUEST)
    } else if (new Date(estimatedOrder.expirationDate) < new Date()) {
      throw new HttpException('Estimated order expired. Please, request a new estimation.', HttpStatus.BAD_REQUEST)
    }
    const body = {
      "instId": estimatedOrder.pair,
      "tdMode": "cash",
      "side": estimatedOrder.side,
      "ordType": "market",
      "sz": estimatedOrder.volume
    }

    const OkxOrder = await this.placeOrder(body)
    if (!OkxOrder.ordId) {
      throw new HttpException(OkxOrder.sMsg, HttpStatus.BAD_REQUEST)
    }
    const averagePrice = await this.getOrderAveragePrice(estimatedOrder.pair, OkxOrder.ordId)
    const finalPrice = this.utils.calculateFees(estimatedOrder.side as 'buy' | 'sell', averagePrice)
    await ExecutedOrder.create({
      estimatedOrderId: estimatedOrder.id,
      okexOrderId: OkxOrder.ordId,
      estimatedPrice: estimatedOrder.estimatedPrice,
      executedPrice: finalPrice
    })
    return {estimatedPrice: estimatedOrder.estimatedPrice, executedPrice: finalPrice}
  }

  async estimatePrice(body): Promise<{estimatedPrice: number, expirationDate: Date, orderId: number}> {
    const orderBooks: {asks: {}, bids: {}} = await this.getOrderBooks(body.pair)
    if (!orderBooks) {
      throw new HttpException('Could not estimate price. Please, verify the entered pair', HttpStatus.BAD_REQUEST)
    }
    if (body.side !== 'buy' && body.side !== 'sell') {
      throw new HttpException('Could not estimate price. Please, enter a valid side (buy/sell)', HttpStatus.BAD_REQUEST)
    }
    const estimatedPrice: number = this.utils.calculatePriceEstimation(body.volume, body.side, orderBooks)
    if (!estimatedPrice) {
      throw new HttpException('Could not estimate price. Please, verify the entered volume', HttpStatus.BAD_REQUEST)
    }
    const expirationDate = this.utils.getExpirationDate()
    const estimatedOrder = await EstimatedOrder.create({
      pair: body.pair,
      side: body.side,
      volume: body.volume,
      estimatedPrice: estimatedPrice,
      expirationDate: expirationDate
    })
    return {estimatedPrice: estimatedPrice,
            expirationDate: expirationDate,
            orderId: estimatedOrder.id}
  }

}

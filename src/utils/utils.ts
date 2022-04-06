import { HttpException, HttpStatus } from "@nestjs/common";
import * as CryptoJS from "crypto-js"

export class Utils {

  getTimeStamp(): string {
    return new Date().toISOString();
  }
    
  getAccessSign(timeStamp: string, method: string, reqPath: string, body?): string {
    return CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA256(timeStamp + method + reqPath + (body ? JSON.stringify(body) : ''), process.env.SECRET_KEY))
  }
      
  getExpirationDate(): Date {
    const date = new Date()
    date.setSeconds(date.getSeconds() + 30)
    return date
  }

  calculatePriceEstimation(volume: number, side: 'buy' | 'sell', orderBooks): number {
    const orderBook = side === 'buy' ? orderBooks.bids : orderBooks.asks
    const priceAndVolumeArr = []
    let volumeCounter : number = 0
    for (let i = 0; volumeCounter < volume; i++) {
      if (i === 400) {
      throw new HttpException('Could not estimate price. Please, enter a lower volume.', HttpStatus.BAD_REQUEST)
      }
      if (volumeCounter + +orderBook[i][1] > volume) {
        let volumeNeeded = +orderBook[i][1] + (( volume - +orderBook[i][1]) - volumeCounter)
        priceAndVolumeArr.push([+orderBook[i][0], volumeNeeded])
        volumeCounter += volumeNeeded
      } else {
        priceAndVolumeArr.push([+orderBook[i][0], +orderBook[i][1]])
        volumeCounter += +orderBook[i][1]
      }
    }
    const ponderatedPrices = []
    for (let priceAndVolume of priceAndVolumeArr) {
      ponderatedPrices.push(priceAndVolume[0] * priceAndVolume[1])
    }
    const averagePrice = ponderatedPrices.reduce((a, b) => a + b, 0) / volume
    return this.calculateFees(side, averagePrice)
  }

  calculateFees(side: 'buy' | 'sell', price: number): number {
    if (side === 'buy') {
      return +(price * (1 + +process.env.OPERATING_FEE )) * (1 + +process.env.SPREAD)
    } else {
      return +(price * (1 - +process.env.OPERATING_FEE )) * (1 - +process.env.SPREAD)
    }
  }

}
import { Body, Controller, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('api')
export class AppController {
  constructor(private readonly appService: AppService) {}
  
  @Post('/place-order')
  placerOrder(@Body() body) {
    return this.appService.executeOrder(body.orderId)
  }

  @Post('/estimate-price')
  estimatePrice(@Body() body) {
    return this.appService.estimatePrice(body)
  }
}

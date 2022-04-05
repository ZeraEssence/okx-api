import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EstimatedOrder } from './models/estimated-order.model';
import { ExecutedOrder } from './models/executed-order.model';
import { Utils } from './utils/utils';

@Module({
  imports: [SequelizeModule.forRoot({
    dialect: 'postgres',
    host: 'localhost',
    port: 5434,
    username: 'postgres',
    password: 'postgres',
    database: 'postgres',
    models: [EstimatedOrder, ExecutedOrder],
    autoLoadModels: true,
    synchronize: true
  }), ConfigModule.forRoot( {isGlobal: true}), Utils],
  controllers: [AppController],
  providers: [AppService, Utils],
  exports: [SequelizeModule]
})
export class AppModule {}

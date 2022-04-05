import { Column, Table, Model, DataType } from "sequelize-typescript";

@Table
export class ExecutedOrder extends Model {
    
    @Column(DataType.INTEGER)
    estimatedOrderId: number;

    @Column(DataType.BIGINT)
    okexOrderId: number;

    @Column(DataType.FLOAT)
    estimatedPrice: number;

    @Column(DataType.FLOAT)
    executedPrice: number;
}
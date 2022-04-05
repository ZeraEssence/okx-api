import { Column, Table, Model, DataType } from "sequelize-typescript";

@Table
export class EstimatedOrder extends Model {

    @Column(DataType.STRING)
    pair: string;

    @Column(DataType.STRING)
    side: string;

    @Column(DataType.FLOAT)
    volume: number;

    @Column(DataType.FLOAT)
    estimatedPrice: number;

    @Column(DataType.DATE)
    expirationDate: string;
}
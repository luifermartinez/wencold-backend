import { BillOutProduct } from './BillOutProduct';
import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne } from "typeorm";

@Entity()
export class ReturnProductBillOut extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column() description: string;

    @CreateDateColumn() returnDate: Date;

    @OneToOne(type => BillOutProduct)
    billOutProduct: BillOutProduct;

}

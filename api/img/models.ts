import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';


@Entity('img_tbl')
export class Img {
    static _omit: string[] = [];

    @PrimaryGeneratedColumn()
    public id!: number;

    @Column({ type: 'varchar', name: 'location', nullable: false, unique: true })
    public location!: string;

    @CreateDateColumn({ name: 'createdAt', precision: 3 })
    public createdAt?: Date;

    @UpdateDateColumn({ name: 'updatedAt', precision: 3 })
    public updatedAt?: Date;
}

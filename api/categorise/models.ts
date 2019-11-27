import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from 'typeorm';


@Entity('categorise_tbl')
@Unique('UQ_CAT_NAMES', ['username', 'category'])
export class Categorise {
    static _omit: string[] = [];

    @PrimaryGeneratedColumn()
    public id!: number;

    @Column({ type: 'varchar', nullable: false })
    public username!: string;

    @Column('varchar', { nullable: false })
    public category!: string;

    @CreateDateColumn({ name: 'createdAt', precision: 3 })
    public createdAt?: Date;

    @UpdateDateColumn({ name: 'updatedAt', precision: 3 })
    public updatedAt?: Date;
}

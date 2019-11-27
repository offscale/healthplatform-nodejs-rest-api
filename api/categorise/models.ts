import { Column, CreateDateColumn, Entity, PrimaryColumn, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';


@Entity('categorise_tbl')
export class Categorise {
    static _omit: string[] = [];

    @PrimaryGeneratedColumn()
    public id!: number;

    @Column({ type: 'varchar', name: 'username', nullable: false, unique: true })
    public username!: string;

    @Column('varchar', { nullable: false })
    public category!: string;

    @CreateDateColumn({ name: 'createdAt', precision: 3 })
    public createdAt?: Date;

    @UpdateDateColumn({ name: 'updatedAt', precision: 3 })
    public updatedAt?: Date;
}

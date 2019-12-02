import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    Unique,
    UpdateDateColumn
} from 'typeorm';

import { Artifact } from '../artifact/models';
import { CategoryEnum } from '../category_enum/models';
import { User } from '../user/models';


@Entity('categorise_tbl')
@Unique('UQ_CAT_NAMES', ['artifactLocation', 'categoryEnumName', 'username'])
export class Categorise {
    static _omit: string[] = [];

    @PrimaryGeneratedColumn()
    public id!: number;


    @Column({ type: 'varchar' })
    @ManyToOne(type => Artifact)
    @JoinColumn({ name: 'artifactLocation', referencedColumnName: 'location' })
    public artifactLocation!: Artifact['location'];

    @Column({ type: 'varchar' })
    @ManyToOne(type => CategoryEnum)
    @JoinColumn({ name: 'categoryEnumName', referencedColumnName: 'name' })
    public categoryEnumName!: CategoryEnum['name'];

    @Column('varchar', { nullable: false })
    public category!: string;

    @Column({ type: 'varchar' })
    @ManyToOne(type => User)
    @JoinColumn({ name: 'username', referencedColumnName: 'email' })
    public username!: string;

    @CreateDateColumn({ name: 'createdAt', precision: 3 })
    public createdAt?: Date;

    @UpdateDateColumn({ name: 'updatedAt', precision: 3 })
    public updatedAt?: Date;
}

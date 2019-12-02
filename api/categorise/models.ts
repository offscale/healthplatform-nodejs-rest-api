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


@Entity('categorise_tbl')
@Unique('UQ_CAT_NAMES', ['artifactLocation', 'categoryEnumName', 'username'])
export class Categorise {
    static _omit: string[] = [];

    @PrimaryGeneratedColumn()
    public id!: number;

    @ManyToOne(type => Artifact)
    @JoinColumn({ name: 'artifactLocation' })
    public artifact!: Artifact;

    @Column()
    public artifactLocation!: Artifact['location'];

    @ManyToOne(type => CategoryEnum)
    @JoinColumn({ name: 'categoryEnumName' })
    public categoryEnum!: CategoryEnum;

    @Column()
    public categoryEnumName!: CategoryEnum['name'];

    @Column('varchar', { nullable: false })
    public category!: string;

    @Column({ type: 'varchar', nullable: false })
    public username!: string;


    @CreateDateColumn({ name: 'createdAt', precision: 3 })
    public createdAt?: Date;

    @UpdateDateColumn({ name: 'updatedAt', precision: 3 })
    public updatedAt?: Date;
}

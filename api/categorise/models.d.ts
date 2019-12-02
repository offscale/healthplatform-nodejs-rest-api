import { Artifact } from '../artifact/models';
import { CategoryEnum } from '../category_enum/models';
export declare class Categorise {
    static _omit: string[];
    id: number;
    artifactLocation: Artifact['location'];
    categoryEnumName: CategoryEnum['name'];
    category: string;
    username: string;
    createdAt?: Date;
    updatedAt?: Date;
}

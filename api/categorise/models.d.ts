import { Artifact } from '../artifact/models';
import { CategoryEnum } from '../category_enum/models';
export declare class Categorise {
    static _omit: string[];
    id: number;
    artifact: Artifact;
    artifact_location: Artifact['location'];
    categoryEnum: CategoryEnum;
    category_enum_name: CategoryEnum['name'];
    category: string;
    username: string;
    createdAt?: Date;
    updatedAt?: Date;
}

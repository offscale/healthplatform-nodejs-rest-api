import { Artifact } from '../artifact/models';
export declare class Categorise {
    static _omit: string[];
    id: number;
    artifact: Artifact;
    category: string;
    username: string;
    createdAt?: Date;
    updatedAt?: Date;
}

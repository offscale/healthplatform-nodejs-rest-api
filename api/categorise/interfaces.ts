import { Categorise } from './models';

export interface ICategoriseStats {
    count: number;
    username: Categorise['username'];
}

export interface ICategoriseDiff {
    artifactLocation: Categorise['artifactLocation'];
    same_categorisation: boolean;

    category0: Categorise['category'];
    category1: Categorise['category'];

    username0: Categorise['username'];
    username1: Categorise['username'];
}

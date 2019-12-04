import { Request } from 'restify';
import { IOrmReq } from '@offscale/orm-mw/interfaces';
import { Categorise } from './models';
import { JsonSchema } from 'tv4';
import { IUserReq } from '../shared_interfaces';
export declare const schema: JsonSchema;
export declare type CategoriseBodyReq = Request & IOrmReq & {
    body?: Categorise;
} & IUserReq;
export declare const createCategorise: (req: CategoriseBodyReq) => Promise<Categorise>;
export declare const getCategorise: (req: Request & IOrmReq & IUserReq) => Promise<Categorise>;
export declare const getManyCategorise: (req: Request & IOrmReq & IUserReq) => Promise<Categorise[]>;
export declare const updateCategorise: (req: CategoriseBodyReq) => Promise<Categorise>;
export declare const removeCategorise: (req: Request & IOrmReq & IUserReq) => Promise<void>;

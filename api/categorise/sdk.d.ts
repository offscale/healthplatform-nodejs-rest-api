import { Request } from 'restify';
import { IOrmReq } from '@offscale/orm-mw/interfaces';
import { Categorise } from './models';
import { JsonSchema } from 'tv4';
export declare const schema: JsonSchema;
export declare type CategoriseBodyReq = Request & IOrmReq & {
    body?: Categorise;
    user_id?: string;
};
export declare const createCategorise: (req: CategoriseBodyReq) => Promise<Categorise>;
export declare const getCategorise: (req: Request & IOrmReq) => Promise<Categorise>;
export declare const getManyCategorise: (req: Request & IOrmReq) => Promise<Categorise[]>;
export declare const updateCategorise: (req: CategoriseBodyReq) => Promise<Categorise>;
export declare const removeCategorise: (req: Request & IOrmReq & {
    user_id?: string | undefined;
}) => Promise<void>;

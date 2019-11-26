import * as restify from 'restify';
import { Request } from 'restify';
import { JsonSchema } from 'tv4';
import { IOrmReq } from '@offscale/orm-mw/interfaces';
import { Categorise } from './models';
export declare type CategoriseBodyReq = Request & IOrmReq & {
    body?: Categorise;
};
export declare const schema: JsonSchema;
export declare const create: (app: restify.Server, namespace?: string) => boolean | restify.Route;
export declare const read: (app: restify.Server, namespace?: string) => boolean | restify.Route;
export declare const update: (app: restify.Server, namespace?: string) => boolean | restify.Route;

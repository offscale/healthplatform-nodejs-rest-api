import * as restify from 'restify';
import { Request } from 'restify';
import { IOrmReq } from '@offscale/orm-mw/interfaces';
import { Categorise } from './models';
export declare type CategoriseBodyReq = Request & IOrmReq & {
    body?: Categorise;
};
export declare const createMw: (request: restify.Request, res: restify.Response, next: restify.Next) => void;

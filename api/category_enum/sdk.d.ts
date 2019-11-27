import * as restify from 'restify';
import { Request } from 'restify';
import { IOrmReq } from '@offscale/orm-mw/interfaces';
import { CategoryEnum } from './models';
export declare const createMw: (request: restify.Request, res: restify.Response, next: restify.Next) => void;
export declare type CategoryEnumBodyReq = Request & IOrmReq & {
    body?: CategoryEnum;
};

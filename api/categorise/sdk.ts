import * as restify from 'restify';
import { Request } from 'restify';

import { IOrmReq } from '@offscale/orm-mw/interfaces';

import { Categorise } from './models';

export type CategoriseBodyReq = Request & IOrmReq & {body?: Categorise, user_id?: string};

export const createMw = (request: restify.Request, res: restify.Response, next: restify.Next) => {
    const req = request as unknown as CategoriseBodyReq;

    const categorise = new Categorise();
    Object.keys(req.body).map(k => categorise[k] = req.body[k]);

    req.getOrm().typeorm!.connection
        .getRepository(Categorise)
        .save(categorise)
        .then((categorise: Categorise) => {
            res.json(201, categorise);
            return next();
        })
        .catch(next);
};

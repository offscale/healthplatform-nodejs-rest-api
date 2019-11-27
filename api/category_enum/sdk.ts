import * as restify from 'restify';
import { Request } from 'restify';

import { IOrmReq } from '@offscale/orm-mw/interfaces';

import { CategoryEnum } from './models';

export const createMw = (request: restify.Request, res: restify.Response, next: restify.Next) => {
    const req = request as unknown as CategoryEnumBodyReq;

    const category_enum = new CategoryEnum();
    Object.keys(req.body).map(k => category_enum[k] = req.body[k]);

    req.getOrm().typeorm!.connection
        .getRepository(CategoryEnum)
        .save(category_enum)
        .then((category_enum: CategoryEnum) => {
            res.json(201, category_enum);
            return next();
        })
        .catch(next);
};

export type CategoryEnumBodyReq = Request & IOrmReq & {body?: CategoryEnum};

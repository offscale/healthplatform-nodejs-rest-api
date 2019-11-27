import * as restify from 'restify';
import { Request } from 'restify';

import { has_body, mk_valid_body_mw_ignore } from '@offscale/restify-validators';
import { IOrmReq } from '@offscale/orm-mw/interfaces';

import { has_auth } from '../auth/middleware';
import { CategoryEnumBodyReq, getCategoryEnum, removeCategoryEnum, schema, updateCategoryEnum } from './sdk';


export const get = (app: restify.Server, namespace: string = '') =>
    app.get(`${namespace}/:name`, has_auth(),
        (request: restify.Request, res: restify.Response, next: restify.Next) => {
            getCategoryEnum(request as unknown as Request & IOrmReq)
                .then(category_enum => {
                    res.json(category_enum);
                    return next();
                })
                .catch(next);
        }
    );


export const update = (app: restify.Server, namespace: string = '') =>
    app.put(`${namespace}/:name`, has_auth(), has_body,
        mk_valid_body_mw_ignore(schema, ['Missing required property']),
        (request: restify.Request, res: restify.Response, next: restify.Next) => {
            updateCategoryEnum(request as CategoryEnumBodyReq)
                .then(category_enum => {
                    res.json(category_enum);
                    return next();
                })
                .catch(next);
        }
    );


export const remove = (app: restify.Server, namespace: string = '') =>
    app.del(`${namespace}/:name`, has_auth(),
        (request: restify.Request, res: restify.Response, next: restify.Next) => {
            removeCategoryEnum(request as unknown as Request & IOrmReq)
                .then(() => {
                    res.send(204);
                    return next();
                })
                .catch(next);
        }
    );

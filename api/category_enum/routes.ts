import * as restify from 'restify';
import { Request } from 'restify';

import { has_body, mk_valid_body_mw_ignore } from '@offscale/restify-validators';
import { IOrmReq } from '@offscale/orm-mw/interfaces';

import { has_auth } from '../auth/middleware';
import { CategoryEnumBodyReq, createCategoryEnum, getManyCategoryEnum, schema } from './sdk';

export const create = (app: restify.Server, namespace: string = '') =>
    app.post(namespace, has_auth(), has_body, mk_valid_body_mw_ignore(schema, ['name']),
        (request: restify.Request, res: restify.Response, next: restify.Next) => {
            createCategoryEnum(request as CategoryEnumBodyReq)
                .then(category_enum => {
                    res.json(201, category_enum);
                    return next();
                })
                .catch(next);
        }
    );

export const getAll = (app: restify.Server, namespace: string = '') =>
    app.get(namespace, has_auth(),
        (request: restify.Request, res: restify.Response, next: restify.Next) => {
            // TODO: Add query params
            getManyCategoryEnum(request as unknown as Request & IOrmReq)
                .then(category_enums => {
                    res.json({ category_enums });
                    return next();
                })
                .catch(next)
        }
    );


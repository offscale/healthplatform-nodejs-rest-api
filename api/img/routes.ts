import * as restify from 'restify';
import { Request } from 'restify';

import { has_body, mk_valid_body_mw_ignore } from '@offscale/restify-validators';
import { IOrmReq } from '@offscale/orm-mw/interfaces';

import { has_auth } from '../auth/middleware';
import { createImg, getManyImg, ImgBodyReq, schema } from './sdk';

export const create = (app: restify.Server, namespace: string = '') =>
    app.post(namespace, has_auth(), has_body, mk_valid_body_mw_ignore(schema, ['name']),
        (request: restify.Request, res: restify.Response, next: restify.Next) => {
            createImg(request as ImgBodyReq)
                .then(img => {
                    res.json(201, img);
                    return next();
                })
                .catch(next);
        }
    );

export const getAll = (app: restify.Server, namespace: string = '') =>
    app.get(namespace, has_auth(),
        (request: restify.Request, res: restify.Response, next: restify.Next) => {
            // TODO: Add query params
            getManyImg(request as unknown as Request & IOrmReq)
                .then(imgs => {
                    res.json({ imgs });
                    return next();
                })
                .catch(next)
        }
    );


import * as restify from 'restify';
import { Request } from 'restify';

import { has_body, mk_valid_body_mw_ignore } from '@offscale/restify-validators';
import { IOrmReq } from '@offscale/orm-mw/interfaces';

import { has_auth } from '../auth/middleware';
import { getImg, ImgBodyReq, removeImg, schema, updateImg } from './sdk';


export const get = (app: restify.Server, namespace: string = '') =>
    app.get(`${namespace}/:id`, has_auth(),
        (request: restify.Request, res: restify.Response, next: restify.Next) => {
            getImg(request as unknown as Request & IOrmReq)
                .then(img => {
                    res.json(img);
                    return next();
                })
                .catch(next);
        }
    );


export const update = (app: restify.Server, namespace: string = '') =>
    app.put(`${namespace}/:id`, has_auth(), has_body,
        mk_valid_body_mw_ignore(schema, ['Missing required property']),
        (request: restify.Request, res: restify.Response, next: restify.Next) => {
            updateImg(request as ImgBodyReq)
                .then(img => {
                    res.json(img);
                    return next();
                })
                .catch(next);
        }
    );


export const remove = (app: restify.Server, namespace: string = '') =>
    app.del(`${namespace}/:id`, has_auth(),
        (request: restify.Request, res: restify.Response, next: restify.Next) => {
            removeImg(request as unknown as Request & IOrmReq)
                .then(() => {
                    res.send(204);
                    return next();
                })
                .catch(next);
        }
    );

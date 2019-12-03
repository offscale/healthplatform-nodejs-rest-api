import * as restify from 'restify';
import { Request } from 'restify';

import { has_body, mk_valid_body_mw_ignore } from '@offscale/restify-validators';
import { IOrmReq } from '@offscale/orm-mw/interfaces';

import { has_auth } from '../auth/middleware';
import { CategoriseBodyReq, createCategorise, getManyCategorise, schema } from './sdk';
import { getNextArtifactByCategory } from '../artifact/sdk';

export const create = (app: restify.Server, namespace: string = '') =>
    app.post(namespace, has_auth(), has_body, mk_valid_body_mw_ignore(schema, ['id', 'username']),
        (request: restify.Request, res: restify.Response, next: restify.Next) => {
            createCategorise(request as CategoriseBodyReq)
                .then(categorise => {
                    res.json(201, categorise);
                    return next();
                })
                .catch(next);
        }
    );

export const getAll = (app: restify.Server, namespace: string = '') =>
    app.get(namespace, has_auth(),
        (request: restify.Request, res: restify.Response, next: restify.Next) => {
            // TODO: Add query params
            getManyCategorise(request as unknown as Request & IOrmReq)
                .then(categorises => {
                    res.json({ categorises });
                    return next();
                })
                .catch(next)
        }
    );

export const getNext = (app: restify.Server, namespace: string = '') =>
    app.get(`${namespace}/next`, has_auth(),
        (request: restify.Request, res: restify.Response, next: restify.Next) => {
            getNextArtifactByCategory(request as unknown as Request & IOrmReq)
                .then(artifacts => {
                    res.json({ artifacts });
                    return next();
                })
                .catch(next)
        }
    );

import * as restify from 'restify';
import { Request } from 'restify';

import { has_body, mk_valid_body_mw_ignore } from '@offscale/restify-validators';
import { IOrmReq } from '@offscale/orm-mw/interfaces';

import { has_auth } from '../auth/middleware';
import { ArtifactBodyReq, getArtifact, removeArtifact, schema, upsertArtifact } from './sdk';


export const get = (app: restify.Server, namespace: string = '') =>
    app.get(`${namespace}/:location`, has_auth(),
        (request: restify.Request, res: restify.Response, next: restify.Next) => {
            getArtifact(request as unknown as Request & IOrmReq)
                .then(artifact => {
                    res.json(artifact);
                    return next();
                })
                .catch(next);
        }
    );


export const update = (app: restify.Server, namespace: string = '') =>
    app.put(`${namespace}/:location`, has_auth(), has_body,
        mk_valid_body_mw_ignore(schema, ['Missing required property']),
        (request: restify.Request, res: restify.Response, next: restify.Next) => {
            upsertArtifact(request as ArtifactBodyReq)
                .then(artifact => {
                    res.json(artifact);
                    return next();
                })
                .catch(next);
        }
    );


export const remove = (app: restify.Server, namespace: string = '') =>
    app.del(`${namespace}/:location`, has_auth(),
        (request: restify.Request, res: restify.Response, next: restify.Next) => {
            removeArtifact(request as unknown as Request & IOrmReq)
                .then(() => {
                    res.send(204);
                    return next();
                })
                .catch(next);
        }
    );

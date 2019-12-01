import * as restify from 'restify';
import { Request } from 'restify';

import { has_body, mk_valid_body_mw_ignore } from '@offscale/restify-validators';
import { IOrmReq } from '@offscale/orm-mw/interfaces';

import { has_auth } from '../auth/middleware';
import { ArtifactBodyReq, createArtifact, getManyArtifact, schema } from './sdk';

export const create = (app: restify.Server, namespace: string = '') =>
    app.post(namespace, has_auth(), has_body, mk_valid_body_mw_ignore(schema, ['name']),
        (request: restify.Request, res: restify.Response, next: restify.Next) => {
            createArtifact(request as ArtifactBodyReq)
                .then(artifact => {
                    res.json(201, artifact);
                    return next();
                })
                .catch(next);
        }
    );

export const getAll = (app: restify.Server, namespace: string = '') =>
    app.get(namespace, has_auth(),
        (request: restify.Request, res: restify.Response, next: restify.Next) => {
            // TODO: Add query params
            getManyArtifact(request as unknown as Request & IOrmReq)
                .then(artifacts => {
                    res.json({ artifacts });
                    return next();
                })
                .catch(next)
        }
    );

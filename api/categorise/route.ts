import * as restify from 'restify';

import { has_body } from '@offscale/restify-validators';

import { has_auth } from '../auth/middleware';
import { Categorise } from './models';
import { CategoriseBodyReq, createMw } from './sdk';

export const update = (app: restify.Server, namespace: string = '') =>
    app.put(`${namespace}/:id`, has_auth(), has_body, /*remove_from_body(['email']),
        mk_valid_body_mw(schema, false),
        mk_valid_body_mw_ignore(schema, ['Missing required property']),*/
        (request: restify.Request, res: restify.Response, next: restify.Next) => {
            const req = request as unknown as CategoriseBodyReq;

            const CategoriseRepo = req.getOrm().typeorm!.connection
                .getRepository(Categorise);

            CategoriseRepo.findOne(req.body.id)
                .then((categorise?: Categorise) => {
                    if (categorise == null) return createMw(request, res, next);
                    Object.keys(req.body).map(k => categorise[k] = req.body[k]);
                    CategoriseRepo.save(categorise)
                        .then(categorise => {
                            res.json({ categorise });
                            return next();
                        })
                        .catch(next);
                })
                .catch(next);
        }
    );

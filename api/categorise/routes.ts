import * as restify from 'restify';
import { Request } from 'restify';

import { JsonSchema } from 'tv4';

import { has_body, mk_valid_body_mw } from '@offscale/restify-validators';
import { IOrmReq } from '@offscale/orm-mw/interfaces';
import { NotFoundError } from '@offscale/custom-restify-errors';

import { Categorise } from './models';
import { has_auth } from '../auth/middleware';

export type CategoriseBodyReq = Request & IOrmReq & {body?: Categorise};

/* tslint:disable:no-var-requires */
export const schema: JsonSchema = require('./../../test/api/categorise/schema');

const createMw = (request: restify.Request, res: restify.Response, next: restify.Next) => {
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

export const create = (app: restify.Server, namespace: string = '') =>
    app.post(namespace, has_auth(), has_body, mk_valid_body_mw(schema), createMw);

export const read = (app: restify.Server, namespace: string = '') =>
    app.get(namespace, has_auth(),
        (request: restify.Request, res: restify.Response, next: restify.Next) => {
            const req = request as unknown as CategoriseBodyReq;
            // TODO: Add query params
            req.getOrm().typeorm!.connection
                .getRepository(Categorise)
                .find({
                    order: {
                        updatedAt: 'ASC'
                    }
                })
                .then((categorises: Categorise[]) => {
                    if (categorises == null || !categorises.length)
                        return next(new NotFoundError('Categorise'));
                    res.json({ categorises })
                })
                .catch(next);
        }
    );

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
                            res.json( {categorise});
                            return next();
                        })
                        .catch(next);
                })
                .catch(next);
        }
    );

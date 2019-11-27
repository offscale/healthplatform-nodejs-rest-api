import * as restify from 'restify';

import { JsonSchema } from 'tv4';

import { has_body, mk_valid_body_mw } from '@offscale/restify-validators';
import { NotFoundError } from '@offscale/custom-restify-errors';

import { has_auth } from '../auth/middleware';
import { CategoryEnum } from './models';
import { CategoryEnumBodyReq, createMw } from './sdk';

/* tslint:disable:no-var-requires */
export const schema: JsonSchema = require('./../../test/api/categorise_enum/schema');

export const create = (app: restify.Server, namespace: string = '') =>
    app.post(namespace, has_auth(), has_body, mk_valid_body_mw(schema), createMw);

export const read = (app: restify.Server, namespace: string = '') =>
    app.get(namespace, has_auth(),
        (request: restify.Request, res: restify.Response, next: restify.Next) => {
            const req = request as unknown as CategoryEnumBodyReq;
            // TODO: Add query params
            req.getOrm().typeorm!.connection
                .getRepository(CategoryEnum)
                .find({
                    order: {
                        updatedAt: 'ASC'
                    }
                })
                .then((category_enums: CategoryEnum[]) => {
                    if (category_enums == null || !category_enums.length)
                        return next(new NotFoundError('CategoryEnum'));
                    res.json({ category_enums })
                })
                .catch(next);
        }
    );


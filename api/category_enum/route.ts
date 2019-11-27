import * as restify from 'restify';

import { has_body } from '@offscale/restify-validators';

import { has_auth } from '../auth/middleware';
import { CategoryEnum } from './models';
import { CategoryEnumBodyReq, createMw } from './sdk';

export const update = (app: restify.Server, namespace: string = '') =>
    app.put(`${namespace}/:id`, has_auth(), has_body, /*remove_from_body(['email']),
        mk_valid_body_mw(schema, false),
        mk_valid_body_mw_ignore(schema, ['Missing required property']),*/
        (request: restify.Request, res: restify.Response, next: restify.Next) => {
            const req = request as unknown as CategoryEnumBodyReq;

            const CategoryEnumRepo = req.getOrm().typeorm!.connection
                .getRepository(CategoryEnum);

            CategoryEnumRepo.findOne(req.body.id)
                .then((category_enum?: CategoryEnum) => {
                    if (category_enum == null) return createMw(request, res, next);
                    Object.keys(req.body).map(k => category_enum[k] = req.body[k]);
                    CategoryEnumRepo.save(category_enum)
                        .then(category_enum => {
                            res.json({ category_enum });
                            return next();
                        })
                        .catch(next);
                })
                .catch(next);
        }
    );

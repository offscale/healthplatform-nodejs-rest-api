import * as restify from 'restify';
import { Request } from 'restify';

import { has_body, mk_valid_body_mw_ignore } from '@offscale/restify-validators';
import { IOrmReq } from '@offscale/orm-mw/interfaces';

import { has_auth } from '../auth/middleware';
import {
    CategoriseBodyReq,
    createCategorise,
    getAllCategorise,
    getCategoriseDiff,
    getCategoriseDiffC,
    getCategoriseStats,
    getManyCategorise,
    schema
} from './sdk';
import { getNextArtifactByCategory, getStatsArtifactByCategory } from '../artifact/sdk';
import { Parser } from 'json2csv';

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


export const getEvery = (app: restify.Server, namespace: string = '') =>
    app.get(`${namespace}/csv`, has_auth(),
        (request: restify.Request, res: restify.Response, next: restify.Next) => {
            getAllCategorise(request as unknown as Request & IOrmReq)
                .then(categorises => {
                    /*res.writeHead(200, {
                        'Content-Type': 'text/csv',
                        'Content-Disposition': 'attachment; filename=export.csv'
                    });
                    console.info('categorises:', categorises, ';');*/

                    const fields = Object.keys(categorises[0]);
                    const opts = { fields };

                    try {
                        const parser = new Parser(opts);
                        const csv = parser.parse(categorises);
                        console.log(csv);
                        res.json({ csv });
                    } catch (err) {
                        console.error(err);
                    }
                    return next();
                })
                .catch(next)
        }
    );


export const getNext = (app: restify.Server, namespace: string = '') =>
    app.get(`${namespace}/next`, has_auth(),
        (request: restify.Request, res: restify.Response, next: restify.Next) => {
            getNextArtifactByCategory(request as unknown as Request & IOrmReq & {user_id: string})
                .then(artifacts => {
                    res.json({ artifacts });
                    return next();
                })
                .catch(next)
        }
    );

export const getNextDiff = (app: restify.Server, namespace: string = '') =>
    app.get(`${namespace}/next_diff`, has_auth(),
        (request: restify.Request, res: restify.Response, next: restify.Next) => {
            getCategoriseDiffC(request as unknown as Request & IOrmReq & {user_id: string})
                .then(artifactLocations => {
                    res.json({ artifactLocations });
                    return next();
                })
                .catch(next)
        }
    );

export const getStats = (app: restify.Server, namespace: string = '') =>
    app.get(`${namespace}/stats`, has_auth(),
        (request: restify.Request, res: restify.Response, next: restify.Next) => {
            getStatsArtifactByCategory(request as unknown as Request & IOrmReq & {user_id: string})
                .then(stats => {
                    res.json(stats);
                    return next();
                })
                .catch(next)
        }
    );

export const getAggCategoriseStats = (app: restify.Server, namespace: string = '') =>
    app.get(`${namespace}/agg_stats`, has_auth(),
        (request: restify.Request, res: restify.Response, next: restify.Next) => {
            getCategoriseStats(request as unknown as Request & IOrmReq & {user_id: string})
                .then(stats => {
                    res.json(stats);
                    return next();
                })
                .catch(next)
        }
    );

export const getAggCategoriseDiff = (app: restify.Server, namespace: string = '') =>
    app.get(`${namespace}/cat_diff`, has_auth(),
        (request: restify.Request, res: restify.Response, next: restify.Next) => {
            getCategoriseDiff(request as unknown as Request & IOrmReq & {user_id: string})
                .then(categorise_diff => {
                    res.json(categorise_diff);
                    return next();
                })
                .catch(next)
        }
    );

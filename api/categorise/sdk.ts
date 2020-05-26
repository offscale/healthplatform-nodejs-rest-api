import { Request } from 'restify';
import { JsonSchema } from 'tv4';

import { IOrmReq } from '@offscale/orm-mw/interfaces';
import { fmtError, GenericError, NotFoundError } from '@offscale/custom-restify-errors';

import { IUserReq } from '../shared_interfaces';
import { hasRole } from '../auth/middleware';
import { Categorise } from './models';
import { ICategoriseDiff, ICategoriseStats } from './interfaces';

/* tslint:disable:no-var-requires */
export const schema: JsonSchema = require('./../../test/api/categorise/schema');

export type CategoriseBodyReq = Request & IOrmReq & {body?: Categorise} & IUserReq;

const handleCategorise = (resolve: (categorise: Categorise) => void,
                          reject: (error: Error) => void) => (categorise?: Categorise) =>
    categorise == null ?
        reject(new NotFoundError('Categorise'))
        : resolve(categorise);

export const createCategorise = (req: CategoriseBodyReq) => new Promise<Categorise>((resolve, reject) => {
    if (req.body == null)
        return reject(new NotFoundError('req.body == null'));

    const categorise = new Categorise();
    Object
        .keys(req.body)
        // @ts-ignore
        .forEach(k => categorise[k] = req.body[k]);

    // TODO: Use provided `username` if admin
    categorise.username = req.user_id!;

    /*const q = */
    req.getOrm().typeorm!.connection
        .createQueryBuilder()
        .insert()
        .into(Categorise)
        .values([categorise])

        /*(req.query.upsert === 'true' ?
            q
                .onConflict(`("id") DO UPDATE SET "category" = :category, "categoryEnumName" = :categoryEnumName`)
                .setParameters({
                    category: req.body.category,
                    categoryEnumName: req.body.categoryEnumName,
                })
            : q)*/
        .execute()
        .then((insertResult) => {
            req.params.id = insertResult.identifiers.filter(o => Object.keys(o)[0] === 'id')[0].id;
            getCategorise(req)
                .then(resolve)
                .catch(reject)
        })
        .catch(e => {
            const err = fmtError(e)!;
            if (req.query.upsert === 'true'
                && err.hasOwnProperty('message')
                && err.message.indexOf('duplicate key value violates unique constraint') > -1)
                return req.getOrm().typeorm!.connection
                    .getRepository(Categorise)
                    .find({
                        select: ['id' /*, 'artifactLocation', 'categoryEnumName', 'username'*/],
                        where: [
                            {
                                username: categorise.username,
                                categoryEnumName: categorise.categoryEnumName
                            }
                        ],
                        take: 1
                    })
                    .then(foundCategorises => {
                        if (foundCategorises == null || !foundCategorises.length)
                            return reject(new NotFoundError('Categorise'));
                        req.params.id = categorise.id = foundCategorises[0].id;
                        return updateCategorise(req)
                            .then(resolve)
                            .catch(reject);
                    })
                    .catch(e => reject(fmtError(e)));
            return reject(err)
        });
});

export const getCategorise = (req: Request & IOrmReq & IUserReq) => new Promise<Categorise>(
    (resolve, reject) =>
        req.params.id == null ?
            reject(new NotFoundError('req.params.id'))
            : req.getOrm().typeorm!.connection
                .getRepository(Categorise)
                .findOne({
                    relations: ['artifactLocation'],
                    where: Object.assign({ id: req.params.id },
                        hasRole(req, 'admin') ? {} :
                            { username: req.user_id! }
                    )
                })
                .then(handleCategorise(resolve, reject))
                .catch(e => reject(fmtError(e)))
);

export const getCategoriseStats = (req: Request & IOrmReq & IUserReq) => new Promise<{categorise_agg_stats: ICategoriseStats[]}>(
    (resolve, reject) =>
        req.getOrm().typeorm!.connection
            .getRepository(Categorise)
            .query(`SELECT username, count(*)
                    FROM categorise_tbl
                    GROUP BY username;`, [])
            /*.createQueryBuilder()
            .select('username')
            .addGroupBy('username')
            .getManyAndCount()*/
            .then((categorise_agg_stats) => {
                if (categorise_agg_stats == null || categorise_agg_stats.length == 0)
                    return reject(new NotFoundError('Categorise'));
                return resolve({ categorise_agg_stats } as unknown as {categorise_agg_stats: ICategoriseStats[]});
            })
            .catch(e => reject(fmtError(e)))
);

export const getCategoriseDiff =
    (req: Request & IOrmReq & IUserReq) => new Promise<{categorise_diff: ICategoriseDiff[]}>(
        (resolve, reject) =>
            req.getOrm().typeorm!.connection
                .getRepository(Categorise)
                .query(`SELECT
                           C0."artifactLocation" as "artifactLocation"
                           C0.category = C1.category AS same_categorisation,
                           C0.category AS category0,
                           C1.category AS category1,
                           C0.username AS username0,
                           C1.username AS username1
                        FROM
                             categorise_tbl C0,
                             categorise_tbl C1
                        WHERE
                             C0.username != C1.username AND
                             C0."artifactLocation" = C1."artifactLocation"
                        LIMIT
                             $1
                        OFFSET
                             $2;`, [req.params.limit || null, req.params.offset || null])
                .then((categorise_diff) => {
                    if (categorise_diff == null || categorise_diff.length == 0)
                        return reject(new NotFoundError('Categorise'));
                    return resolve({ categorise_diff } as unknown as {categorise_diff: ICategoriseDiff[]});
                })
                .catch(e => reject(fmtError(e)))
    );

export const getCategoriseDiffCount =
    (req: Request & IOrmReq & IUserReq) => new Promise<{categorise_diff: ICategoriseDiff[]}>(
        (resolve, reject) =>
            req.getOrm().typeorm!.connection
                .getRepository(Categorise)
                .query(`SELECT COUNT(*)
                        FROM
                             categorise_tbl C0,
                             categorise_tbl C1
                        WHERE
                             C0.username != C1.username AND
                             C0."artifactLocation" = C1."artifactLocation";`, [])
                .then((categorise_diff) => {
                    if (categorise_diff == null || categorise_diff.length == 0)
                        return reject(new NotFoundError('Categorise'));
                    return resolve({ categorise_diff } as unknown as {categorise_diff: ICategoriseDiff[]});
                })
                .catch(e => reject(fmtError(e)))
    );

export const getCategoriseDiffC =
    (req: Request & IOrmReq & IUserReq) => new Promise<string[]>(
        (resolve, reject) => console.info('$1:', req.user_id,
            '\nLIMIT:', req.params.limit || 'NULL',
            '\nOFFSET:', req.params.offset || 'NULL') as any ||
            req.getOrm().typeorm!.connection
                .getRepository(Categorise)
                .query(`SELECT
                             C0."artifactLocation"
                        FROM
                             categorise_tbl C0,
                             categorise_tbl C1
                        WHERE
                             C0.username != C1.username AND
                             C0."artifactLocation" = C1."artifactLocation" AND
                             C0."artifactLocation" NOT IN (
                                 SELECT
                                     "artifactLocation"
                                 FROM
                                     categorise_tbl
                                 WHERE
                                     username = $1
                                     
                             )
                        ORDER BY
                             C0.id
                        LIMIT
                             $2
                        OFFSET
                             $3;`,
                    [req.user_id, req.params.limit || null, req.params.offset || null]
                )
                .then((artifactLocations: {artifactLocation: string}[]) => {
                    if (artifactLocations == null || artifactLocations.length == 0)
                        return reject(new NotFoundError('Categorise'));
                    return resolve(artifactLocations.map(artifactLocations => artifactLocations.artifactLocation));
                })
                .catch(e => reject(fmtError(e)))
    );

export const getManyCategorise = (req: Request & IOrmReq & IUserReq) =>
    new Promise<Categorise[]>((resolve, reject) =>
        req.getOrm().typeorm!.connection
            .getRepository(Categorise)
            .find(Object.assign({
                select: req.getOrm().typeorm!.connection
                    .getMetadata(Categorise)
                    .columns
                    .map(cm => cm.propertyAliasName) as any,
                order: {
                    updatedAt: 'ASC'
                }
            }, hasRole(req, 'admin') ? {} : {
                where: {
                    username: req.user_id!
                }
            }))
            .then((categorises?: Categorise[]) =>
                resolve(categorises == null ? [] : categorises)
            )
            .catch(e => reject(fmtError(e)))
    );

export const getAllCategorise = (req: Request & IOrmReq & IUserReq) =>
    new Promise<Categorise[]>((resolve, reject) =>
        req.getOrm().typeorm!.connection
            .getRepository(Categorise)
            .find(Object.assign({
                select: req.getOrm().typeorm!.connection
                    .getMetadata(Categorise)
                    .columns
                    .map(cm => cm.propertyAliasName) as any,
                order: {
                    updatedAt: 'ASC'
                }
            }))
            .then((categorises?: Categorise[]) =>
                resolve(categorises == null ? [] : categorises)
            )
            .catch(e => reject(fmtError(e)))
    );

export const updateCategorise = (req: CategoriseBodyReq) => new Promise<Categorise>((resolve, reject) => {
    const CategoriseR = req.getOrm().typeorm!.connection
        .getRepository(Categorise);

    if (req.params.id == null)
        return reject(new NotFoundError('req.params.id'));
    else if (req.body == null)
        return reject(new NotFoundError('req.body == null'));

    const updateBody = Object.assign({}, req.body);
    req.body = {
        id: req.params.id,
        username: req.user_id!
    };
    getCategorise(req)
        .then(categorise => {
            Object
                .keys(categorise)
                .filter(o => categorise[o] != null)
                .forEach(k => req.body[k] = categorise[k]);

            categorise = new Categorise();

            Object
                .keys(updateBody)
                .filter(k => updateBody[k] != null)
                .forEach(k => categorise[k] = updateBody[k]);

            ['createdAt', 'updatedAt']
                .filter(k => req.body.hasOwnProperty(k))
                .forEach(k =>
                    delete categorise[k]
                );

            ['id', 'username', 'categoryEnumName', 'artifactLocation']
                .filter(k => req.body.hasOwnProperty(k))
                .filter(k => !categorise.hasOwnProperty(k))
                .forEach(k =>
                    categorise[k] = req.body[k]
                );

            CategoriseR
                .createQueryBuilder()
                .update(Categorise)
                .set(categorise)
                .where('id = :id', { id: req.params.id })
                .andWhere('username = :username', {
                    username: req.user_id!
                })
                .execute()
                .then(() => {
                    req.params.id = categorise.id;
                    return getCategorise(req).then(resolve).catch(reject);
                })
                .catch(e => reject(fmtError(e)));

        });
});

export const removeCategorise = (req: Request & IOrmReq & IUserReq) => new Promise<void>((resolve, reject) => {
    const CategoriseR = req.getOrm().typeorm!.connection
        .getRepository(Categorise);

    if (req.params.id == null)
        return reject(new NotFoundError('req.params.id'));

    CategoriseR
        .findOne({
            id: req.params.id,
            username: req.user_id!
        })
        .then((categorise?: Categorise) => {
            if (categorise == null)
                return resolve(void 0);
            else if (categorise.username !== req.user_id)
                return reject(new GenericError({
                    statusCode: 401,
                    name: 'WrongUser',
                    message: `Actual categorise.username !== ${req.user_id}`
                }));
            else
                req.getOrm().typeorm!.connection
                    .createQueryBuilder()
                    .delete()
                    .from(Categorise)
                    .where('id = :id AND username = :username', {
                        id: req.params.id,
                        username: req.user_id!
                    })
                    .execute()
                    .then(() => resolve(void 0))
                    .catch(e => reject(fmtError(e)));
        })
        .catch(e => reject(fmtError(e)));
});

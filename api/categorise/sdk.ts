import { Request } from 'restify';

import { IOrmReq } from '@offscale/orm-mw/interfaces';

import { Categorise } from './models';
import { JsonSchema } from 'tv4';
import { fmtError, GenericError, NotFoundError } from '@offscale/custom-restify-errors';

/* tslint:disable:no-var-requires */
export const schema: JsonSchema = require('./../../test/api/categorise/schema');

export type CategoriseBodyReq = Request & IOrmReq & {body?: Categorise, user_id?: string};

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
            req.params.id = insertResult.identifiers.filter(o => Object.keys(o)[0] === 'id')[0];
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

export const getCategorise = (req: Request & IOrmReq & {user_id?: string}) => new Promise<Categorise>(
    (resolve, reject) =>
        req.params.id == null ?
            reject(new NotFoundError('req.params.id'))
            : req.getOrm().typeorm!.connection
                .getRepository(Categorise)
                .findOne({
                    relations: ['artifactLocation'],
                    where: {
                        id: req.params.id,
                        username: req.user_id!
                    }
                })
                .then(handleCategorise(resolve, reject))
                .catch(e => reject(fmtError(e)))
);

export const getManyCategorise = (req: Request & IOrmReq) => new Promise<Categorise[]>((resolve, reject) =>
    req.getOrm().typeorm!.connection
        .getRepository(Categorise)
        .find({
            select: req.getOrm().typeorm!.connection
                .getMetadata(Categorise)
                .columns
                .map(cm => cm.propertyAliasName) as any,
            order: {
                updatedAt: 'ASC'
            }
        })
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
                .execute()
                .then(() => {
                    req.params.id = categorise.id;
                    return getCategorise(req).then(resolve).catch(reject);
                })
                .catch(e => reject(fmtError(e)));

        });
});

export const removeCategorise = (req: Request & IOrmReq & {user_id?: string}) => new Promise<void>((resolve, reject) => {
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

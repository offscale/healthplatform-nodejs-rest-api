import { Request } from 'restify';

import { IOrmReq } from '@offscale/orm-mw/interfaces';

import { Img } from './models';
import { JsonSchema } from 'tv4';
import { NotFoundError } from '@offscale/custom-restify-errors';

/* tslint:disable:no-var-requires */
export const schema: JsonSchema = require('../../test/api/img/schema');

export type ImgBodyReq = Request & IOrmReq & {body?: Img, user_id?: string};

const handleImg = (resolve: (img: Img) => void,
                   reject: (error: Error) => void) => (img?: Img) =>
    img == null ?
        reject(new NotFoundError('Img'))
        : resolve(img);

export const createImg = (req: ImgBodyReq) => new Promise<Img>((resolve, reject) => {
    if (req.body == null)
        return reject(new NotFoundError('req.body == null'));

    const img = new Img();
    Object
        .keys(req.body)
        // @ts-ignore
        .forEach(k => img[k] = req.body[k]);

    req.getOrm().typeorm!.connection
        .getRepository(Img)
        .save(img)
        .then(handleImg(resolve, reject))
        .catch(reject);
});

export const getImg = (req: Request & IOrmReq) => new Promise<Img>((resolve, reject) =>
    req.params.id == null ?
        reject(new NotFoundError('req.params.id'))
        : req.getOrm().typeorm!.connection
            .getRepository(Img)
            .findOne(req.params.id)
            .then(handleImg(resolve, reject))
            .catch(reject)
);

export const getManyImg = (req: Request & IOrmReq) => new Promise<Img[]>((resolve, reject) =>
    req.getOrm().typeorm!.connection
        .getRepository(Img)
        .find({
            order: {
                updatedAt: 'ASC'
            }
        })
        .then((imgs?: Img[]) =>
            imgs == null || !imgs.length ?
                reject(new NotFoundError('Img'))
                : resolve(imgs)
        )
        .catch(reject)
);

export const updateImg = (req: ImgBodyReq) => new Promise<Img>((resolve, reject) => {
    const ImgR = req.getOrm().typeorm!.connection
        .getRepository(Img);

    if (req.params.id == null)
        return reject(new NotFoundError('req.params.id'));
    else if (req.body == null)
        return reject(new NotFoundError('req.body == null'));

    ImgR.findOne(req.params.id)
        .then((img?: Img) => {
            if (img == null) return createImg(req);
            Object
                .keys(req.body)
                // @ts-ignore
                .forEach(k => img[k] = req.body[k]);
            ImgR
                .save(img)
                .then(handleImg(resolve, reject))
                .catch(reject);
        })
        .catch(reject);
});

export const removeImg = (req: Request & IOrmReq & {user_id?: string}) => new Promise<void>((resolve, reject) => {
    const ImgR = req.getOrm().typeorm!.connection
        .getRepository(Img);

    if (req.params.id == null)
        return reject(new NotFoundError('req.params.id'));

    ImgR
        .findOne(req.params.id)
        .then((img?: Img) => {
            if (img == null) {
                return resolve(void 0);
                // TODO: Add an `else if` here to only allow removed if admin
            } else
                req.getOrm().typeorm!.connection
                    .createQueryBuilder()
                    .delete()
                    .from(Img)
                    .where('id = :id', { id: req.params.id })
                    .execute()
                    .then(() => resolve(void 0))
                    .catch(reject);
        })
        .catch(reject);
});

import { Request } from 'restify';

import { IOrmReq } from '@offscale/orm-mw/interfaces';
import { fmtError, NotFoundError } from '@offscale/custom-restify-errors';

import { JsonSchema } from 'tv4';

import { CategoryEnum } from './models';
import { IUserReq } from '../shared_interfaces';


/* tslint:disable:no-var-requires */
export const schema: JsonSchema = require('../../test/api/category_enum/schema');

export type CategoryEnumBodyReq = Request & IOrmReq & {body?: CategoryEnum, user_id?: string};

const handleCategoryEnum = (resolve: (category_enum: CategoryEnum) => void,
                            reject: (error: Error) => void) => (category_enum?: CategoryEnum) =>
    category_enum == null ?
        reject(new NotFoundError('CategoryEnum'))
        : resolve(category_enum);

export const createCategoryEnum = (req: CategoryEnumBodyReq) => new Promise<CategoryEnum>((resolve, reject) => {
    if (req.body == null)
        return reject(new NotFoundError('req.body == null'));

    const category_enum = new CategoryEnum();
    Object
        .keys(req.body)
        // @ts-ignore
        .forEach(k => category_enum[k] = req.body[k]);

    req.params.name = category_enum.name;

    req.getOrm().typeorm!.connection
        .createQueryBuilder()
        .insert()
        .into(CategoryEnum)
        .values([category_enum])
        .execute()
        .then(() =>
            getCategoryEnum(req)
                .then(resolve)
                .catch(reject)
        )
        .catch(e => reject(fmtError(e)));
});

export const getCategoryEnum = (req: Request & IOrmReq) => new Promise<CategoryEnum>((resolve, reject) =>
    req.params.name == null ?
        reject(new NotFoundError('req.params.name'))
        : req.getOrm().typeorm!.connection
            .getRepository(CategoryEnum)
            .findOne({ name: req.params.name })
            .then(handleCategoryEnum(resolve, reject))
            .catch(e => reject(fmtError(e)))
);

export const getManyCategoryEnum = (req: Request & IOrmReq) => new Promise<CategoryEnum[]>((resolve, reject) =>
    req.getOrm().typeorm!.connection
        .getRepository(CategoryEnum)
        .find({
            order: {
                updatedAt: 'ASC'
            }
        })
        .then((category_enums?: CategoryEnum[]) =>
            resolve(category_enums == null ? [] : category_enums)
        )
        .catch(e => reject(fmtError(e)))
);

export const updateCategoryEnum = (req: CategoryEnumBodyReq) => new Promise<CategoryEnum>((resolve, reject) => {
    const CategoryEnumR = req.getOrm().typeorm!.connection
        .getRepository(CategoryEnum);

    if (req.params.name == null)
        return reject(new NotFoundError('req.params.name'));
    else if (req.body == null)
        return reject(new NotFoundError('req.body == null'));

    CategoryEnumR.findOne({ name: req.params.name })
        .then((category_enum?: CategoryEnum) => {
            if (category_enum == null) return createCategoryEnum(req);
            Object
                .keys(req.body)
                // @ts-ignore
                .forEach(k => category_enum[k] = req.body[k]);
            CategoryEnumR
                .save(category_enum)
                .then(handleCategoryEnum(resolve, reject))
                .catch(e => reject(fmtError(e)));
        })
        .catch(e => reject(fmtError(e)));
});

export const removeCategoryEnum = (req: Request & IOrmReq & IUserReq) => new Promise<void>((resolve, reject) => {
    const CategoryEnumR = req.getOrm().typeorm!.connection
        .getRepository(CategoryEnum);

    if (req.params.name == null)
        return reject(new NotFoundError('req.params.name'));

    CategoryEnumR
        .findOne({ name: req.params.name })
        .then((category_enum?: CategoryEnum) => {
            if (category_enum == null) {
                return resolve(void 0);
                // TODO: Add an `else if` here to only allow removed if admin
            } else
                req.getOrm().typeorm!.connection
                    .createQueryBuilder()
                    .delete()
                    .from(CategoryEnum)
                    .where('name = :name', { name: req.params.name })
                    .execute()
                    .then(() => resolve(void 0))
                    .catch(e => {
                        console.error('removeCategoryEnum::findOne::delete::e', e, ';');
                        return reject(fmtError(e));
                    });
        })
        .catch(e => {
            console.error('removeCategoryEnum::findOne::e', e, ';');
            return reject(fmtError(e));
        });
});

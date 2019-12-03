import { Request } from 'restify';
import { IOrmReq } from '@offscale/orm-mw/interfaces';
import { JsonSchema } from 'tv4';
import { CategoryEnum } from './models';
export declare const schema: JsonSchema;
export declare type CategoryEnumBodyReq = Request & IOrmReq & {
    body?: CategoryEnum;
    user_id?: string;
};
export declare const createCategoryEnum: (req: CategoryEnumBodyReq) => Promise<CategoryEnum>;
export declare const getCategoryEnum: (req: Request & IOrmReq) => Promise<CategoryEnum>;
export declare const getManyCategoryEnum: (req: Request & IOrmReq) => Promise<CategoryEnum[]>;
export declare const updateCategoryEnum: (req: CategoryEnumBodyReq) => Promise<CategoryEnum>;
export declare const removeCategoryEnum: (req: Request & IOrmReq & {
    user_id?: string | undefined;
}) => Promise<void>;

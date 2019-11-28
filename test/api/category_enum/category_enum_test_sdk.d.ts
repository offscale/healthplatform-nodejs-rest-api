import { Response } from 'supertest';
import { Server } from 'restify';
import { AccessTokenType } from '@offscale/nodejs-utils/interfaces';
import { CategoryEnum } from '../../../api/category_enum/models';
export declare class CategoryEnumTestSDK {
    app: Server;
    constructor(app: Server);
    private _access_token?;
    get access_token(): AccessTokenType;
    set access_token(new_access_token: AccessTokenType);
    get(category_enum_name: CategoryEnum['name']): Promise<Response>;
    post(category_enum: CategoryEnum): Promise<Response>;
    update(category_enum_name: CategoryEnum['name'], category_enum: Partial<CategoryEnum>): Promise<Response>;
    remove(category_enum_name: CategoryEnum['name']): Promise<Response>;
    getAll(): Promise<Response>;
}

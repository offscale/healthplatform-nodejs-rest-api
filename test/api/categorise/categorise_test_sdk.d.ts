import { Response } from 'supertest';
import { Server } from 'restify';
import { AccessTokenType } from '@offscale/nodejs-utils/interfaces';
import { Categorise } from '../../../api/categorise/models';
export declare class CategoriseTestSDK {
    app: Server;
    constructor(app: Server);
    private _access_token?;
    get access_token(): AccessTokenType;
    set access_token(new_access_token: AccessTokenType);
    get(categorise_id: Categorise['id']): Promise<Response>;
    post(categorise: Categorise): Promise<Response>;
    update(categorise_id: Categorise['id'], categorise: Partial<Categorise>): Promise<Response>;
    remove(categorise_id: Categorise['id']): Promise<Response>;
    getAll(): Promise<Response>;
}

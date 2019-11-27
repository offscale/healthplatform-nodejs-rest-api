import { Response } from 'supertest';
import { Server } from 'restify';
import { AccessTokenType } from '@offscale/nodejs-utils/interfaces';
import { Img } from '../../../api/img/models';
export declare class ImgTestSDK {
    app: Server;
    constructor(app: Server);
    private _access_token?;
    get access_token(): AccessTokenType;
    set access_token(new_access_token: AccessTokenType);
    get(img_id: Img['id']): Promise<Response>;
    post(img: Img): Promise<Response>;
    update(img_id: Img['id'], img: Partial<Img>): Promise<Response>;
    remove(img_id: Img['id']): Promise<Response>;
    getAll(): Promise<Response>;
}

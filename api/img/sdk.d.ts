import { Request } from 'restify';
import { IOrmReq } from '@offscale/orm-mw/interfaces';
import { Img } from './models';
import { JsonSchema } from 'tv4';
export declare const schema: JsonSchema;
export declare type ImgBodyReq = Request & IOrmReq & {
    body?: Img;
    user_id?: string;
};
export declare const createImg: (req: ImgBodyReq) => Promise<Img>;
export declare const getImg: (req: Request & IOrmReq) => Promise<Img>;
export declare const getManyImg: (req: Request & IOrmReq) => Promise<Img[]>;
export declare const updateImg: (req: ImgBodyReq) => Promise<Img>;
export declare const removeImg: (req: Request & IOrmReq & {
    user_id?: string | undefined;
}) => Promise<void>;

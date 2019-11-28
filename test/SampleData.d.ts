/// <reference types="node" />
import { IncomingMessage } from 'http';
import { HttpError } from 'restify-errors';
import { Connection, Query } from 'waterline';
import { AccessTokenType, IncomingMessageError, TCallback } from '@offscale/nodejs-utils/interfaces';
export interface ISampleData {
    token: string;
    login(user: string, callback: TCallback<HttpError, AccessTokenType>): void;
    registerLogin(user: string, callback: TCallback<Error | IncomingMessageError | IIncomingMessageF, string>): void;
    unregister(user: string, callback: TCallback<HttpError, string>): void;
}
export interface IIncomingMessageF extends IncomingMessage {
    func_name: string;
}
export declare const HttpError_from_IncomingMessageF: (incoming: IIncomingMessageF) => HttpError;
export declare class SampleData implements ISampleData {
    token: AccessTokenType;
    private uri;
    constructor(uri: string, connection: Connection[], collections: Query[]);
    login(user: string, callback: TCallback<HttpError, AccessTokenType>): void;
    logout(access_token: AccessTokenType, callback: TCallback<HttpError, string>): void;
    register(user: string, callback: (err: Error, response: any) => void): void;
    registerLogin(user: string, callback: TCallback<Error | IncomingMessageError | IIncomingMessageF, string>): void;
    unregister(user: string, callback: TCallback<HttpError, AccessTokenType>): void;
    private mergeOptions;
}

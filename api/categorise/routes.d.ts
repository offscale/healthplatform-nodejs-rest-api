import * as restify from 'restify';
export declare const create: (app: restify.Server, namespace?: string) => boolean | restify.Route;
export declare const read: (app: restify.Server, namespace?: string) => boolean | restify.Route;

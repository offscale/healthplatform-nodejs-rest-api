import * as restify from 'restify';
export declare const create: (app: restify.Server, namespace?: string) => boolean | restify.Route;
export declare const getAll: (app: restify.Server, namespace?: string) => boolean | restify.Route;
export declare const getNext: (app: restify.Server, namespace?: string) => boolean | restify.Route;

import { Express, Router } from 'express';
import { Logger } from 'winston';
import { ServerOptions } from './types/ServerOptions';
export declare const logger: Logger;
export declare function initServer(serverOptions: Partial<ServerOptions>): {
    app: Express;
    routes: Router;
    logger: Logger;
};

import { Request } from 'express';
export declare function backupSessions(req: Request): Promise<any>;
export declare function restoreSessions(req: Request, file: Express.Multer.File): Promise<any>;
export declare function closeAllSessions(req: Request): Promise<void>;

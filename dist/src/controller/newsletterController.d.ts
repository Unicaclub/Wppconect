import { Request, Response } from 'express';
export declare function createNewsletter(req: Request, res: Response): Promise<void>;
export declare function editNewsletter(req: Request, res: Response): Promise<void>;
export declare function destroyNewsletter(req: Request, res: Response): Promise<void>;
export declare function muteNewsletter(req: Request, res: Response): Promise<void>;

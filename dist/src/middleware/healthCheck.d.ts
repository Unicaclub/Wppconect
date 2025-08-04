import { Request, Response } from 'express';
export declare function healthz(req: Request, res: Response): Promise<void>;
export declare function unhealthy(req: Request, res: Response): Promise<void>;

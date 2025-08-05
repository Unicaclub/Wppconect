import { NextFunction, Request, Response } from 'express';
export default function statusConnection(req: Request, res: Response, next: NextFunction): Promise<void>;

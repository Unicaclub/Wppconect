import { NextFunction, Request, Response } from 'express';
declare const verifyToken: (req: Request, res: Response, next: NextFunction) => any;
export default verifyToken;

import { Request, Response } from 'express';
export declare function addNewLabel(req: Request, res: Response): Promise<void>;
export declare function addOrRemoveLabels(req: Request, res: Response): Promise<void>;
export declare function getAllLabels(req: Request, res: Response): Promise<void>;
export declare function deleteAllLabels(req: Request, res: Response): Promise<void>;
export declare function deleteLabel(req: Request, res: Response): Promise<void>;

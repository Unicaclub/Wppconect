import { Request, Response } from 'express';
export declare function createCommunity(req: Request, res: Response): Promise<void>;
export declare function deactivateCommunity(req: Request, res: Response): Promise<void>;
export declare function addSubgroupsCommunity(req: Request, res: Response): Promise<void>;
export declare function removeSubgroupsCommunity(req: Request, res: Response): Promise<void>;
export declare function demoteCommunityParticipant(req: Request, res: Response): Promise<void>;
export declare function promoteCommunityParticipant(req: Request, res: Response): Promise<void>;
export declare function getCommunityParticipants(req: Request, res: Response): Promise<void>;

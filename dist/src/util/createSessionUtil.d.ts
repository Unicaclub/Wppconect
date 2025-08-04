import { Request } from 'express';
import { WhatsAppServer } from '../types/WhatsAppServer';
export default class CreateSessionUtil {
    startChatWootClient(client: any): any;
    createSessionUtil(req: any, clientsArray: any, session: string, res?: any): Promise<void>;
    opendata(req: Request, session: string, res?: any): Promise<void>;
    exportPhoneCode(req: any, phone: any, phoneCode: any, client: WhatsAppServer, res?: any): void;
    exportQR(req: any, qrCode: any, urlCode: any, client: WhatsAppServer, res?: any): void;
    onParticipantsChanged(req: any, client: any): Promise<void>;
    start(req: Request, client: WhatsAppServer): Promise<void>;
    checkStateSession(client: WhatsAppServer, req: Request): Promise<void>;
    listenMessages(client: WhatsAppServer, req: Request): Promise<void>;
    listenAcks(client: WhatsAppServer, req: Request): Promise<void>;
    onPresenceChanged(client: WhatsAppServer, req: Request): Promise<void>;
    onReactionMessage(client: WhatsAppServer, req: Request): Promise<void>;
    onRevokedMessage(client: WhatsAppServer, req: Request): Promise<void>;
    onPollResponse(client: WhatsAppServer, req: Request): Promise<void>;
    onLabelUpdated(client: WhatsAppServer, req: Request): Promise<void>;
    encodeFunction(data: any, webhook: any): string;
    decodeFunction(text: any, client: any): any;
    getClient(session: any): import("@wppconnect-team/wppconnect").Whatsapp;
}

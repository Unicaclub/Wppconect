import { AxiosInstance } from 'axios';
export default class chatWootClient {
    config: any;
    session: any;
    mobile_name: any;
    mobile_number: any;
    sender: any;
    account_id: any;
    inbox_id: any;
    api: AxiosInstance;
    constructor(config: any, session: string);
    sendMessage(client: any, message: any): Promise<any>;
    findContact(query: string): Promise<any>;
    createContact(message: any): Promise<any>;
    findConversation(contact: any): Promise<any>;
    createConversation(contact: any, source_id: any): Promise<any>;
}

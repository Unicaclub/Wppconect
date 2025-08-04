import { FileTokenStore as fsTokenStore } from './FileTokenStore/FileTokenStore';
declare class FileTokenStore {
    client: any;
    constructor(client: any);
    tokenStore: fsTokenStore;
    encodeFunction(data: any, config: any): string;
    decodeFunction(text: string, client: any): Promise<string[]>;
}
export default FileTokenStore;

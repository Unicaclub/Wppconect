declare class MongodbTokenStore {
    client: any;
    constructor(client: any);
    tokenStore: {
        getToken: (sessionName: string) => Promise<any>;
        setToken: (sessionName: any, tokenData: any) => Promise<boolean>;
        removeToken: (sessionName: string) => Promise<boolean>;
        listTokens: () => Promise<any>;
    };
}
export default MongodbTokenStore;

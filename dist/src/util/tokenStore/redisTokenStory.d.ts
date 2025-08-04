declare class RedisTokenStore {
    client: any;
    prefix: string;
    constructor(client: any);
    tokenStore: {
        getToken: (sessionName: string) => Promise<unknown>;
        setToken: (sessionName: string, tokenData: any) => Promise<unknown>;
        removeToken: (sessionName: string) => Promise<unknown>;
        listTokens: () => Promise<unknown>;
    };
}
export default RedisTokenStore;

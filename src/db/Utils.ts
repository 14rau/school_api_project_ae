import { Database } from "./database";



export declare class BaseApi<E> {
    public addNew(ctx, data: Partial<E>);
    public put(ctx, data: Partial<E>);
    public delete(ctx, data: Partial<E>);
}
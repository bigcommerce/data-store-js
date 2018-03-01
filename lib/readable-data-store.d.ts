export default interface ReadableDataStore<TTransformedState> {
    getState(): TTransformedState;
    subscribe(subscriber: Subscriber<TTransformedState>, ...filters: Array<Filter<TTransformedState>>): Unsubscriber;
}
export declare type Filter<TState> = (state: TState) => any;
export declare type Subscriber<TState> = (state: TState) => void;
export declare type Unsubscriber = () => void;

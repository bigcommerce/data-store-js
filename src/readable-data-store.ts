
export default interface ReadableDataStore<TTransformedState> {
    getState(): TTransformedState;
    subscribe(
        subscriber: Subscriber<TTransformedState>,
        ...filters: Array<Filter<TTransformedState>>
    ): Unsubscriber;
    subscribe(
        subscriber: Subscriber<TTransformedState>,
        options: SubscribeOptions<TTransformedState>
    ): Unsubscriber;
}

export type Filter<TState> = (state: TState) => any;

export type Subscriber<TState> = (state: TState) => void;

export type Unsubscriber = () => void;

export interface SubscribeOptions<TTransformedState> {
    filters?: Array<Filter<TTransformedState>>;
    initial?: boolean;
}

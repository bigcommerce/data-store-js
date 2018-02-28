import { SubscribableOrPromise } from 'rxjs/Observable';
import Action from './action';
import ThunkAction from './thunk-action';
import ReadableDataStore from './readable-data-store';

export default interface DispatchableDataStore<TTransformedState, TAction extends Action> extends ReadableDataStore<TTransformedState> {
    dispatch: <TDispatchAction extends TAction>(
        action: DispatchableAction<TDispatchAction, TTransformedState>,
        options?: DispatchOptions
    ) => Promise<TTransformedState>;
}

export interface DispatchOptions {
    queueId?: string;
}

export type DispatchableAction<TAction = Action, TState = any> = TAction | SubscribableOrPromise<TAction> | ThunkAction<TAction, TState>;

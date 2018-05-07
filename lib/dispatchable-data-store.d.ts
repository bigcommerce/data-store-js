import { SubscribableOrPromise } from 'rxjs/Observable';
import Action from './action';
import ReadableDataStore from './readable-data-store';
import ThunkAction from './thunk-action';
export default interface DispatchableDataStore<TTransformedState, TAction extends Action = Action> extends ReadableDataStore<TTransformedState> {
    dispatch<TDispatchAction extends TAction>(action: DispatchableAction<TDispatchAction, TTransformedState>, options?: DispatchOptions): Promise<TTransformedState>;
}
export interface DispatchOptions {
    queueId?: string;
}
export declare type DispatchableAction<TAction = Action, TState = any> = TAction | SubscribableOrPromise<TAction> | ThunkAction<TAction, TState>;

import 'rxjs/add/observable/from';
import 'rxjs/add/observable/merge';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/concatMap';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/first';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/scan';
import { Subscribable } from 'rxjs/Observable';
import Action from './action';
import DispatchableDataStore, { DispatchableAction, DispatchOptions } from './dispatchable-data-store';
import ReadableDataStore, { Filter, Subscriber, Unsubscriber } from './readable-data-store';
import Reducer from './reducer';
export default class DataStore<TState, TAction extends Action = Action, TTransformedState = TState> implements ReadableDataStore<TTransformedState>, DispatchableDataStore<TTransformedState, TAction> {
    private _reducer;
    private _options;
    private _notification$;
    private _dispatchers;
    private _dispatchQueue$;
    private _state$;
    private _errors;
    constructor(reducer: Reducer<TState, TAction>, initialState?: Partial<TState>, options?: Partial<DataStoreOptions<TState, TAction, TTransformedState>>);
    dispatch<TDispatchAction extends TAction>(action: DispatchableAction<TDispatchAction, TTransformedState>, options?: DispatchOptions): Promise<TTransformedState>;
    getState(): TTransformedState;
    notifyState(): void;
    subscribe(subscriber: Subscriber<TTransformedState>, ...filters: Array<Filter<TTransformedState>>): Unsubscriber;
    private _transformStates(states, action);
    private _dispatchAction<TDispatchAction>(action);
    private _dispatchObservableAction<TDispatchAction>(action$, options?);
    private _dispatchThunkAction<TDispatchAction>(thunkAction, options?);
    private _getDispatcher(queueId?);
    private _getDispatchError(queueId?);
}
export interface DataStoreOptions<TState, TAction, TTransformedState> {
    shouldWarnMutation: boolean;
    actionTransformer(action: Subscribable<TAction>): Subscribable<TAction>;
    stateTransformer(state: TState): TTransformedState;
}

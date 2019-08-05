import Action from './action';
import combineReducers, { ReducerMap } from './combine-reducers';
import DataStore, { DataStoreOptions } from './data-store';
import Reducer from './reducer';

export default function createDataStore<TState, TAction extends Action = Action, TTransformedState = TState>(
    reducer: Reducer<TState, TAction> | ReducerMap<TState, TAction>,
    initialState?: Partial<TState>,
    options?: Partial<DataStoreOptions<TState, TAction, TTransformedState>>
): DataStore<TState, TAction, TTransformedState> {
    if (typeof reducer === 'function') {
        return new DataStore(reducer, initialState, options);
    }

    return new DataStore(
        combineReducers(reducer, { equalityCheck: options && options.equalityCheck }),
        initialState,
        options
    );
}

import Action from './action';
import { ReducerMap } from './combine-reducers';
import DataStore, { DataStoreOptions } from './data-store';
import Reducer from './reducer';
export default function createDataStore<TState, TAction extends Action, TTransformedState = TState>(reducer: Reducer<Partial<TState>, TAction> | ReducerMap<Partial<TState>, TAction>, initialState?: Partial<TState>, options?: Partial<DataStoreOptions<TState, TAction, TTransformedState>>): DataStore<TState, TAction, TTransformedState>;

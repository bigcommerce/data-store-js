import Action from './action';
import Reducer from './reducer';
export default function combineReducers<TState, TAction extends Action = Action>(reducers: ReducerMap<TState, TAction>): Reducer<TState, TAction>;
export declare type ReducerMap<TState, TAction extends Action = Action> = {
    [Key in keyof TState]: Reducer<TState[Key], TAction>;
};

import { assign, isEqual } from 'lodash';

import Action from './action';
import Reducer from './reducer';

export default function combineReducers<TState, TAction extends Action = Action>(
    reducers: ReducerMap<TState, TAction>
): Reducer<TState, TAction> {
    return (state, action) =>
        Object.keys(reducers).reduce((result, key) => {
            const reducer = reducers[key as keyof TState];
            const currentState = state ? state[key as keyof TState] : undefined;
            const newState = reducer(currentState, action);

            if (isEqual(currentState, newState) && result) {
                return result;
            }

            return assign({}, result, { [key]: newState });
        }, state || {} as TState);
}

export type ReducerMap<TState, TAction extends Action = Action> = {
    [Key in keyof TState]: Reducer<TState[Key], TAction>;
};

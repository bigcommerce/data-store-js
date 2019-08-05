import { assign } from 'lodash';
import * as shallowEqual from 'shallowequal';

import Action from './action';
import Reducer from './reducer';

export default function combineReducers<TState, TAction extends Action = Action>(
    reducers: ReducerMap<TState, TAction>,
    options?: CombineReducersOptions
): Reducer<TState, TAction> {
    const { equalityCheck = shallowEqual } = options || {};

    return (state, action) =>
        Object.keys(reducers).reduce((result, key) => {
            const reducer = reducers[key as keyof TState];
            const currentState = state ? state[key as keyof TState] : undefined;
            const newState = reducer(currentState, action);

            if (equalityCheck(currentState, newState) && result) {
                return result;
            }

            return assign({}, result, { [key]: newState });
        }, state || {} as TState);
}

export type ReducerMap<TState, TAction extends Action = Action> = {
    [Key in keyof TState]: Reducer<TState[Key], TAction>;
};

export interface CombineReducersOptions {
    equalityCheck?(valueA: any, valueB: any): boolean;
}

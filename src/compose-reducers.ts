import { curryRight, flowRight } from 'lodash';
import * as shallowEqual from 'shallowequal';

import Action from './action';
import Reducer from './reducer';

export default function composeReducers<TState, TStateA, TAction extends Action = Action>(
    reducerA: (state: TStateA, action: TAction) => TState,
    reducerB: (state: TState, action: TAction) => TStateA,
    options?: ComposeReducersOptions
): Reducer<TState, TAction>;

export default function composeReducers<TState, TStateA, TStateB, TAction extends Action = Action>(
    reducerA: (state: TStateA, action: TAction) => TState,
    reducerB: (state: TStateB, action: TAction) => TStateA,
    reducerC: (state: TState, action: TAction) => TStateB,
    options?: ComposeReducersOptions
): Reducer<TState, TAction>;

export default function composeReducers<TState, TStateA, TStateB, TStateC, TAction extends Action = Action>(
    reducerA: (state: TStateA, action: TAction) => TState,
    reducerB: (state: TStateB, action: TAction) => TStateA,
    reducerC: (state: TStateC, action: TAction) => TStateB,
    reducerD: (state: TState, action: TAction) => TStateC,
    options?: ComposeReducersOptions
): Reducer<TState, TAction>;

export default function composeReducers<TState, TStateA, TStateB, TStateC, TStateD, TAction extends Action = Action>(
    reducerA: (state: TStateA, action: TAction) => TState,
    reducerB: (state: TStateB, action: TAction) => TStateA,
    reducerC: (state: TStateC, action: TAction) => TStateB,
    reducerD: (state: TStateD, action: TAction) => TStateC,
    reducerE: (state: TState, action: TAction) => TStateD,
    options?: ComposeReducersOptions
): Reducer<TState, TAction>;

export default function composeReducers<TState, TAction extends Action = Action>(
    ...args: any[]
): Reducer<TState, TAction> {
    let reducers: Array<Reducer<TState, TAction>> = args;
    let options: ComposeReducersOptions = {};

    if (typeof args[args.length - 1] === 'object') {
        reducers = args.slice(0, -1);
        options = { ...options, ...args[args.length - 1] };
    }

    const { equalityCheck = shallowEqual } = options;

    return (state, action) => {
        const newState = flowRight(
            reducers.map(reducer => curryRight(reducer, 2)(action))
        )(state);

        return equalityCheck(state, newState) ? state : newState;
    };
}

export interface ComposeReducersOptions {
    equalityCheck?(valueA: any, valueB: any): boolean;
}

import { curryRight, flowRight, isEqual } from 'lodash';

import Action from './action';
import Reducer from './reducer';

export default function composeReducers<TState, TStateA, TAction extends Action = Action>(
    reducerA: (state: TStateA, action: TAction) => TState,
    reducerB: (state: TState, action: TAction) => TStateA
): Reducer<TState, TAction>;

export default function composeReducers<TState, TStateA, TStateB, TAction extends Action = Action>(
    reducerA: (state: TStateA, action: TAction) => TState,
    reducerB: (state: TStateB, action: TAction) => TStateA,
    reducerC: (state: TState, action: TAction) => TStateB
): Reducer<TState, TAction>;

export default function composeReducers<TState, TStateA, TStateB, TStateC, TAction extends Action = Action>(
    reducerA: (state: TStateA, action: TAction) => TState,
    reducerB: (state: TStateB, action: TAction) => TStateA,
    reducerC: (state: TStateC, action: TAction) => TStateB,
    reducerD: (state: TState, action: TAction) => TStateC
): Reducer<TState, TAction>;

export default function composeReducers<TState, TStateA, TStateB, TStateC, TStateD, TAction extends Action = Action>(
    reducerA: (state: TStateA, action: TAction) => TState,
    reducerB: (state: TStateB, action: TAction) => TStateA,
    reducerC: (state: TStateC, action: TAction) => TStateB,
    reducerD: (state: TStateD, action: TAction) => TStateC,
    reducerE: (state: TState, action: TAction) => TStateD
): Reducer<TState, TAction>;

export default function composeReducers<TState, TAction extends Action = Action>(
    ...reducers: Array<Reducer<TState, TAction>>
): Reducer<TState, TAction> {
    return (state, action) => {
        const newState = flowRight(
            reducers
                .filter(reducer => reducer.length === 2)
                .map(reducer => curryRight(reducer)(action))
        )(state);

        return isEqual(state, newState) ? state : newState;
    };
}

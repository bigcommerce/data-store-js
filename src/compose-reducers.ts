import { curryRight, flowRight, isEqual } from 'lodash';

import Action from './action';
import Reducer from './reducer';

export default function composeReducers<TState, TAction extends Action = Action>(
    ...reducers: Array<Reducer<TState, TAction>>
): Reducer<TState, TAction> {
    return (state, action) => {
        const newState = flowRight.apply(
            null,
            reducers.map(reducer => curryRight(reducer)(action))
        )(state);

        return isEqual(state, newState) ? state : newState;
    };
}

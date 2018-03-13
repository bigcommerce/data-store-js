import Action from './action';
import Reducer from './reducer';
export default function composeReducers<TState, TAction extends Action = Action>(...reducers: Array<Reducer<Partial<TState>, TAction>>): Reducer<TState, TAction>;

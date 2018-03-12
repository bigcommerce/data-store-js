import Action from './action';

type Reducer<TState, TAction extends Action = Action> = (state: TState | undefined, action: TAction) => TState;

export default Reducer;

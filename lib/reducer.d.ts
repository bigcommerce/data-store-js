import Action from './action';
declare type Reducer<TState, TAction extends Action = Action> = (state: TState | undefined, action: TAction) => TState;
export default Reducer;

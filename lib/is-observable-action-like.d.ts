import { SubscribableOrPromise } from 'rxjs/Observable';
import Action from './action';
import { DispatchableAction } from './dispatchable-data-store';
export default function isObservableActionLike<TAction extends Action = Action>(action: DispatchableAction<TAction>): action is SubscribableOrPromise<TAction>;

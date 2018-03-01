import { SubscribableOrPromise } from 'rxjs/Observable';
import { DispatchableAction } from './dispatchable-data-store';
import Action from './action';
export default function isObservableActionLike<TAction extends Action = Action>(action: DispatchableAction<TAction>): action is SubscribableOrPromise<TAction>;

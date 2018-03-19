import { Subscribable, SubscribableOrPromise } from 'rxjs/Observable';
import Action from './action';
import { DispatchableAction } from './dispatchable-data-store';

export default function isObservableActionLike<TAction extends Action = Action>(
    action: DispatchableAction<TAction>
): action is SubscribableOrPromise<TAction> {
    return (
        typeof (action as Subscribable<TAction>).subscribe === 'function' ||
        typeof (action as PromiseLike<TAction>).then === 'function'
    );
}

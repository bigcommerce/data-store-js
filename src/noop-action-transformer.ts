import { Subscribable } from 'rxjs/Observable';

import Action from './action';

export default function noopActionTransformer<TAction extends Action, TTransformedAction extends Action = TAction>(
    action: Subscribable<TAction>
): Subscribable<TTransformedAction> {
    return action as any as Subscribable<TTransformedAction>;
}

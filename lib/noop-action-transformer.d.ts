import { Observable } from 'rxjs/Observable';
import Action from './action';
export default function noopActionTransformer<TAction extends Action, TTransformedAction extends Action = TAction>(action: Observable<TAction>): Observable<TTransformedAction>;

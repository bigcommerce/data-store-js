import { Observable } from 'rxjs/Observable';
import ReadableDataStore from './readable-data-store';

type ThunkAction<TAction = any, TTransformedState = any> = (store: ReadableDataStore<TTransformedState>) => Observable<TAction>;

export default ThunkAction;

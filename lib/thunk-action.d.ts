import { Observable } from 'rxjs/Observable';
import ReadableDataStore from './readable-data-store';
declare type ThunkAction<TAction, TTransformedState> = (store: ReadableDataStore<TTransformedState>) => Observable<TAction>;
export default ThunkAction;

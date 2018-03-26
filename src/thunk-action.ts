import { SubscribableOrPromise } from 'rxjs/Observable';

import ReadableDataStore from './readable-data-store';

type ThunkAction<TAction = any, TTransformedState = any> = (store: ReadableDataStore<TTransformedState>) => SubscribableOrPromise<TAction>;

export default ThunkAction;

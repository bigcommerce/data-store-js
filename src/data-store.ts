import { isEqual, merge } from 'lodash';
import { from } from 'rxjs/observable/from';
import { of } from 'rxjs/observable/of';
import { _throw } from 'rxjs/observable/throw';
import {
    catchError,
    concatMap,
    distinctUntilChanged,
    filter,
    first,
    map,
    mergeMap,
    scan,
    skip,
    tap,
} from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable, Subscribable, SubscribableOrPromise } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import Action from './action';
import deepFreeze from './deep-freeze';
import DispatchableDataStore, { DispatchableAction, DispatchOptions } from './dispatchable-data-store';
import isObservableActionLike from './is-observable-action-like';
import noopActionTransformer from './noop-action-transformer';
import noopStateTransformer from './noop-state-transformer';
import ReadableDataStore, { Filter, Subscriber, SubscribeOptions, Unsubscriber } from './readable-data-store';
import Reducer from './reducer';
import ThunkAction from './thunk-action';

export default class DataStore<TState, TAction extends Action = Action, TTransformedState = TState> implements
    ReadableDataStore<TTransformedState>, DispatchableDataStore<TTransformedState, TAction> {
    private _reducer: Reducer<TState, TAction>;
    private _options: DataStoreOptions<TState, TAction, TTransformedState>;
    private _notification$: Subject<TTransformedState>;
    private _dispatchers: { [key: string]: Dispatcher<TAction> };
    private _dispatchQueue$: Subject<Dispatcher<TAction>>;
    private _state$: BehaviorSubject<TTransformedState>;
    private _errors: { [key: string]: Subject<Error> };

    constructor(
        reducer: Reducer<TState, TAction>,
        initialState: Partial<TState> = {},
        options?: Partial<DataStoreOptions<TState, TAction, TTransformedState>>
    ) {
        this._reducer = reducer;
        this._options = {
            actionTransformer: noopActionTransformer,
            shouldWarnMutation: true,
            stateTransformer: noopStateTransformer,
            ...options,
        };
        this._state$ = new BehaviorSubject(this._options.stateTransformer(initialState as TState));
        this._notification$ = new Subject();
        this._dispatchers = {};
        this._dispatchQueue$ = new Subject();
        this._errors = {};

        this._dispatchQueue$
            .pipe(
                mergeMap(dispatcher$ => dispatcher$.pipe(concatMap(action$ => action$))),
                filter(action => !!action.type),
                scan(
                    (states: StateTuple<TState, TTransformedState>, action: TAction) =>
                        this._transformStates(states, action),
                    {
                        state: initialState as TState,
                        transformedState: this._state$.getValue(),
                    }
                ),
                map(({ transformedState }) => transformedState),
                distinctUntilChanged(isEqual)
            )
            .subscribe(this._state$);

        this.dispatch({ type: 'INIT' } as TAction);
    }

    dispatch<TDispatchAction extends TAction>(
        action: DispatchableAction<TDispatchAction, TTransformedState>,
        options?: DispatchOptions
    ): Promise<TTransformedState> {
        if (isObservableActionLike(action)) {
            return this._dispatchObservableAction(action, options);
        }

        if (typeof action === 'function') {
            return this._dispatchThunkAction(action, options);
        }

        return this._dispatchAction(action);
    }

    getState(): TTransformedState {
        return this._state$.getValue();
    }

    notifyState(): void {
        this._notification$.next(this.getState());
    }

    subscribe(subscriber: Subscriber<TTransformedState>, ...filters: Array<Filter<TTransformedState>>): Unsubscriber;
    subscribe(subscriber: Subscriber<TTransformedState>, options: SubscribeOptions<TTransformedState>): Unsubscriber;
    subscribe(subscriber: Subscriber<TTransformedState>, ...args: any[]): Unsubscriber {
        const options: SubscribeOptions<TTransformedState> = typeof args[0] === 'object' ? args[0] : undefined;
        const filters: Array<Filter<TTransformedState>> = options ? (options.filters || []) : args;

        let state$: Observable<TTransformedState> = this._state$;

        if (filters.length > 0) {
            state$ = state$.pipe(
                distinctUntilChanged((stateA, stateB) =>
                    filters.every(filterFn => isEqual(filterFn(stateA), filterFn(stateB)))
                )
            );
        }

        if (options && options.initial === false) {
            state$ = state$.pipe(skip(1));
        }

        const subscriptions = [
            state$.subscribe(subscriber),
            this._notification$.subscribe(subscriber),
        ];

        return () => subscriptions.forEach(subscription => subscription.unsubscribe());
    }

    private _transformStates(
        states: StateTuple<TState, TTransformedState>,
        action: TAction
    ): StateTuple<TState, TTransformedState> {
        try {
            const newState = this._reducer(states.state, action);
            const transformedState = this._options.shouldWarnMutation === false ?
                this._options.stateTransformer(newState) :
                this._options.stateTransformer(deepFreeze(newState));

            return { state: newState, transformedState };
        } catch (error) {
            this._getDispatchError(action.meta && action.meta.queueId).next(error);

            return { state: states.state, transformedState: states.transformedState };
        }
    }

    private _dispatchAction<TDispatchAction extends TAction>(
        action: TDispatchAction
    ): Promise<TTransformedState> {
        return this._dispatchObservableAction(
            action.error ? _throw(action) : of(action)
        );
    }

    private _dispatchObservableAction<TDispatchAction extends TAction>(
        action$: SubscribableOrPromise<TDispatchAction>,
        options: DispatchOptions = {}
    ): Promise<TTransformedState> {
        return new Promise((resolve, reject) => {
            const error$ = this._getDispatchError(options.queueId);
            const transformedAction$ = this._options.actionTransformer(
                from(action$).pipe(
                    map(action =>
                        options.queueId ?
                            merge({}, action, { meta: { queueId: options.queueId } }) :
                            action
                    )
                ) as Subscribable<TDispatchAction>
            );

            this._getDispatcher(options.queueId).next(
                from(transformedAction$)
                    .pipe(
                        map((action, index) => {
                            if (index === 0) {
                                error$.pipe(first()).subscribe(reject);
                            }

                            if (action.error) {
                                reject(action.payload);
                            }

                            return action;
                        }),
                        catchError(action => {
                            reject(action instanceof Error ? action : action.payload);

                            return of(action);
                        }),
                        tap({
                            complete: () => {
                                resolve(this.getState());
                            },
                        })
                    )
            );
        });
    }

    private _dispatchThunkAction<TDispatchAction extends TAction>(
        thunkAction: ThunkAction<TDispatchAction, TTransformedState>,
        options: DispatchOptions = {}
    ): Promise<TTransformedState> {
        return this._dispatchObservableAction(thunkAction(this), options);
    }

    private _getDispatcher(queueId: string = 'default'): Dispatcher<TAction> {
        if (!this._dispatchers[queueId]) {
            this._dispatchers[queueId] = new Subject();

            this._dispatchQueue$.next(this._dispatchers[queueId]);
        }

        return this._dispatchers[queueId];
    }

    private _getDispatchError(queueId: string = 'default'): Subject<Error> {
        if (!this._errors[queueId]) {
            this._errors[queueId] = new Subject();
        }

        return this._errors[queueId];
    }
}

export interface DataStoreOptions<TState, TAction, TTransformedState> {
    shouldWarnMutation: boolean;
    actionTransformer(action: Subscribable<TAction>): Subscribable<TAction>;
    stateTransformer(state: TState): TTransformedState;
}

interface StateTuple<TState, TTransformedState> {
    state: TState;
    transformedState: TTransformedState;
}

type Dispatcher<TAction> = Subject<Subscribable<TAction>>;

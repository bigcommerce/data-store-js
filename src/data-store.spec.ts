import { isEqual, noop } from 'lodash';
import { from, of, throwError, Observable, Observer } from 'rxjs';
import { catchError, delay, map } from 'rxjs/operators';

import Action from './action';
import DataStore from './data-store';
import ReadableDataStore from './readable-data-store';
import ThunkAction from './thunk-action';

describe('DataStore', () => {
    describe('#dispatch()', () => {
        it('dispatches actions to reducers', () => {
            const state = {};
            const reducer = jest.fn(() => state);
            const store = new DataStore(reducer, state);
            const action = { type: 'ACTION' };

            store.dispatch(action);

            expect(reducer).toHaveBeenCalledWith(state, action);
        });

        it('subscribes to observables and dispatches actions to reducers', async () => {
            const state = {};
            const reducer = jest.fn(() => state);
            const store = new DataStore(reducer, state);
            const action = from([
                { type: 'ACTION' },
                { type: 'ACTION_2' },
            ]);

            await store.dispatch(action);

            expect(reducer).toHaveBeenCalledWith(state, { type: 'ACTION' });
            expect(reducer).toHaveBeenCalledWith(state, { type: 'ACTION_2' });
        });

        it('dispatches error actions and rejects with payload', async () => {
            const store = new DataStore((state = {}) => state);
            const action = { type: 'FOOBAR', error: true, payload: 'foobar' };

            try {
                await store.dispatch(action);
            } catch (error) {
                expect(error).toEqual(action.payload);
            }
        });

        it('dispatches thunk actions', async () => {
            const thunk: ThunkAction = readableStore => of({
                payload: `${readableStore.getState().message}!!!`,
                type: 'UPDATE',
            });

            const store = new DataStore(
                (state = { message: '' }, action) => (
                    action.type === 'UPDATE' ?
                        { ...state, message: action.payload } :
                        state
                ),
                { message: 'foobar' }
            );

            expect(await store.dispatch(thunk)).toEqual({ message: 'foobar!!!' });
        });

        it('dispatches observable actions and resolves promise with current state', async () => {
            const store = new DataStore((state = { message: '' }, action) => {
                if (action.type === 'APPEND') {
                    return { ...state, message: state.message + action.payload };
                }

                return state;
            }, { message: '' });

            expect(await store.dispatch(of(
                { type: 'APPEND', payload: 'foo' },
                { type: 'APPEND', payload: 'bar' },
                { type: 'APPEND', payload: '!!!' }
            ))).toEqual({ message: 'foobar!!!' });
        });

        it('dispatches observable actions and rejects with payload', async () => {
            const store = new DataStore((state = { message: '' }) => state, { message: 'foobar' });
            const action = { type: 'APPEND_ERROR', payload: new Error('Unknown error') };

            try {
                await store.dispatch(throwError(action));
            } catch (error) {
                expect(error).toEqual(action.payload);
            }
        });

        it('dispatches observable actions and rejects with error', async () => {
            const store = new DataStore((state = { message: '' }) => state, { message: 'foobar' });
            const error = new Error('Unknown error');

            try {
                await store.dispatch(Observable.create((observer: Observer<Action>) => {
                    observer.next({ type: 'APPEND', payload: 'foo' });

                    throw error;
                }));
            } catch (caught) {
                expect(caught).toEqual(error);
            }
        });

        it('dispatches observable actions sequentially', async () => {
            const reducer = jest.fn(state => state);
            const store = new DataStore(reducer);

            reducer.mockClear();

            await Promise.all([
                store.dispatch(of({ type: 'ACTION' }).pipe(delay(10))),
                store.dispatch(of({ type: 'ACTION_2' })),
                store.dispatch(throwError({ type: 'ACTION_3', error: true })).catch(noop),
                store.dispatch(of({ type: 'ACTION_4' })),
            ]);

            expect(reducer.mock.calls).toEqual([
                [expect.anything(), { type: 'ACTION' }],
                [expect.anything(), { type: 'ACTION_2' }],
                [expect.anything(), { type: 'ACTION_3', error: true }],
                [expect.anything(), { type: 'ACTION_4' }],
            ]);
        });

        it('dispatches observable actions sequentially by tags', async () => {
            const reducer = jest.fn(state => state);
            const store = new DataStore(reducer);

            reducer.mockClear();

            await Promise.all([
                store.dispatch(of({ type: 'ACTION' }).pipe(delay(10))),
                store.dispatch(of({ type: 'ACTION_2' })),
                store.dispatch(throwError({ type: 'ACTION_3', error: true })).catch(noop),
                store.dispatch(of({ type: 'FOOBAR_ACTION' }).pipe(delay(5)), { queueId: 'foobar' }),
                store.dispatch(of({ type: 'FOOBAR_ACTION_2' }), { queueId: 'foobar' }),
                store.dispatch(of({ type: 'ACTION_4' })),
            ]);

            expect(reducer.mock.calls).toEqual([
                [expect.anything(), { type: 'FOOBAR_ACTION', meta: { queueId: 'foobar' } }],
                [expect.anything(), { type: 'FOOBAR_ACTION_2', meta: { queueId: 'foobar' } }],
                [expect.anything(), { type: 'ACTION' }],
                [expect.anything(), { type: 'ACTION_2' }],
                [expect.anything(), { type: 'ACTION_3', error: true }],
                [expect.anything(), { type: 'ACTION_4' }],
            ]);
        });

        it('dispatches thunk actions sequentially by tags', async () => {
            const reducer = jest.fn(state => state);
            const store = new DataStore(reducer, { message: 'Hello' });

            reducer.mockClear();

            await Promise.all([
                store.dispatch(
                    (readableStore: ReadableDataStore<{ message: string }>) =>
                        of({ type: 'ACTION', payload: store.getState().message }).pipe(delay(10))
                ),
                store.dispatch(() => of({ type: 'ACTION_2' })),
                store.dispatch(() => throwError({ type: 'ACTION_3', error: true })).catch(noop),
                store.dispatch(() => of({ type: 'FOOBAR_ACTION' }).pipe(delay(5)), { queueId: 'foobar' }),
                store.dispatch(() => of({ type: 'FOOBAR_ACTION_2' }), { queueId: 'foobar' }),
                store.dispatch(() => of({ type: 'ACTION_4' })),
            ]);

            expect(reducer.mock.calls).toEqual([
                [expect.anything(), { type: 'FOOBAR_ACTION', meta: { queueId: 'foobar' } }],
                [expect.anything(), { type: 'FOOBAR_ACTION_2', meta: { queueId: 'foobar' } }],
                [expect.anything(), { type: 'ACTION', payload: 'Hello' }],
                [expect.anything(), { type: 'ACTION_2' }],
                [expect.anything(), { type: 'ACTION_3', error: true }],
                [expect.anything(), { type: 'ACTION_4' }],
            ]);
        });

        it('execute thunk actions sequentially', async () => {
            const initialState = { count: 0 };
            const store = new DataStore((state = initialState, action) => {
                if (action.type === 'UPDATE') {
                    return { ...state, count: action.payload };
                }

                return state;
            }, initialState);

            const thunk = (readableStore: ReadableDataStore<{ count: number }>) => {
                const { count } = readableStore.getState();

                return of({ type: 'UPDATE', payload: count + 1 })
                    .pipe(delay(10));
            };

            await Promise.all([
                store.dispatch(thunk),
                store.dispatch(thunk),
                store.dispatch(thunk),
            ]);

            expect(store.getState()).toEqual({ count: 3 });
        });

        it('resolves promises sequentially', async () => {
            const store = new DataStore((state = {}) => state);
            const callback = jest.fn();

            await Promise.all([
                store.dispatch(of({ type: 'ACTION' }).pipe(delay(10)))
                    .then(() => callback('ACTION')),
                store.dispatch(of({ type: 'ACTION_2' }))
                    .then(() => callback('ACTION_2')),
                store.dispatch(throwError({ type: 'ACTION_3', error: true }))
                    .catch(() => callback('ACTION_3')),
                store.dispatch(of({ type: 'FOOBAR_ACTION' }).pipe(delay(5)), { queueId: 'foobar' })
                    .then(() => callback('FOOBAR_ACTION')),
                store.dispatch(of({ type: 'FOOBAR_ACTION_2' }), { queueId: 'foobar' })
                    .then(() => callback('FOOBAR_ACTION_2')),
                store.dispatch(of({ type: 'ACTION_4' }))
                    .then(() => callback('ACTION_4')),
            ]);

            expect(callback.mock.calls).toEqual([
                ['FOOBAR_ACTION'],
                ['FOOBAR_ACTION_2'],
                ['ACTION'],
                ['ACTION_2'],
                ['ACTION_3'],
                ['ACTION_4'],
            ]);
        });

        it('ignores actions that do not have `type` property', () => {
            const reducer = jest.fn(state => state);
            const store = new DataStore(reducer);

            reducer.mockClear();
            store.dispatch({ type: '' });
            store.dispatch({ type: '', payload: 'foobar' });

            expect(reducer).not.toHaveBeenCalled();
        });

        it('ignores observable actions that do not emit actions with `type` property', () => {
            const reducer = jest.fn(state => state);
            const store = new DataStore(reducer);

            reducer.mockClear();
            store.dispatch(of({ type: '', payload: 'foo' }, { type: '', payload: 'bar' }));

            expect(reducer).not.toHaveBeenCalled();
        });

        it('dispatches actions with transformer applied', () => {
            const actionTransformer = jest.fn((action$: Observable<Action>) =>
                action$.pipe(map(action => ({ ...action, payload: 'foo' })))
            );
            const reducer = jest.fn(state => state);
            const store = new DataStore(reducer, {}, { actionTransformer });

            store.dispatch({ type: 'ACTION' });

            expect(actionTransformer).toHaveBeenCalled();
            expect(reducer).toHaveBeenCalledWith(expect.anything(), { type: 'ACTION', payload: 'foo' });
        });

        it('dispatches failed actions with transformer applied', async () => {
            const actionTransformer = jest.fn((action$: Observable<Action>) =>
                action$.pipe(catchError(action => {
                    throw { ...action, payload: 'foo' };
                }))
            );
            const reducer = jest.fn(state => state);
            const store = new DataStore(reducer, {}, { actionTransformer });

            try {
                await store.dispatch({ type: 'ACTION', error: true });
            } catch (error) {
                expect(actionTransformer).toHaveBeenCalled();
                expect(reducer)
                    .toHaveBeenCalledWith(expect.anything(), { type: 'ACTION', error: true, payload: 'foo' });
                expect(error).toEqual('foo');
            }
        });
    });

    describe('#subscribe()', () => {
        it('notifies subscribers when dispatching actions', () => {
            const initialState = { foobar: 'foobar' };
            const store = new DataStore((state = { foobar: '' }) => state, initialState);
            const subscriber = jest.fn();

            store.subscribe(subscriber);
            store.dispatch({ type: 'ACTION' });

            expect(subscriber).toHaveBeenCalledWith(initialState);
        });

        it('does not notify subscribers if the current state has not changed', () => {
            const initialState = { foobar: 'foobar' };
            const store = new DataStore(
                (state = { foobar: '' }, action) => action.type === 'CAPITALIZE' ? { foobar: 'FOOBAR' } : state,
                initialState
            );
            const subscriber = jest.fn();

            store.subscribe(subscriber);
            subscriber.mockReset();
            store.dispatch({ type: 'CAPITALIZE' });
            store.dispatch({ type: 'ACTION' });

            expect(subscriber.mock.calls.length).toEqual(1);
        });

        it('does not notify subscribers if current state has shallowly changed in reference but not in value', () => {
            const store = new DataStore(
                (state = { data: { foobar: '', message: '' } }, action) => (
                    action.type === 'SHALLOW' ?
                        { ...state } :
                        { ...state, data: { ...state.data, message: action.payload } }
                ),
                { data: { foobar: 'foobar', message: '' } }
            );

            const subscriber = jest.fn();

            store.subscribe(subscriber);
            store.dispatch({ type: 'SHALLOW' });

            expect(subscriber.mock.calls.length).toEqual(1);

            store.dispatch({ type: 'DEEP', payload: 'Hello world' });

            expect(subscriber.mock.calls.length).toEqual(2);
        });

        it('can be configured to notify subscribers if current state has deeply changed in reference', () => {
            const store = new DataStore(
                (state = { data: { foobar: '' } }, action) => (
                    action.type === 'SHALLOW' ? { ...state } : { ...state, data: { ...state.data } }
                ),
                { data: { foobar: 'foobar' } },
                { equalityCheck: isEqual }
            );

            const subscriber = jest.fn();

            store.subscribe(subscriber);
            store.dispatch({ type: 'SHALLOW' });

            expect(subscriber.mock.calls.length).toEqual(1);

            store.dispatch({ type: 'DEEP' });

            expect(subscriber.mock.calls.length).toEqual(1);
        });

        it('notifies subscribers with the tranformed state', () => {
            const initialState = { foobar: 'foobar' };
            const store = new DataStore(
                (state = { foobar: '' }, action) => action.type === 'CAPITALIZE' ? { foobar: 'FOOBAR' } : state,
                initialState,
                {
                    stateTransformer: state => ({ ...state, transformed: true }),
                }
            );
            const subscriber = jest.fn();

            store.subscribe(subscriber);
            store.dispatch({ type: 'CAPITALIZE' });

            expect(subscriber).toHaveBeenCalledWith({
                foobar: 'FOOBAR',
                transformed: true,
            });
        });

        it('does not notify subscribers if only transformed state changes', () => {
            const initialState = { foobar: 'foobar' };
            const store = new DataStore(
                (state = { foobar: '' }, action) => state,
                initialState,
                {
                    stateTransformer: state => ({ ...state, transformed: Math.random() }),
                }
            );
            const subscriber = jest.fn();

            store.subscribe(subscriber);
            subscriber.mockReset();

            store.dispatch({ type: 'ACTION' });

            expect(subscriber).not.toHaveBeenCalled();
        });

        it('notifies all subscribers with the initial state', () => {
            const store = new DataStore((state = {}) => state);
            const subscriber = jest.fn();

            store.subscribe(subscriber);

            expect(subscriber).toHaveBeenCalledWith(store.getState());
        });

        it('skips the initial notification', () => {
            const initialState = { foobar: 'foobar' };
            const store = new DataStore(
                (state = { foobar: '' }, action) => action.type === 'CAPITALIZE' ? { foobar: 'FOOBAR' } : state,
                initialState
            );
            const subscriber = jest.fn();

            store.subscribe(subscriber, { initial: false });
            store.dispatch({ type: 'CAPITALIZE' });

            expect(subscriber).toHaveBeenCalledTimes(1);
        });

        it('only notifies subscribers when `filter` condition is met', () => {
            const store = new DataStore((state = { foo: '', bar: '' }, action) => {
                switch (action.type) {
                case 'FOO':
                    return { ...state, foo: 'foo' };

                case 'FOO_CAPITALIZED':
                    return { ...state, foo: 'FOO' };

                case 'BAR':
                    return { ...state, bar: 'bar' };

                default:
                    return state;
                }
            }, { foo: '', bar: '' });
            const subscriber = jest.fn();

            store.subscribe(subscriber, state => state.foo);
            subscriber.mockReset();

            store.dispatch({ type: 'FOO' });
            store.dispatch({ type: 'FOO' });
            store.dispatch({ type: 'BAR' });
            store.dispatch({ type: 'FOO_CAPITALIZED' });
            store.dispatch({ type: 'FOO' });

            expect(subscriber).toHaveBeenCalledTimes(3);
        });

        it('only notifies subscribers when multiple `filter` conditions are met', () => {
            const initialState = { foo: '', bar: '', foobar: '' };
            const store = new DataStore((state = initialState, action) => {
                switch (action.type) {
                case 'FOO':
                    return { ...state, foo: 'foo' };

                case 'BAR':
                    return { ...state, bar: 'bar' };

                case 'FOOBAR':
                    return { ...state, foobar: 'foobar' };

                case 'FOO_AND_BAR':
                    return { ...state, foo: 'FOO', bar: 'BAR' };

                default:
                    return state;
                }
            }, initialState);
            const subscriber = jest.fn();

            store.subscribe(
                subscriber, state => state.foo, state => state.bar
            );
            subscriber.mockReset();

            store.dispatch({ type: 'FOO' });
            store.dispatch({ type: 'FOO' });
            store.dispatch({ type: 'BAR' });
            store.dispatch({ type: 'FOOBAR' });
            store.dispatch({ type: 'FOOBAR' });
            store.dispatch({ type: 'FOO_AND_BAR' });

            expect(subscriber).toHaveBeenCalledTimes(3);
        });

        it('notifies subscribers sequentially', async () => {
            const initialState = { message: '' };
            const store = new DataStore((state = initialState, action) => {
                if (action.type === 'APPEND') {
                    return { ...state, message: `${state.message}${action.payload}` };
                }

                return state;
            }, initialState);
            const subscriber = jest.fn();

            store.subscribe(subscriber);

            await Promise.all([
                store.dispatch(
                    from([{ type: 'APPEND', payload: 'foo' }, { type: 'APPEND', payload: 'bar' }]).pipe(delay(10))
                ),
                store.dispatch(
                    from([{ type: 'APPEND', payload: '!!!' }]).pipe(delay(1))
                ),
            ]);

            expect(subscriber.mock.calls).toEqual([
                [{ message: '' }],
                [{ message: 'foo' }],
                [{ message: 'foobar' }],
                [{ message: 'foobar!!!' }],
            ]);
        });

        it('notifies subscribers sequentially by tags', async () => {
            const initialState = { message: '' };
            const store = new DataStore((state = initialState, action) => {
                if (action.type === 'APPEND') {
                    return { ...state, message: `${state.message}${action.payload}` };
                }

                return state;
            }, initialState);
            const subscriber = jest.fn();

            store.subscribe(subscriber);

            await Promise.all([
                store.dispatch(
                    from([{ type: 'APPEND', payload: 'foo' }, { type: 'APPEND', payload: 'bar' }]).pipe(delay(10))
                ),
                store.dispatch(
                    from([{ type: 'APPEND', payload: '!!!' }]).pipe(delay(5))
                ),
                store.dispatch(
                    from([{ type: 'APPEND', payload: 'Hey' }]).pipe(delay(1)), { queueId: 'greeting' }
                ),
                store.dispatch(
                    from([{ type: 'APPEND', payload: ', ' }]), { queueId: 'greeting' }
                ),
            ]);

            expect(subscriber.mock.calls).toEqual([
                [{ message: '' }],
                [{ message: 'Hey' }],
                [{ message: 'Hey, ' }],
                [{ message: 'Hey, foo' }],
                [{ message: 'Hey, foobar' }],
                [{ message: 'Hey, foobar!!!' }],
            ]);
        });

        it('calls the reducer with the initial action', async () => {
            const initialState = { foobar: 'foobar' };
            const reducer = jest.fn(state => state);
            const store = new DataStore(reducer, initialState);

            await new Promise(resolve => store.subscribe(resolve));

            expect(reducer).toHaveBeenCalledWith(initialState, { type: 'INIT' });
        });

        it('returns an unsubscribe function', () => {
            const initialState = { foobar: 'foobar' };
            const store = new DataStore((state = initialState) => state, initialState);
            const subscriber = jest.fn();
            const unsubscribe = store.subscribe(subscriber);

            unsubscribe();
            subscriber.mockReset();
            store.dispatch({ type: 'ACTION' });

            expect(subscriber).not.toHaveBeenCalledWith(initialState);
        });

        it('catches reducer error and keeps subscription alive', async () => {
            const subscriber = jest.fn();
            const initialState = { count: 1 };
            const store = new DataStore(
                (state = initialState, action) => {
                    if (action.type === 'INCREMENT') {
                        return { count: state.count + 1 };
                    } else if (action.type === 'DECREMENT') {
                        throw new Error('Reducer error');
                    }

                    return state;
                },
                initialState
            );

            store.subscribe(subscriber);
            expect.assertions(3);

            await store.dispatch(of({ type: 'DECREMENT' }))
                .catch((error: any) => expect(error).toBeInstanceOf(Error));

            await store.dispatch(of({ type: 'INCREMENT' }));

            expect(subscriber).toHaveBeenCalledTimes(2);
            expect(subscriber).toHaveBeenLastCalledWith({ count: 2 });
        });

        it('catches state transformation error and keeps subscription alive', async () => {
            const subscriber = jest.fn();
            const initialState = { count: 1 };
            const store = new DataStore(
                (state = initialState, action) => {
                    if (action.type === 'INCREMENT') {
                        return { count: state.count + 1 };
                    }

                    if (action.type === 'DECREMENT') {
                        return { count: state.count - 1 };
                    }

                    return state;
                },
                initialState,
                {
                    stateTransformer: state => {
                        if (state.count === 2) {
                            throw new Error('Transformation error');
                        }

                        return state;
                    },
                }
            );

            store.subscribe(subscriber);
            expect.assertions(3);

            await store.dispatch(of({ type: 'INCREMENT' }))
                .catch((error: any) => expect(error).toBeInstanceOf(Error));

            await store.dispatch(of({ type: 'DECREMENT' }));

            expect(subscriber).toHaveBeenCalledTimes(2);
            expect(subscriber).toHaveBeenCalledWith({ count: 0 });
        });
    });

    describe('#notifyState()', () => {
        it('notifies subscribers of its current state', () => {
            const initialState = { foobar: 'foobar' };
            const store = new DataStore((state = initialState) => state, initialState);
            const subscriber = jest.fn();

            store.subscribe(subscriber);
            store.notifyState();

            expect(subscriber).toHaveBeenLastCalledWith({ foobar: 'foobar' });
            expect(subscriber).toHaveBeenCalledTimes(2);
        });

        it('notifies subscribers with filters of its current state', () => {
            const initialState = { foobar: 'foobar' };
            const store = new DataStore((state = initialState) => state, initialState);
            const subscriber = jest.fn();

            store.subscribe(subscriber, state => state.foobar);
            store.notifyState();

            expect(subscriber).toHaveBeenLastCalledWith({ foobar: 'foobar' });
            expect(subscriber).toHaveBeenCalledTimes(2);
        });
    });

    describe('#getState()', () => {
        it('returns the current state', () => {
            const initialState = { foobar: 'foobar' };
            const store = new DataStore((state = initialState, action) => {
                if (action.type === 'INCREMENT') {
                    return { foobar: 'foobar x2' };
                }

                return state;
            }, initialState);

            expect(store.getState()).toEqual(initialState);

            store.dispatch({ type: 'INCREMENT' });

            expect(store.getState()).toEqual({ foobar: 'foobar x2' });
        });

        it('does not return different reference if values are equal after reduction', () => {
            const initialState = { foobar: 'foobar' };
            const store = new DataStore((state = initialState) => ({ ...state }), initialState);

            const oldState = store.getState();

            store.dispatch({ type: 'ACTION' });

            expect(store.getState()).toBe(oldState);
        });

        it('applies the state transformer before returning the current state', () => {
            const initialState = { foobar: 'foobar' };
            const store = new DataStore(
                (state = initialState, action) => action.type === 'INCREMENT' ? { foobar: 'foobar x2' } : state,
                initialState,
                {
                    stateTransformer: state => ({ ...state, transformed: true }),
                }
            );

            expect(store.getState()).toEqual({
                foobar: 'foobar',
                transformed: true,
            });

            store.dispatch({ type: 'INCREMENT' });

            expect(store.getState()).toEqual({
                foobar: 'foobar x2',
                transformed: true,
            });
        });

        it('warns if mutating returned state', () => {
            const initialState = { name: 'Foo' };
            const store = new DataStore((state = initialState) => state, initialState);
            const currentState = store.getState();

            expect(() => { currentState.name = 'Bar'; }).toThrow();
        });

        it('does not warn if mutating state returned from mutable store', () => {
            const initialState = { name: 'Foo' };
            const store = new DataStore((state = initialState) => state, initialState, { shouldWarnMutation: false });
            const currentState = store.getState();

            expect(() => { currentState.name = 'Bar'; }).not.toThrow();
        });
    });
});

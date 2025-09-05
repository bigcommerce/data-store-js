import composeReducers from './compose-reducers';
import Reducer from './reducer';

describe('composeReducers()', () => {
    const fooReducer: Reducer<string> = (state = '', action) => {
        switch (action.type) {
        case 'FOO':
            return 'foo';

        case 'APPEND':
            return `${state}foo`;

        default:
            return state;
        }
    };

    const barReducer: Reducer<string> = (state = '', action) => {
        switch (action.type) {
        case 'BAR':
            return 'bar';

        case 'APPEND':
            return `${state}bar`;

        default:
            return state;
        }
    };

    it('composes multiple reducers', () => {
        const reducer = composeReducers(barReducer, fooReducer);
        const initialState = '';

        expect(reducer(initialState, { type: 'FOO' })).toEqual('foo');
        expect(reducer(initialState, { type: 'BAR' })).toEqual('bar');
        expect(reducer(initialState, { type: 'HELLO' })).toEqual('');
    });

    it('composes reducers from the right', () => {
        const reducer = composeReducers(barReducer, fooReducer);
        const initialState = '';

        expect(reducer(initialState, { type: 'APPEND' })).toEqual('foobar');
    });

    it('composes reducers that handle different input type', () => {
        const reducer = composeReducers(
            barReducer,
            fooReducer,
            (state: string | number, action) => typeof state === 'string' ? state : `${state}`
        );
        const initialState = 123;

        expect(reducer(initialState, { type: 'APPEND' })).toEqual('123foobar');
    });

    it('returns new instance only if different in value', () => {
        const reducer = composeReducers(
            (state, action) => action.type === 'UPDATE' ? { name: action.payload } : { ...state },
            (state, action) => action.type === 'UPDATE' ? { name: action.payload } : { ...state }
        );
        const initialState = { name: 'FOO' };

        expect(reducer(initialState, { type: 'NOOP' })).toBe(initialState);
        expect(reducer(initialState, { type: 'UPDATE', payload: 'Hello' })).not.toBe(initialState);
    });

    it('composes multiple reducers without argument length', () => {
        const fooReducerWithArgs = (...args: any[]) => {
            const state = args[0];
            const action = args[1];

            switch (action.type) {
            case 'FOO':
                return 'foo';

            case 'APPEND':
                return `${state}foo`;

            default:
                return state;
            }
        };

        const barReducerWithArgs = (...args: any[]) => {
            const state = args[0];
            const action = args[1];

            switch (action.type) {
            case 'BAR':
                return 'bar';

            case 'APPEND':
                return `${state}bar`;

            default:
                return state;
            }
        };

        const reducer = composeReducers(barReducerWithArgs, fooReducerWithArgs);
        const initialState = '';

        expect(reducer(initialState, { type: 'FOO' })).toEqual('foo');
        expect(reducer(initialState, { type: 'BAR' })).toEqual('bar');
        expect(reducer(initialState, { type: 'HELLO' })).toEqual('');
    });
});

import combineReducers from './combine-reducers';

describe('combineReducers()', () => {
    it('combines multiple reducers into one', () => {
        const fooReducer = jest.fn(() => 'foo');
        const barReducer = jest.fn(() => 'bar');
        const state = { foo: 'FOO', bar: 'BAR' };
        const action = { type: 'ACTION' };

        const reducer = combineReducers<{ foo: string, bar: string }>({
            foo: fooReducer,
            bar: barReducer,
        });

        expect(reducer(state, action)).toEqual({
            foo: 'foo',
            bar: 'bar',
        });
        expect(fooReducer).toHaveBeenCalledWith(state.foo, action);
        expect(barReducer).toHaveBeenCalledWith(state.bar, action);
    });

    it('returns new instance only if different in value', () => {
        const state = { foo: { name: 'FOO' }, bar: { name: 'BAR' } };
        const reducer = combineReducers({
            foo: (state, action) => action.type === 'UPDATE' ? { name: action.payload } : { ...state },
            bar: (state) => ({ ...state }),
        });

        expect(reducer(state, { type: 'NOOP' })).toBe(state);
        expect(reducer(state, { type: 'UPDATE', payload: 'Hello' })).not.toBe(state);
        expect(reducer(state, { type: 'UPDATE', payload: 'Hello' }).bar).toBe(state.bar);
    });
});

import combineReducers from './combine-reducers';

describe('combineReducers()', () => {
    it('combines multiple reducers into one', () => {
        const fooReducer = jest.fn(() => 'foo');
        const barReducer = jest.fn(() => 'bar');
        const state = { foo: 'FOO', bar: 'BAR' };
        const action = { type: 'ACTION' };

        const reducer = combineReducers<{ foo: string, bar: string }>({
            bar: barReducer,
            foo: fooReducer,
        });

        expect(reducer(state, action)).toEqual({
            bar: 'bar',
            foo: 'foo',
        });

        expect(fooReducer).toHaveBeenCalledWith(state.foo, action);
        expect(barReducer).toHaveBeenCalledWith(state.bar, action);
    });

    it('returns new instance only if different in value', () => {
        const state = { foo: { name: 'FOO' }, bar: { name: 'BAR' } };
        const reducer = combineReducers({
            bar: bar => ({ ...bar }),
            foo: (foo, action) => action.type === 'UPDATE' ? { name: action.payload } : { ...foo },
        });

        expect(reducer(state, { type: 'NOOP' })).toBe(state);
        expect(reducer(state, { type: 'UPDATE', payload: 'Hello' })).not.toBe(state);
        expect(reducer(state, { type: 'UPDATE', payload: 'Hello' }).bar).toBe(state.bar);
    });
});

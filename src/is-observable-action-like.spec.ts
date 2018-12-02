import { of } from 'rxjs';

import createAction from './create-action';
import isObservableActionLike from './is-observable-action-like';

describe('isObservableActionLike()', () => {
    it('returns true if observable action', () => {
        expect(isObservableActionLike(of(createAction('FOOBAR'))))
            .toEqual(true);
    });

    it('returns true if promise-like action', () => {
        expect(isObservableActionLike(Promise.resolve(createAction('FOOBAR'))))
            .toEqual(true);
    });

    it('returns false if not observable action or promise-like action', () => {
        expect(isObservableActionLike(createAction('FOOBAR')))
            .toEqual(false);
    });
});

import createDataStore from './create-data-store';
import DataStore from './data-store';

describe('createDataStore()', () => {
    it('creates data store', () => {
        const store = createDataStore((state) => state);

        expect(store).toBeInstanceOf(DataStore);
    });
});

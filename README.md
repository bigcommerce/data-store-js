# @bigcommerce/data-store

[![Build Status](https://travis-ci.com/bigcommerce/data-store-js.svg?token=pywwZy8zX1F5AzeQ9WpL&branch=master)](https://travis-ci.com/bigcommerce/data-store-js)

A JavaScript library for managing application state.

It helps you to enforce unidirectional data flow in your application, by allowing you to:
* Subscribe to changes to the application state
* Update the state in a serial and immutable fashion


## Install

You can install this library using [npm](https://www.npmjs.com/get-npm).

```sh
npm install --save @bigcommerce/data-store
```


## Requirements

This library requires [Promise polyfill](https://github.com/stefanpenner/es6-promise) if you need to support older browsers, such as IE11.

You may need to create Observables when using this library (please refer to the usage section). We recommend you to use [rxjs](https://github.com/ReactiveX/rxjs) until the time comes when you can create them natively.


## Usage

### Create a store

```js
import { createDataStore } from '@bigcommerce/data-store';

const reducer = (state, action) => {
    switch (action.type) {
    case 'INCREMENT':
        return { ...state, count: state.count + 1 };

    case 'UPDATE_COUNT':
        return { ...state, count: action.payload };

    default:
        return state;
    }
};

const initialState = { count: 0 };
const store = createDataStore(reducer, initialState);
```

### To update the current state

```js
import { createAction } from '@bigcommerce/data-store';

store.dispatch(createAction('INCREMENT'));
store.dispatch(createAction('UPDATE_COUNT', 10)));
```

To update the state asynchronously, you need to create an observable that emits actions:

```js
import { Observable } from 'rxjs';

const action$ = Observable
    .ajax({ url: '/count' })
    .map(({ response }) => createAction('UPDATE_COUNT', response.count))

store.dispatch(action$);
```

To avoid race condition, actions get dispatched in a series unless you specify a different dispatch queue, i.e.:

```js
store.dispatch(action$);
store.dispatch(action$);

// The following call does not wait for the previous calls
store.dispatch(action$, { queueId: 'foobar' });
```

Wrap the observable in a closure if you want to access the store elsewhere but don't have direct access to it (i.e.: inside an action creator):

```js
// In an action creator
function updateAction() {
    return (store) => Observable
        .ajax({ url: '/count' })
        .map(({ response }) => {
            const { count } = store.getState();

            return createAction('UPDATE_COUNT', count + response.count);
        });
}
```

```js
// In a component
store.dispatch(updateAction());
```

To do something after an asynchronous dispatch:

```js
const { state } = await store.dispatch(action$);

console.log(state);
```

### To subscribe to changes

To changes and render the latest data:

```js
store.subscribe((state) => {
    console.log(state);
});
```

The subscriber will get triggered once when it is first subscribed. And it won't get triggered unless there's a data change.

To filter out irrelevant changes:

```js
// Only trigger the subscriber if `count` changes
store.subscribe(
    (state) => { console.log(state); },
    (state) => state.count
);
```

### To transform states and actions

To transform the return value of `getState` or parameter value of `subscribe`:

```js
const stateTransformer = (state) => ({ ...state, transformed: true });
const store = createDataStore(reducer, initialState, { stateTransformer });

console.log(store.getState()); // { count: 0, transformed: true }
```

To transform dispatched actions:

```js
const actionTransformer = (action) => ({ ...action, transformed: true });
const store = createDataStore(reducer, initialState, { actionTransformer });

console.log(store.dispatch(createAction('INCREMENT'))); // { type: 'INCREMENT', transformed: true }
```


## Contribution

To release:

```sh
npm run release
```

To see other available commands:

```sh
npm run
```

## License

MIT

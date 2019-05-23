# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

<a name="0.2.7"></a>
## [0.2.7](https://github.com/bigcommerce/data-store-js/compare/v0.2.6...v0.2.7) (2019-05-23)


### Bug Fixes

* **core:** CHECKOUT-4137 Catch error if unable to freeze or perform check ([a4d9ea6](https://github.com/bigcommerce/data-store-js/commit/a4d9ea6))



<a name="0.2.6"></a>
## [0.2.6](https://github.com/bigcommerce/data-store-js/compare/v0.2.5...v0.2.6) (2019-01-08)


### Bug Fixes

* **core:** CHECKOUT-3790 Allow `composeReducers` function to accept reducers of different type ([d66d0f4](https://github.com/bigcommerce/data-store-js/commit/d66d0f4))
* **core:** CHECKOUT-3790 Ensure reducers have the expected signature before composing them ([8b7f3a9](https://github.com/bigcommerce/data-store-js/commit/8b7f3a9))



<a name="0.2.5"></a>
## [0.2.5](https://github.com/bigcommerce/data-store-js/compare/v0.2.4...v0.2.5) (2018-12-03)


### Bug Fixes

* **core:** CHECKOUT-3135 Upgrade Rx to version 6 to bring in various performance improvements and features ([6849133](https://github.com/bigcommerce/data-store-js/commit/6849133))



<a name="0.2.4"></a>
## [0.2.4](https://github.com/bigcommerce/data-store-js/compare/v0.2.3...v0.2.4) (2018-11-15)


### Bug Fixes

* **core:** CHECKOUT-3462 Execute thunk actions sequentially ([5224e69](https://github.com/bigcommerce/data-store-js/commit/5224e69))



<a name="0.2.3"></a>
## [0.2.3](https://github.com/bigcommerce/data-store-js/compare/v0.2.2...v0.2.3) (2018-09-21)


### Bug Fixes

* **core:** CHECKOUT-3475 Export missing interfaces ([56ca1a3](https://github.com/bigcommerce/data-store-js/commit/56ca1a3))



<a name="0.2.2"></a>
## [0.2.2](https://github.com/bigcommerce/data-store-js/compare/v0.2.1...v0.2.2) (2018-08-23)


### Bug Fixes

* **common:** CHECKOUT-3462 Remove Node engine field ([3c034ce](https://github.com/bigcommerce/data-store-js/commit/3c034ce))



<a name="0.2.1"></a>
## [0.2.1](https://github.com/bigcommerce/data-store-js/compare/v0.2.0...v0.2.1) (2018-08-07)



<a name="0.2.0"></a>
# [0.2.0](https://github.com/bigcommerce/data-store-js/compare/v0.1.8...v0.2.0) (2018-08-07)


### Bug Fixes

* **core:** CHECKOUT-3011 Don't trigger subscribers if only transformed state changes ([f99d186](https://github.com/bigcommerce/data-store-js/commit/f99d186))


### Features

* **core:** CHECKOUT-3011 Skip initial subscriber notification ([2869178](https://github.com/bigcommerce/data-store-js/commit/2869178))



<a name="0.1.8"></a>
## [0.1.8](https://github.com/bigcommerce/data-store-js/compare/v0.1.7...v0.1.8) (2018-05-27)


### Bug Fixes

* **common:** CHECKOUT-3191 Fix sourcemaps by enabling `inlineSources` ([3b85d78](https://github.com/bigcommerce/data-store-js/commit/3b85d78))



<a name="0.1.7"></a>
## [0.1.7](https://github.com/bigcommerce/data-store-js/compare/v0.1.6...v0.1.7) (2018-05-14)



<a name="0.1.6"></a>
## [0.1.6](https://github.com/bigcommerce/data-store-js/compare/v0.1.5...v0.1.6) (2018-05-14)


### Bug Fixes

* **core:** CHECKOUT-3053 Fix issue related to error action not able to dispatch ([443c300](https://github.com/bigcommerce/data-store-js/commit/443c300))
* **core:** CHECKOUT-3053 More permissive default action type ([7b8e2ad](https://github.com/bigcommerce/data-store-js/commit/7b8e2ad))



<a name="0.1.5"></a>
## [0.1.5](https://github.com/bigcommerce/data-store-js/compare/v0.1.4...v0.1.5) (2018-05-10)



<a name="0.1.4"></a>
## [0.1.4](https://github.com/bigcommerce/data-store-js/compare/v0.1.3...v0.1.4) (2018-05-07)


### Bug Fixes

* **core:** CHECKOUT-3053 Export `Reducer` and `ReducerMap` interfaces ([d33d91c](https://github.com/bigcommerce/data-store-js/commit/d33d91c))
* **core:** CHECKOUT-3053 Fix type definition for `actionTransformer` option. Use `Subscribable` interface instead. ([53fc40e](https://github.com/bigcommerce/data-store-js/commit/53fc40e))



<a name="0.1.3"></a>
## [0.1.3](https://github.com/bigcommerce/data-store-js/compare/v0.1.2...v0.1.3) (2018-03-26)


### Bug Fixes

* **core:** CHECKOUT-3027 Fix thunk actions not getting dispatched in separate queues ([8a0f758](https://github.com/bigcommerce/data-store-js/commit/8a0f758))



<a name="0.1.2"></a>
## [0.1.2](https://github.com/bigcommerce/data-store-js/compare/v0.1.1...v0.1.2) (2018-03-20)


### Bug Fixes

* **core:** CHECKOUT-3007 Change `ThunkAction` return type to `SubscribableOrPromise` instead of concrete `Observable` type ([fa090e9](https://github.com/bigcommerce/data-store-js/commit/fa090e9))
* **core:** CHECKOUT-3007 Set default type for `ThunkAction` ([cbd7bdc](https://github.com/bigcommerce/data-store-js/commit/cbd7bdc))



<a name="0.1.1"></a>
## [0.1.1](https://github.com/bigcommerce/data-store-js/compare/v0.1.0...v0.1.1) (2018-03-13)


### Bug Fixes

* **core:** CHECKOUT-2450 Fix `Reducer` and `Action` type definition ([07f9baf](https://github.com/bigcommerce/data-store-js/commit/07f9baf))
* **core:** CHECKOUT-2992 `combineReducers` and `composeReducers` should only return new instance if different in value ([c4e416b](https://github.com/bigcommerce/data-store-js/commit/c4e416b))



<a name="0.1.0"></a>
# 0.1.0 (2018-03-01)


### Bug Fixes

* **core:** CHECKOUT-2450 Create new observable from observable-like action ([07aaed5](https://github.com/bigcommerce/data-store-js/commit/07aaed5))
* **core:** CHECKOUT-2450 Mark options as optional ([cbe8631](https://github.com/bigcommerce/data-store-js/commit/cbe8631))


### Features

* **core:** CHECKOUT-2450 Add `DataStore` module ([4fabb82](https://github.com/bigcommerce/data-store-js/commit/4fabb82))

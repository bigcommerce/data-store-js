"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isObservableActionLike(action) {
    return (typeof action.subscribe === 'function' ||
        typeof action.then === 'function');
}
exports.default = isObservableActionLike;
//# sourceMappingURL=is-observable-action-like.js.map
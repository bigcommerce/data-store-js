import { omitBy } from 'lodash';

import Action from './action';

export default function createAction<TPayload, TMeta, TType extends string>(
    type: TType,
    payload?: TPayload,
    meta?: TMeta
): Action<TPayload, TMeta, TType> {
    if (typeof type !== 'string' || type === '') {
        throw new Error('`type` must be a string');
    }

    return { type, ...omitBy({ payload, meta }, (value) => value === undefined) };
}

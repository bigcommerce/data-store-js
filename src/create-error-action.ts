import Action from './action';
import createAction from './create-action';

export default function createErrorAction<TPayload, TMeta, TType extends string>(
    type: TType,
    payload?: TPayload,
    meta?: TMeta
): Action<TPayload, TMeta, TType> {
    return {
        ...createAction(type, payload, meta),
        error: true,
    };
}

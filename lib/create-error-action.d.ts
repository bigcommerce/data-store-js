import Action from './action';
export default function createErrorAction<TPayload, TMeta>(type: string, payload?: TPayload, meta?: TMeta): Action<TPayload, TMeta>;

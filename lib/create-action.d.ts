import Action from './action';
export default function createAction<TPayload, TMeta>(type: string, payload?: TPayload, meta?: TMeta): Action<TPayload, TMeta>;

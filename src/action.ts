export default interface Action<TPayload = any, TMeta = any, TType = any> {
    type: TType;
    error?: boolean;
    meta?: TMeta;
    payload?: TPayload;
}

export default interface Action<TPayload = any, TMeta = any, TType extends string = string> {
    type: TType;
    error?: boolean;
    meta?: TMeta;
    payload?: TPayload;
}

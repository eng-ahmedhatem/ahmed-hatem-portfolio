export type AwaitedReturn<T> = T extends (...args: infer _Arguments) => infer Result
  ? Awaited<Result>
  : never;

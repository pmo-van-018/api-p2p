// https://stackoverflow.com/questions/59623524/typescript-how-to-map-type-keys-to-camelcase#answer-66819291
export type CamelCase<S extends string> =
  S extends `${infer P1}_${infer P2}${infer P3}`
    ? `${Lowercase<P1>}${Uppercase<P2>}${CamelCase<P3>}`
    : Lowercase<S>;

export type ObjectToCamel<T> = {
  [K in keyof T as CamelCase<string & K>]: T[K] extends Record<string, any>
    ? KeysToCamelCase<T[K]>
    : T[K];
};

export type KeysToCamelCase<T> = {
  [K in keyof T as CamelCase<string & K>]: T[K] extends Array<any>
    ? KeysToCamelCase<T[K][number]>[]
    : ObjectToCamel<T[K]>;
};

export interface EnvironmentVariables {
  MAX_USER_CREDENTIAL: number;
  API_URL: string;
  BLOCKCHAIN_VCHAIN_RPC_URL: string;
  LOGIN_TARGET: number;
  CREATE_POST_TARGET: number;
  SEARCH_POST_TARGET: number;
  CREATE_ORDER_TARGET: number;
  CREATE_GROUP_CHAT_TARGET: number;
  LIST_ONLINE_POST_TARGET: number;
  SCRIPTS: string[];
}

export type PartialEnvironmentVariables = Partial<EnvironmentVariables>;

export interface ConfigOptions
  extends KeysToCamelCase<PartialEnvironmentVariables> {}

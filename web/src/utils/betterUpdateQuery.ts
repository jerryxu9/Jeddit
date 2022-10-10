import { Cache, QueryInput } from "@urql/exchange-graphcache";

// Wrapper function to resolve cache exchange type issue by properly casting the types. Using generic types
export function betterUpdateQuery<Result, Query>(
  cache: Cache,
  qi: QueryInput,
  result: any,
  fn: (r: Result, q: Query) => Query
) {
  return cache.updateQuery(qi, (data) => fn(result, data as any) as any);
}

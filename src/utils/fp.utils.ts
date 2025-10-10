export const all =
  (...predicates) =>
  (...args) =>
    predicates.every((predicate) => predicate(...args));

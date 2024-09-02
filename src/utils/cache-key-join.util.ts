export const joinCacheKey = (...segment: string[]) => {
  return [...segment].join("");
};

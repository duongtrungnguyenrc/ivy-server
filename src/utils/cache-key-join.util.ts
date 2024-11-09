export const joinCacheKey = (...segment: string[]) => {
  return [...segment].filter((key) => !!key).join(":");
};

export function calcExcludedStats(
  excludedCount = 0,
  stats: { count: number }[] = [],
): { totalCount: number; excludedPercentage: number; tracksLeft: number } {
  if (isNaN(excludedCount) || excludedCount < 0 || !isFinite(excludedCount)) {
    excludedCount = 0;
  }
  if (!Number.isInteger(excludedCount)) {
    throw new Error("excludedCount should be an integer");
  }

  const totalCount = stats.reduce(
    (accumulator, currentValue) => accumulator + currentValue.count,
    0,
  );

  const tracksLeft = totalCount - excludedCount;

  return {
    totalCount,
    excludedPercentage:
      totalCount === 0 && excludedCount === 0
        ? 0
        : Number(((100 * excludedCount) / totalCount).toFixed(1)),
    tracksLeft,
  };
}

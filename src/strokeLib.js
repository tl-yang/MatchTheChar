export const strokeOrderMatch = (strokesA, templateRank) => {
  if (strokesA.length !== templateRank.strokeCount)
    return false;
  const arrayCompare = (a, b) => {
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  };
  const aXStartRank = fuzzyRank(strokesA.map(el => el.start.x));
  const aYStartRank = fuzzyRank(strokesA.map(el => el.start.y));
  if (!arrayCompare(aXStartRank, templateRank.xStart) &&
    arrayCompare(aYStartRank, templateRank.yStart))
    return false;
  const aXEndRank = fuzzyRank(strokesA.map(el => el.end.x));
  const aYEndRank = fuzzyRank(strokesA.map(el => el.end.y));
  return arrayCompare(aXEndRank, templateRank.xEnd) &&
    arrayCompare(aYEndRank, templateRank.yEnd)

};

export const getStrokeOrder = (strokes) => {
  const xStartRank = fuzzyRank(strokes.map(el => el.start.x));
  const yStartRank = fuzzyRank(strokes.map(el => el.start.y));
  const xEndRank = fuzzyRank(strokes.map(el => el.end.x));
  const yEndRank = fuzzyRank(strokes.map(el => el.end.y));
  return {xStart: xStartRank, yStart: yStartRank, xEnd: xEndRank, yEnd: yEndRank};
};

const fuzzyRank = (toRank, threshold = 10) => {
  let rank = Array(toRank.length).fill(0);
  if (toRank.size === 0)
    return rank;
  if (toRank.size === 1)
    return rank;
  const sorted = toRank.map((el, i) => ({index: i, value: el}));
  sorted.sort((a, b) => a.value < b.value ? -1 : 1);
  let curRank = 0;
  for (let i = 1; i < sorted.length; i++) {
    if (Math.abs(sorted[i].value - sorted[i - 1].value) > threshold) {
      ++curRank;
    }
    rank[sorted[i].index] = curRank;
  }
  return rank;
};

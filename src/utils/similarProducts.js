function scoreSimilarity(base, other, baseTags) {
  let score = 0;

  if (other.category === base.category) score += 3;
  if (base.brand && other.brand === base.brand) score += 2;

  for (const tag of other.tags ?? []) {
    if (baseTags.has(tag)) score += 1;
  }

  if (base.price > 0) {
    const priceDiff = Math.abs(other.price - base.price) / base.price;
    if (priceDiff <= 0.2) score += 2;
    else if (priceDiff <= 0.5) score += 1;
  }

  return score;
}

export function getSimilarProducts(product, candidates = [], limit = 6) {
  if (!product) return [];

  const baseTags = new Set(product.tags ?? []);

  return candidates
    .filter((candidate) => candidate.id !== product.id)
    .map((candidate) => ({
      candidate,
      score: scoreSimilarity(product, candidate, baseTags),
    }))
    .sort(
      (a, b) => b.score - a.score || b.candidate.rating - a.candidate.rating,
    )
    .slice(0, limit)
    .map(({ candidate }) => candidate);
}

// ... rest of the imports remain the same ...

async batchAnalyzeKeywords(
  keywords: Array<{ keyword: string; volume: number }>,
  onProgress?: (progress: number) => void
): Promise<Record<string, SerpAnalysisResult>> {
  // Filter keywords by volume first
  const eligibleKeywords = keywords.filter(kw => kw.volume > 0 && kw.volume <= 250);
  
  if (eligibleKeywords.length === 0) {
    toast.info('No keywords eligible for KGR analysis (volume must be ≤ 250)');
    return keywords.reduce((acc, { keyword }) => ({
      ...acc,
      [keyword]: {
        titleMatches: 0,
        kgr: null,
        kgrRating: 'not applicable',
        error: 'Volume exceeds KGR limit (250)'
      }
    }), {});
  }

  // Check if we have enough credits
  const usage = await this.getUsage();
  if (usage.remaining < eligibleKeywords.length) {
    toast.error(`Not enough API credits. Need ${eligibleKeywords.length}, but only ${usage.remaining} remaining.`);
    throw new SerpError('Insufficient API credits', 429, false);
  }

  const results: Record<string, SerpAnalysisResult> = {};
  const total = keywords.length;
  let completed = 0;

  // Process all keywords, but only analyze eligible ones
  for (const { keyword, volume } of keywords) {
    if (volume > 0 && volume <= 250) {
      try {
        results[keyword] = await this.analyzeKeyword(keyword, volume);
      } catch (error) {
        results[keyword] = {
          titleMatches: 0,
          kgr: null,
          kgrRating: 'not applicable',
          error: error instanceof Error ? error.message : 'Analysis failed'
        };
      }

      // Add delay only between actual API calls
      if (completed < total - 1) {
        await new Promise(resolve => setTimeout(resolve, serpConfig.rateLimit));
      }
    } else {
      results[keyword] = {
        titleMatches: 0,
        kgr: null,
        kgrRating: 'not applicable',
        error: 'Volume exceeds KGR limit (250)'
      };
    }

    completed++;
    if (onProgress) {
      onProgress((completed / total) * 100);
    }
  }

  return results;
}
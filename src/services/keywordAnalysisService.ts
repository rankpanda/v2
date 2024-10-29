import { groqService } from './groqService';
import { toast } from '../components/ui/Toast';

export interface KeywordAnalysis {
  keyword_analysis: {
    keyword: string;
    volume: number;
    sales_relevance: {
      score: number;
      justification: string;
    };
    funnel_contribution: {
      percentage: number;
      quality_score: number;
      justification: string;
    };
    semantic_importance: {
      score: number;
      justification: string;
    };
    marketing_funnel_position: {
      stage: 'TOFU' | 'MOFU' | 'BOFU';
      justification: string;
    };
    search_intent: {
      type: 'Informational' | 'Navigational' | 'Commercial' | 'Transactional';
      justification: string;
    };
    competitiveness: {
      score: number;
      difficulty_vs_roi: string;
      justification: string;
    };
    b2b_b2c_relevance: {
      b2b_score: number;
      b2c_score: number;
      justification: string;
    };
    seasonality: {
      impact: 'Low' | 'Medium' | 'High';
      justification: string;
    };
    traffic_and_conversion_potential: {
      potential_traffic: number;
      potential_conversions: number;
      estimated_conversion_rate: number;
      potential_revenue: number;
      justification: string;
    };
    content_classification: {
      type: 'Target Page' | 'Support Article' | 'Pillar Page';
      justification: string;
      related_pages: {
        target_page?: string;
        pillar_page?: string;
      };
    };
    overall_priority: {
      score: number;
      justification: string;
    };
  };
}

export interface ContextData {
  category: string;
  brandName: string;
  businessContext: string;
  language: string;
  conversionRate: number;
  averageOrderValue: number;
  userId: string;
}

export const keywordAnalysisService = {
  async analyzeKeyword(keyword: string, volume: number, contextData: ContextData): Promise<KeywordAnalysis> {
    try {
      const analysis = await groqService.analyzeKeyword(keyword, {
        ...contextData,
        volume
      });

      if (!analysis || !analysis.keyword_analysis) {
        throw new Error('Invalid analysis response format');
      }

      return analysis;
    } catch (error) {
      console.error(`Error analyzing keyword "${keyword}":`, error);
      toast.error(`Failed to analyze keyword "${keyword}"`);
      throw error;
    }
  },

  async batchAnalyzeKeywords(
    keywords: Array<{ keyword: string; volume: number }>, 
    contextData: ContextData,
    onProgress: (progress: number) => void
  ): Promise<{ [key: string]: KeywordAnalysis }> {
    const results: { [key: string]: KeywordAnalysis } = {};
    const batchSize = 3;
    let processedCount = 0;
    
    for (let i = 0; i < keywords.length; i += batchSize) {
      const batch = keywords.slice(i, i + batchSize);
      
      await Promise.all(
        batch.map(async ({ keyword, volume }) => {
          try {
            const analysis = await this.analyzeKeyword(keyword, volume, contextData);
            results[keyword] = analysis;
            processedCount++;
            onProgress((processedCount / keywords.length) * 100);
          } catch (error) {
            console.error(`Error analyzing keyword "${keyword}":`, error);
            toast.error(`Failed to analyze keyword "${keyword}"`);
          }
        })
      );

      // Rate limiting between batches
      if (i + batchSize < keywords.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return results;
  }
};
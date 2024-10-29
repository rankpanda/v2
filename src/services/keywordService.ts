import { supabase } from './supabaseClient';
import { toast } from '../components/ui/Toast';
import type { Tables } from './supabaseClient';
import { groqUsageService } from './groqUsageService';

export type Keyword = Tables['keywords']['Row'];
export type NewKeyword = Tables['keywords']['Insert'];

export const keywordService = {
  async getKeywords(projectId: string) {
    try {
      const { data, error } = await supabase
        .from('keywords')
        .select(`
          id,
          project_id,
          keyword,
          volume,
          difficulty,
          intent,
          cpc,
          trend,
          analysis,
          confirmed,
          created_at,
          updated_at
        `)
        .eq('project_id', projectId)
        .order('volume', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching keywords:', error);
      toast.error('Erro ao carregar keywords');
      return [];
    }
  },

  async saveKeywords(projectId: string, keywords: NewKeyword[]) {
    try {
      const { data, error } = await supabase
        .from('keywords')
        .upsert(
          keywords.map(kw => ({
            ...kw,
            project_id: projectId,
            created_at: new Date().toISOString()
          }))
        )
        .select();

      if (error) throw error;
      toast.success(`${keywords.length} keywords guardadas com sucesso`);
      return data;
    } catch (error) {
      console.error('Error saving keywords:', error);
      toast.error('Erro ao guardar keywords');
      throw error;
    }
  },

  async updateKeywordAnalysis(keywordId: string, analysis: any, userId: string) {
    try {
      // Update keyword analysis
      const { error: updateError } = await supabase
        .from('keywords')
        .update({
          analysis,
          intent: analysis.keyword_analysis.search_intent.type,
          confirmed: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', keywordId);

      if (updateError) throw updateError;

      // Track Groq usage
      const tokens = analysis.usage?.total_tokens || 0;
      if (tokens > 0) {
        await groqUsageService.trackUsage(userId, tokens);
      }
    } catch (error) {
      console.error('Error updating keyword analysis:', error);
      throw error;
    }
  },

  async batchUpdateAnalysis(updates: { keywordId: string; analysis: any }[], userId: string) {
    try {
      // Update all keywords
      const { error: updateError } = await supabase
        .from('keywords')
        .upsert(
          updates.map(({ keywordId, analysis }) => ({
            id: keywordId,
            analysis,
            intent: analysis.keyword_analysis.search_intent.type,
            confirmed: true,
            updated_at: new Date().toISOString()
          }))
        );

      if (updateError) throw updateError;

      // Track total Groq usage
      const totalTokens = updates.reduce((sum, { analysis }) => 
        sum + (analysis.usage?.total_tokens || 0), 0);

      if (totalTokens > 0) {
        await groqUsageService.trackUsage(userId, totalTokens);
      }

      toast.success(`${updates.length} análises guardadas com sucesso`);
    } catch (error) {
      console.error('Error updating analyses:', error);
      toast.error('Erro ao guardar análises');
      throw error;
    }
  }
};
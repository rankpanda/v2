import { Groq } from 'groq-sdk';
import { toast } from '../components/ui/Toast';
import { groqUsageService } from './groqUsageService';

const GROQ_API_KEY = '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';

export interface GroqModel {
  id: string;
  name: string;
  description?: string;
  created?: number;
  owned_by?: string;
  root?: string;
}

const groqClient = new Groq({
  apiKey: GROQ_API_KEY,
  dangerouslyAllowBrowser: true
});

export const groqService = {
  async getAvailableModels(): Promise<GroqModel[]> {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/models', {
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      
      return data.data
        .filter((model: any) => !model.id.includes('test') && !model.id.includes('deprecated'))
        .map((model: any) => ({
          id: model.id,
          name: this.getModelDisplayName(model.id),
          description: model.description,
          created: model.created,
          owned_by: model.owned_by,
          root: model.root
        }));
    } catch (error) {
      console.error('Error fetching models:', error);
      throw error;
    }
  },

  getModelDisplayName(modelId: string): string {
    const displayNames: { [key: string]: string } = {
      'mixtral-8x7b-32768': 'Mixtral 8x7B (32K context)',
      'llama2-70b-4096': 'LLaMA2 70B (4K context)',
      'gemma-7b-it': 'Gemma 7B-IT',
      'llama3-70b-8192': 'LLaMA3 70B (8K context)',
      'llama3-8b-8192': 'LLaMA3 8B (8K context)',
      'llama3-groq-70b-8192-tool-use-preview': 'LLaMA3 70B Tool Use',
      'llama3-groq-8b-8192-tool-use-preview': 'LLaMA3 8B Tool Use'
    };
    return displayNames[modelId] || modelId;
  },

  async getCurrentModel(): Promise<string> {
    return localStorage.getItem('groq_model') || 'mixtral-8x7b-32768';
  },

  async setCurrentModel(modelId: string): Promise<void> {
    localStorage.setItem('groq_model', modelId);
  },

  async analyzeKeyword(keyword: string, contextData: any): Promise<any> {
    try {
      const systemPrompt = `You are an expert e-commerce SEO analyst specializing in ${contextData.category}. Your goal is to analyze keywords for ${contextData.brandName}'s e-commerce website, focusing on their potential to drive sales and revenue.

Key Analysis Rules:
1. Content Type Classification:
   - Pillar Page: Main category/topic pages that provide comprehensive coverage
   - Target Page: Specific product/collection pages with direct purchase intent
   - Support Page: Informational content that supports the buying journey

2. Search Intent (SEMrush Categories):
   - Informational: Learning about products/topics
   - Commercial: Researching products to buy
   - Transactional: Ready to make a purchase
   - Navigational: Looking for specific brands/websites

3. Marketing Funnel:
   - TOFU (Top): Awareness stage, broad category terms
   - MOFU (Middle): Consideration stage, specific product types
   - BOFU (Bottom): Purchase stage, buying-intent terms

4. Priority Score (1-10) Rules:
   - 9-10: High purchase intent + perfect category fit + no competitor brand
   - 7-8: Strong commercial intent + good category fit
   - 5-6: Moderate commercial potential + relevant to category
   - 3-4: Weak commercial intent or indirect relevance
   - 1-2: Poor fit or competitor brand focus

Scoring Guidelines:
- Prioritize keywords with clear purchase intent
- Lower scores for purely informational terms
- Zero score for competitor brand terms (except product brands you sell)
- Consider search volume and competition level
- Evaluate alignment with ${contextData.brandName}'s business goals

Output Format:
{
  "keyword_analysis": {
    "keyword": "[keyword]",
    "content_type": {
      "classification": "[Pillar Page/Target Page/Support Page]",
      "justification": "[explanation]"
    },
    "search_intent": {
      "type": "[Informational/Commercial/Transactional/Navigational]",
      "justification": "[explanation]"
    },
    "funnel_stage": {
      "stage": "[TOFU/MOFU/BOFU]",
      "justification": "[explanation]"
    },
    "priority_score": {
      "score": [1-10],
      "justification": "[detailed explanation considering purchase intent, brand relevance, and business goals]"
    }
  }
}`;

      const userPrompt = `Analyze this keyword for ${contextData.brandName}'s e-commerce website:

Keyword: ${keyword}
Category: ${contextData.category}
Brand: ${contextData.brandName}
Business Context: ${contextData.businessContext}
Monthly Search Volume: ${contextData.volume}
Current Conversion Rate: ${contextData.conversionRate}%
Sales Goal: €${contextData.salesGoal}
Language: ${contextData.language}

Provide a detailed analysis following the specified format, focusing on e-commerce potential and purchase intent.`;

      const completion = await groqClient.chat.completions.create({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        model: await this.getCurrentModel(),
        temperature: 0.3,
        max_tokens: 1000,
        stream: false
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new Error('Empty response from API');
      }

      // Track token usage
      const tokensUsed = completion.usage?.total_tokens || 0;
      await groqUsageService.trackUsage(tokensUsed);

      return JSON.parse(content);

    } catch (error) {
      console.error(`Error analyzing keyword "${keyword}":`, error);
      throw error;
    }
  }
};
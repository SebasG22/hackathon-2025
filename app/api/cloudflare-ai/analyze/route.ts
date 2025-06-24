import { NextRequest, NextResponse } from "next/server";

// Types for the AI analysis response
interface UnderwritingAnalysis {
  dtiValue: number;
  qualification: 'QUALIFIED' | 'REQUIRES_REVIEW' | 'NOT_QUALIFIED';
  explanation: string;
  confidence: number;
  riskFactors: string[];
  recommendations: string[];
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { documentData, underwritingRules } = body;

    console.log('🔍 AI Analysis Request - Document Data:', JSON.stringify(documentData, null, 2));
    console.log('🔍 AI Analysis Request - Underwriting Rules:', underwritingRules);

    if (!documentData) {
      return NextResponse.json(
        { error: "Document data is required" },
        { status: 400 }
      );
    }

    // Create the prompt for the AI analysis
    const prompt = createAnalysisPrompt(documentData, underwritingRules);
    console.log('📝 Generated Prompt:', prompt);

    // Call Cloudflare AI
    const analysis = await analyzeWithCloudflareAI(prompt);

    console.log('✅ Final Analysis Result:', JSON.stringify(analysis, null, 2));
    return NextResponse.json(analysis);
  } catch (error) {
    console.error("❌ Error in AI analysis:", error);
    return NextResponse.json(
      { error: "Failed to analyze document" },
      { status: 500 }
    );
  }
}

function createAnalysisPrompt(documentData: any, underwritingRules?: string) {
  const defaultRules = `Using only the income of the occupying borrower(s) to calculate the DTI ratio, the maximum allowable DTI ratio is 43%.

Use the following formula to calculate DTI:
DTI = (Total Monthly Debt Payments / Gross Monthly Income) × 100

Evaluation Criteria:
- If DTI ≤ 43% → Borrower qualifies
- If 43% < DTI ≤ 50% → Borrower requires further evaluation of compensating factors
- If DTI > 50% → Borrower does not qualify`;

  const rules = underwritingRules || defaultRules;
  
  // Convert the entire document data to a readable format
  const documentInfo = JSON.stringify(documentData, null, 2);
  
  const prompt = `You are a mortgage underwriter reviewing a loan application. Your task is to determine whether the borrower qualifies based on these underwriting rules:

${rules}

Document Information (JSON format):
${documentInfo}

Please analyze the provided document data and provide your assessment in the following JSON format:
{
  "dtiValue": <calculated DTI percentage>,
  "qualification": "<QUALIFIED|REQUIRES_REVIEW|NOT_QUALIFIED>",
  "explanation": "<detailed explanation of the decision>",
  "confidence": <confidence level 0-1>,
  "riskFactors": ["<list of risk factors>"],
  "recommendations": ["<list of recommendations>"]
}

Calculate the DTI ratio and provide your assessment based on the document data provided.`;

  return prompt;
}

async function analyzeWithCloudflareAI(prompt: string): Promise<UnderwritingAnalysis> {
  try {
    console.log('🚀 Calling Cloudflare AI API...');
    
    // For Next.js API routes, we need to use the Cloudflare AI API directly
    // since we don't have access to the native binding
    const response = await fetch('https://api.cloudflare.com/client/v4/accounts/843e8e3c6696126808bce5d6f3271bcf/ai/run/@hf/meta-llama/meta-llama-3-8b-instruct', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer 3aU5vpANAeMLt6gjc3LLd1g8E73lHlkUziqDbnXh`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: '@hf/meta-llama/meta-llama-3-8b-instruct',
        messages: [
          {
            role: 'system',
            content: 'You are a mortgage underwriter AI assistant. Always respond with valid JSON in the exact format requested. Do not include any additional text outside the JSON response.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000,
        response_format: { type: "json_object" }
      })
    });

    console.log('📡 Cloudflare AI Response Status:', response.status);
    console.log('📡 Cloudflare AI Response Headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Cloudflare AI API Error Response:', errorText);
      throw new Error(`Cloudflare AI API error: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    console.log('📡 Raw Cloudflare AI Response:', JSON.stringify(data, null, 2));
    
    // Parse the AI response
    let aiResponse;
    try {
      // Handle different response formats
      if (data.response) {
        console.log('📝 Found response in data.response');
        aiResponse = typeof data.response === 'string' 
          ? JSON.parse(data.response) 
          : data.response;
      } else if (data.result) {
        console.log('📝 Found response in data.result');
        aiResponse = typeof data.result === 'string'
          ? JSON.parse(data.result)
          : data.result;
      } else {
        console.log('❌ No response or result found in data');
        throw new Error('Unexpected response format from Cloudflare AI');
      }
      
      console.log('✅ Parsed AI Response:', JSON.stringify(aiResponse, null, 2));
    } catch (parseError) {
      console.error('❌ Failed to parse AI response:', parseError);
      console.log('📡 Raw response data:', data);
      
      // Try to extract JSON from the response text
      const responseText = data.response || data.result || '';
      console.log('🔍 Attempting to extract JSON from text:', responseText);
      
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          aiResponse = JSON.parse(jsonMatch[0]);
          console.log('✅ Extracted JSON from text:', JSON.stringify(aiResponse, null, 2));
        } catch (e) {
          console.error('❌ Failed to parse extracted JSON:', e);
          throw new Error('Failed to extract JSON from AI response');
        }
      } else {
        console.error('❌ No valid JSON found in response text');
        throw new Error('No valid JSON found in AI response');
      }
    }

    // Validate and return the analysis
    const finalAnalysis = {
      dtiValue: aiResponse.dtiValue || 0,
      qualification: aiResponse.qualification || 'REQUIRES_REVIEW',
      explanation: aiResponse.explanation || 'Unable to determine qualification',
      confidence: aiResponse.confidence || 0.5,
      riskFactors: Array.isArray(aiResponse.riskFactors) ? aiResponse.riskFactors : [],
      recommendations: Array.isArray(aiResponse.recommendations) ? aiResponse.recommendations : []
    };

    console.log('✅ Final processed analysis:', JSON.stringify(finalAnalysis, null, 2));
    return finalAnalysis;

  } catch (error) {
    console.error('❌ Cloudflare AI analysis error:', error);
    
    // Fallback analysis if AI fails
    const fallbackAnalysis: UnderwritingAnalysis = {
      dtiValue: 0,
      qualification: 'REQUIRES_REVIEW',
      explanation: 'AI analysis failed. Manual review required.',
      confidence: 0,
      riskFactors: ['Unable to perform automated analysis'],
      recommendations: ['Manual underwriting review required']
    };
    
    console.log('🔄 Returning fallback analysis:', JSON.stringify(fallbackAnalysis, null, 2));
    return fallbackAnalysis;
  }
} 
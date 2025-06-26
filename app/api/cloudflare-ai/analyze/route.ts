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
  // Show the data received in the console
  console.log("🟢 Data received from step 3:", documentData);

  // Convert the data to a readable string
  const documentInfo = JSON.stringify(documentData, null, 2);

  // Build the prompt in English using the real data
  const prompt = `
  Analyze the following document information for mortgage underwriting evaluation:
  ${documentInfo}

  ${underwritingRules ? `Underwriting rules: ${underwritingRules}` : ""}
  Return the analysis in structured JSON format.
  `;

  return prompt;
}

async function analyzeWithCloudflareAI(prompt: string): Promise<UnderwritingAnalysis> {
  try {
    console.log('🚀 Calling Cloudflare AI API...');
    
    // For Next.js API routes, we need to use the Cloudflare AI API directly
    // since we don't have access to the native binding
    const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/843e8e3c6696126808bce5d6f3271bcf/ai/run/@hf/meta-llama/meta-llama-3-8b-instruct`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer 3aU5vpANAeMLt6gjc3LLd1g8E73lHlkUziqDbnXh`
,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: '@hf/meta-llama/meta-llama-3-8b-instruct',
        messages: [
          {
            role: 'system',
            content: `You are a mortgage underwriter reviewing a loan application. Your task is to determine whether the borrower qualifies based on this underwriting rule:

"Using only the income of the occupying borrower(s) to calculate the DTI ratio, the maximum allowable DTI ratio is 43%."

Use the following formula to calculate DTI:
DTI = (Total Monthly Debt Payments / Gross Monthly Income) × 100

Total Monthly Debt Payments: Extracted from the liabilities section of the URLA (e.g., credit cards, auto loans, etc.).

Gross Monthly Income: Derived from the income section of the occupying borrower(s) only.

Evaluation Criteria:

If DTI ≤ 43% → Borrower qualifies.

If 43% < DTI ≤ 50% → Borrower requires further evaluation of compensating factors (e.g., assets, credit history).

If DTI > 50% → Borrower does not qualify.

Response Format (use this structure exactly):

Final DTI Value: XX.XX%
[Professional but friendly sentence explaining the result, including context on how the DTI ratio was derived.]

Example Outputs:
Final DTI Value: 39.85%
The borrower qualifies as the DTI is within the acceptable 43% threshold. This means that their total monthly debt payments, relative to their gross monthly income, are manageable under standard underwriting guidelines.

Final DTI Value: 47.25%
The borrower's DTI exceeds the standard 43% limit but remains under 50%. This suggests that while their monthly debt payments are somewhat high relative to their income, the application may still be considered if strong compensating factors—such as excellent credit or significant cash reserves—are present.

Final DTI Value: 52.10%
The borrower does not qualify as the DTI exceeds the 50% limit established by underwriting guidelines. This indicates that the borrower's monthly debt obligations consume more than half of their gross monthly income, which may present too much risk without significant mitigating factors.`
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

    return aiResponse;

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
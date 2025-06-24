'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Brain, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

interface UnderwritingAnalysis {
  dtiValue: number;
  qualification: 'QUALIFIED' | 'REQUIRES_REVIEW' | 'NOT_QUALIFIED';
  explanation: string;
  confidence: number;
  riskFactors: string[];
  recommendations: string[];
}

interface AIAnalysisProps {
  documentData: any; // Accept any JSON structure from Document AI
  onAnalysisComplete?: (analysis: UnderwritingAnalysis) => void;
  onNext?: () => void; // Add onNext prop for navigation
}

export function AIAnalysis({ documentData, onAnalysisComplete, onNext }: AIAnalysisProps) {
  const [analysis, setAnalysis] = useState<UnderwritingAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  console.log('🎯 AIAnalysis component rendered with documentData:', documentData);

  const startAnalysis = async () => {
    console.log('🚀 startAnalysis called with documentData:', documentData);
    
    if (!documentData) {
      setError('No document data available for analysis');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setAnalysis(null);

    try {
      console.log('📡 Making API call to /api/cloudflare-ai/analyze');
      const response = await fetch('/api/cloudflare-ai/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentData,
          underwritingRules: undefined // Use default rules
        }),
      });

      console.log('📡 API Response status:', response.status);

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ API Response result:', result);
      setAnalysis(result);
      onAnalysisComplete?.(result);
    } catch (err) {
      console.error('❌ Error in startAnalysis:', err);
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getQualificationColor = (qualification: string) => {
    switch (qualification) {
      case 'QUALIFIED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'REQUIRES_REVIEW':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'NOT_QUALIFIED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getQualificationIcon = (qualification: string) => {
    switch (qualification) {
      case 'QUALIFIED':
        return <CheckCircle className="h-4 w-4" />;
      case 'REQUIRES_REVIEW':
        return <AlertTriangle className="h-4 w-4" />;
      case 'NOT_QUALIFIED':
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Underwriting Analysis
          </CardTitle>
          <CardDescription>
            Analyze the document using Cloudflare AI with Llama 3.3 8B model
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            onClick={startAnalysis}
            disabled={isAnalyzing || !documentData}
            className="w-full"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              'Analyze Document'
            )}
          </Button>

          {isAnalyzing && (
            <div className="space-y-2">
              <Progress value={undefined} className="w-full" />
              <p className="text-sm text-muted-foreground">
                Processing document with AI...
              </p>
            </div>
          )}

          {analysis && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Analysis Results</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">DTI Ratio</p>
                      <p className="text-2xl font-bold">{analysis.dtiValue.toFixed(2)}%</p>
                    </div>
                    <Badge 
                      className={`${getQualificationColor(analysis.qualification)} flex items-center gap-1`}
                    >
                      {getQualificationIcon(analysis.qualification)}
                      {analysis.qualification.replace('_', ' ')}
                    </Badge>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Confidence</p>
                    <Progress value={analysis.confidence * 100} className="w-full" />
                    <p className="text-xs text-muted-foreground mt-1">
                      {(analysis.confidence * 100).toFixed(1)}%
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Explanation</p>
                    <p className="text-sm text-muted-foreground">
                      {analysis.explanation}
                    </p>
                  </div>

                  {analysis.riskFactors.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Risk Factors</p>
                      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                        {analysis.riskFactors.map((factor, index) => (
                          <li key={index}>{factor}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {analysis.recommendations.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Recommendations</p>
                      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                        {analysis.recommendations.map((recommendation, index) => (
                          <li key={index}>{recommendation}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {onNext && (
                    <div className="pt-4">
                      <Button onClick={onNext} className="w-full">
                        Continue to Next Step
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Brain, CheckCircle, AlertTriangle, XCircle, Zap, Home } from 'lucide-react';

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
  onRestart?: () => void;
}

export function AIAnalysis({ documentData, onAnalysisComplete, onRestart }: AIAnalysisProps) {
  const [parsedResult, setParsedResult] = useState<any>(null);
  const [rawResult, setRawResult] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startAnalysis = async () => {
    if (!documentData) {
      setError('No document data available for analysis');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setParsedResult(null);
    setRawResult(null);

    try {
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

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.statusText}`);
      }

      let result = await response.json();

      setRawResult(result);
      // Try to parse the response field if it's a stringified JSON
      let parsed = null;
      if (result && typeof result.response === 'string') {
        try {
          parsed = JSON.parse(result.response);
        } catch (e) {
          // If not JSON, maybe it's just a string
          parsed = result.response;
        }
      } else if (result && typeof result.response === 'object') {
        parsed = result.response;
      } else if (typeof result === 'string') {
        // If the result itself is a string, try to parse it
        try {
          parsed = JSON.parse(result);
        } catch (e) {
          parsed = result;
        }
      } else if (typeof result === 'object') {
        parsed = result;
      }
      setParsedResult(parsed);
      onAnalysisComplete?.(parsed);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getQualificationColor = (qualification: string) => {
    switch (qualification) {
      case 'QUALIFIED':
        return 'bg-loanshark-teal/10 text-loanshark-teal border-loanshark-teal/20';
      case 'REQUIRES_REVIEW':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'NOT_QUALIFIED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-loanshark-neutral-dark/10 text-loanshark-neutral-dark border-loanshark-neutral-dark/20';
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
      <Card className="border-loanshark-neutral-light bg-white shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-loanshark-neutral-dark">
            <div className="p-2 rounded-full bg-loanshark-gradient">
              <Home className="h-5 w-5 text-white" />
            </div>
            Mortgage Pre-Approval Assessment
          </CardTitle>
          <CardDescription className="text-loanshark-neutral-dark/70">
            Get your instant mortgage qualification status and personalized recommendations.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={onRestart}
              className="flex-1 bg-loanshark-gradient hover:opacity-90 text-white border-0"
              disabled={isAnalyzing}
            >
              Start New Assessment
            </Button>
            <Button
              onClick={startAnalysis}
              className="flex-1 bg-loanshark-gradient hover:opacity-90 text-white border-0"
              disabled={isAnalyzing || !documentData}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" />
                  Check My Income Now
                </>
              )}
            </Button>
          </div>

          {isAnalyzing && (
            <div className="space-y-2">
              <Progress value={undefined} className="w-full" />
              <p className="text-sm text-loanshark-neutral-dark/60">
                Processing your financial data with AI...
              </p>
            </div>
          )}

          {/* Show parsed result if it's an object with explanation, otherwise show as string */}
          {parsedResult && typeof parsedResult === 'object' && parsedResult.explanation ? (
            <div className="space-y-4">
              <Card className="border-loanshark-neutral-light bg-loanshark-neutral-light/20">
                <CardHeader>
                  <CardTitle className="text-lg text-loanshark-neutral-dark">Your Pre-Approval Results</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-loanshark-neutral-dark">Debt-to-Income (DTI) Ratio</p>
                      <p className="text-2xl font-bold text-loanshark-neutral-dark">
                        {typeof parsedResult.dtiValue === 'number' ? parsedResult.dtiValue.toFixed(2) : parsedResult.dtiValue}%
                      </p>
                    </div>
                    <Badge 
                      className={`${getQualificationColor(parsedResult.qualification)} flex items-center gap-1`}
                    >
                      {getQualificationIcon(parsedResult.qualification)}
                      {parsedResult.qualification?.replace('_', ' ')}
                    </Badge>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2 text-loanshark-neutral-dark">Assessment Summary</p>
                    <div className="text-lg whitespace-pre-line bg-white p-6 rounded-md border border-loanshark-neutral-light text-loanshark-neutral-dark">
                      {parsedResult.explanation}
                    </div>
                  </div>

                  {Array.isArray(parsedResult.riskFactors) && parsedResult.riskFactors.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2 text-loanshark-neutral-dark">Risk Factors</p>
                      <ul className="list-disc list-inside text-sm text-loanshark-neutral-dark/70 space-y-1">
                        {parsedResult.riskFactors.map((factor: string, index: number) => (
                          <li key={index}>{factor}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {Array.isArray(parsedResult.recommendations) && parsedResult.recommendations.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2 text-loanshark-neutral-dark">Recommendations</p>
                      <ul className="list-disc list-inside text-sm text-loanshark-neutral-dark/70 space-y-1">
                        {parsedResult.recommendations.map((recommendation: string, index: number) => (
                          <li key={index}>{recommendation}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : null}

          {/* If parsedResult is a string, show it as is */}
          {parsedResult && typeof parsedResult === 'string' && (
            <div className="space-y-4">
              <Card className="border-loanshark-neutral-light bg-loanshark-neutral-light/20">
                <CardHeader>
                  <CardTitle className="text-lg text-loanshark-neutral-dark">AI Assessment</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-lg whitespace-pre-line bg-white p-6 rounded-md border border-loanshark-neutral-light text-loanshark-neutral-dark">
                    {parsedResult}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

        
        </CardContent>
      </Card>
    </div>
  );
} 
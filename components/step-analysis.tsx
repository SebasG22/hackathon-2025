"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Loader2, FileText, CheckCircle, Edit, AlertCircle, Brain } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { TaxFormDynamic } from "@/components/tax-form-dynamic"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AIAnalysis } from "@/components/ai-analysis"
import { AutoForm } from "@/components/auto-form"

type FileWithPreview = {
  file: File
  id: string
  progress: number
  status: "uploading" | "complete" | "error"
  previewUrl?: string
  extractedData?: any
  analysisResults?: any
}

interface StepAnalysisProps {
  files: FileWithPreview[]
  onNext: () => void
  onAnalysisComplete: (results: any) => void
}

type AnalysisStep = "ready" | "analyzing" | "complete" | "editing"

export function StepAnalysis({ files, onNext, onAnalysisComplete }: StepAnalysisProps) {
  const [currentStep, setCurrentStep] = useState<AnalysisStep>("ready")
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [extractedData, setExtractedData] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("documents")
  const [aiAnalysisResults, setAiAnalysisResults] = useState<any>(null)
  const [analysisStatus, setAnalysisStatus] = useState<null | "success" | "error">(null)

  // Check if any file has analysis data
  const hasAnalysisData = files.some((file) => file.extractedData || file.analysisResults)

  console.log('📊 StepAnalysis - hasAnalysisData:', hasAnalysisData);
  console.log('📊 StepAnalysis - extractedData:', extractedData);
  console.log('📊 StepAnalysis - activeTab:', activeTab);

  // Convert extracted data to Document AI format for AI analysis
  const getDocumentDataForAI = () => {
    if (!extractedData) return null;
    
    console.log('🔍 getDocumentDataForAI called with extractedData:', JSON.stringify(extractedData, null, 2));
    
    // Simply return the extracted data as-is, without any transformation
    // The AI will receive the raw data and analyze it accordingly
    return extractedData;
  };

  const analyzeWithGemini = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/gemini-pdf", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      console.log("[Gemini PDF Analysis Result]", data);

      const match = data.gemini.match(/```json\n([\s\S]*?)```/);
      let parsed = null;
      if (match && match[1]) {
        try {
          parsed = JSON.parse(match[1]);
        } catch (e) {
          console.error("Error parsing Gemini JSON:", e);
        }
      }

      if (parsed) {
        setExtractedData(parsed);
        setAnalysisStatus("success");
        // Actualiza el archivo en el array de archivos para el paso 3
        onAnalysisComplete({ extractedData: parsed });
      } else {
        setAnalysisStatus("error");
      }
      return data;
    } catch (err) {
      setAnalysisStatus("error");
      console.error("[Gemini PDF Analysis Error]", err);
      return null;
    }
  };

  const startAnalysis = () => {
    setCurrentStep("analyzing")
    setAnalysisProgress(0)
    setIsAnalyzing(true)

    let interval: NodeJS.Timeout
    interval = setInterval(() => {
      setAnalysisProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval)
          return prev
        }
        return Math.min(prev + Math.random() * 5 + 2, 90)
      })
    }, 200)

    // Llamar a Gemini
    const pdfFile = files.find(f => f.file.type === "application/pdf")?.file
    if (pdfFile) {
      analyzeWithGemini(pdfFile).then(() => {
        clearInterval(interval)
        setAnalysisProgress(100)
        setIsAnalyzing(false)
        setActiveTab("analysis")
        setCurrentStep("complete")
      })
    } else {
      clearInterval(interval)
      setIsAnalyzing(false)
    }
  }

  const handleEditData = () => {
    setCurrentStep("editing")
  }

  const handleSaveData = (formData: any) => {
    setExtractedData(formData)

    // Create analysis results
    const missingFields = Object.entries(formData)
      .filter(([key, value]) => !value || value === "")
      .map(([key]) => key)

    const results = {
      totalFiles: files.length,
      processedFiles: files.length,
      extractedData: formData,
      missingFields,
      confidence: 95,
      documentType: "IRS Form 1040 (2017)",
    }

    onAnalysisComplete(results)
  }

  const handleFormNext = () => {
    // Scroll to top when proceeding to next step
    window.scrollTo({ top: 0, behavior: "smooth" })
    onNext()
  }

  const handleAIAnalysisComplete = (analysis: any) => {
    setAiAnalysisResults(analysis);
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">

        <TabsContent value="documents" className="space-y-6">
          {/* Files Overview */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-2xl">Document Data Extraction</CardTitle>
              <CardDescription>
                AI is processing your document to extract relevant financial and personal information.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {files.map((file) => (
                  <motion.div
                    key={file.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-3 p-4 rounded-lg border bg-card/50"
                  >
                    <div className="flex-shrink-0">
                      {file.previewUrl ? (
                        <div className="h-12 w-12 rounded overflow-hidden">
                          <img
                            src={file.previewUrl || "/placeholder.svg"}
                            alt={file.file.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="h-12 w-12 rounded bg-primary/10 flex items-center justify-center">
                          <FileText className="h-6 w-6 text-primary" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.file.name}</p>
                      <p className="text-xs text-muted-foreground">{(file.file.size / 1024 / 1024).toFixed(2)} MB</p>
                      {file.extractedData && <p className="text-xs text-green-600 mt-1">✓ Analysis complete</p>}
                    </div>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </motion.div>
                ))}
              </div>

              {/* Analysis Steps */}
              {currentStep === "ready" && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  <Card>
                    <CardContent className="text-center py-8">
                      <div className="mb-4 rounded-full bg-primary/10 p-4 inline-block">
                        <FileText className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="text-lg font-medium mb-2">Ready to Analyze Tax Form</h3>
                      <p className="text-sm text-muted-foreground mb-6">
                        Click the button to start specialized analysis of your IRS Form 1040.
                      </p>
                      <Button onClick={startAnalysis} size="lg" className="min-w-[160px]">
                        Start Tax Analysis
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {currentStep === "analyzing" && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  <Card>
                    <CardContent className="text-center py-8">
                      <div className="mb-4 rounded-full bg-primary/10 p-4 inline-block">
                        <Loader2 className="h-8 w-8 text-primary animate-spin" />
                      </div>
                      <h3 className="text-lg font-medium mb-2">Analyzing Tax Form</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Extracting tax information and processing Form 1040 data...
                      </p>
                      <div className="max-w-md mx-auto">
                        <Progress value={analysisProgress} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-2">{Math.round(analysisProgress)}% complete</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          {!hasAnalysisData && (
            <Card>
              <CardContent className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Analysis Data Available</h3>
                <p className="text-sm text-muted-foreground">Please run the analysis first to view extracted data.</p>
              </CardContent>
            </Card>
          )}

          {currentStep === "complete" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card>
                <CardContent className="text-center py-8">
                  {analysisStatus === "success" && (
                    <>
                      <div className="mb-4 rounded-full bg-green-100 p-4 inline-block">
                        <CheckCircle className="h-8 w-8 text-green-600" />
                      </div>
                      <h3 className="text-lg font-medium mb-2">Documento procesado correctamente</h3>
                      <p className="text-sm text-muted-foreground mb-6">
                        El documento ha sido analizado y los datos están listos para revisión y edición.
                      </p>
                    </>
                  )}
                  {analysisStatus === "error" && (
                    <>
                      <div className="mb-4 rounded-full bg-red-100 p-4 inline-block">
                        <AlertCircle className="h-8 w-8 text-red-600" />
                      </div>
                      <h3 className="text-lg font-medium mb-2">El análisis falló</h3>
                      <p className="text-sm text-muted-foreground mb-6">
                        Ocurrió un error al procesar el documento. Intenta nuevamente.
                      </p>
                    </>
                  )}
                  <div className="flex gap-3 justify-center">
                    <Button onClick={onNext} size="lg">
                      Continuar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {currentStep === "editing" && extractedData && (
            typeof extractedData === "object" ? (
              <AutoForm
                data={extractedData}
                onSave={(updatedJson) => {
                  setExtractedData(updatedJson);
                  // Aquí puedes avanzar al siguiente paso o guardar en backend
                  console.log("JSON editado:", updatedJson);
                }}
              />
            ) : (
              <>
                <CardTitle className="text-lg">Review & Edit Extracted Data</CardTitle>
                <CardDescription>
                  Ensure all information is accurate before proceeding to underwriting.
                </CardDescription>
                <TaxFormDynamic initialData={extractedData} onSave={handleSaveData} onNext={handleFormNext} />
              </>
            )
          )}
        </TabsContent>

        <TabsContent value="ai-analysis" className="space-y-6">
          {!hasAnalysisData ? (
            <Card>
              <CardContent className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Analysis Data Available</h3>
                <p className="text-sm text-muted-foreground">Please run the document analysis first to enable AI underwriting analysis.</p>
              </CardContent>
            </Card>
          ) : (
            <AIAnalysis 
              documentData={getDocumentDataForAI()} 
              onAnalysisComplete={handleAIAnalysisComplete}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

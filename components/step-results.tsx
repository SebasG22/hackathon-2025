"use client"

import { motion } from "framer-motion"
import { CheckCircle, AlertTriangle, User, Mail, Phone, MapPin, FileText, Calendar, Briefcase, DollarSign } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

interface AnalysisResults {
  totalFiles: number
  processedFiles: number
  extractedData: {
    name: string
    email: string
    phone: string
    address: string
    documentType: string
    documentNumber: string
    birthDate: string
    occupation: string
  }
  missingFields: string[]
  confidence: number
}

interface StepResultsProps {
  results: AnalysisResults
  onRestart: () => void
}

const fieldLabels: Record<string, { label: string; icon: any }> = {
  name: { label: "Full Name", icon: User },
  email: { label: "Email Address", icon: Mail },
  phone: { label: "Phone Number", icon: Phone },
  address: { label: "Address", icon: MapPin },
  documentType: { label: "Document Type", icon: FileText },
  documentNumber: { label: "Document Number", icon: FileText },
  birthDate: { label: "Date of Birth", icon: Calendar },
  occupation: { label: "Occupation", icon: Briefcase },
}

export function StepResults({ results, onRestart }: StepResultsProps) {
  const hasMissingData = results.missingFields.length > 0

  return (
    <div className="space-y-6">
      <Card className="w-full border-loanshark-neutral-light bg-white shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2 text-loanshark-neutral-dark">
            <div className="p-2 rounded-full bg-loanshark-gradient">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            Document Analysis Complete
          </CardTitle>
          <CardDescription className="text-loanshark-neutral-dark/70">
            Successfully processed {results.processedFiles} of {results.totalFiles} documents with{" "}
            {results.confidence}% confidence.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {hasMissingData && (
            <Alert variant="warning" className="border-yellow-200 bg-yellow-50">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertTitle className="text-yellow-800">Incomplete Data Detected</AlertTitle>
              <AlertDescription className="text-yellow-700">
                Found {results.missingFields.length} fields without information. Please complete the missing data to
                continue with your mortgage assessment.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(results.extractedData).map(([key, value], index) => {
              const field = fieldLabels[key]
              const isMissing = results.missingFields.includes(key)
              const Icon = field?.icon || FileText

              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 rounded-lg border ${
                    isMissing
                      ? "border-yellow-200 bg-yellow-50"
                      : "border-loanshark-teal/20 bg-loanshark-teal/5"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-full ${
                        isMissing ? "bg-yellow-100" : "bg-loanshark-teal/10"
                      }`}
                    >
                      <Icon
                        className={`h-4 w-4 ${
                          isMissing ? "text-yellow-600" : "text-loanshark-teal"
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-loanshark-neutral-dark">{field?.label || key}</p>
                      <p
                        className={`text-sm mt-1 ${
                          isMissing ? "text-yellow-700 italic" : "text-loanshark-neutral-dark/70"
                        }`}
                      >
                        {value || "Information not found"}
                      </p>
                    </div>
                    {!isMissing && <CheckCircle className="h-4 w-4 text-loanshark-teal flex-shrink-0 mt-1" />}
                    {isMissing && <AlertTriangle className="h-4 w-4 text-yellow-500 flex-shrink-0 mt-1" />}
                  </div>
                </motion.div>
              )
            })}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button 
              onClick={onRestart} 
              variant="outline" 
              className="flex-1 border-loanshark-neutral-dark/20 text-loanshark-neutral-dark hover:bg-loanshark-neutral-dark hover:text-white"
            >
              Upload New Documents
            </Button>
            <Button 
              className="flex-1 bg-loanshark-gradient hover:opacity-90 text-white border-0 disabled:opacity-50" 
              disabled={hasMissingData}
            >
              {hasMissingData ? "Complete Missing Data" : "Continue to Assessment"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {hasMissingData && (
        <Card className="border-loanshark-neutral-light bg-white">
          <CardHeader>
            <CardTitle className="text-lg text-loanshark-neutral-dark">Missing Fields</CardTitle>
            <CardDescription className="text-loanshark-neutral-dark/70">
              The following fields require additional information to complete your assessment:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {results.missingFields.map((field) => (
                <div key={field} className="flex items-center gap-2 text-sm">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  <span className="text-loanshark-neutral-dark">{fieldLabels[field]?.label || field}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

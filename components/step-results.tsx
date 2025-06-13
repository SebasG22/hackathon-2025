"use client"

import { motion } from "framer-motion"
import { CheckCircle, AlertTriangle, User, Mail, Phone, MapPin, FileText, Calendar, Briefcase } from "lucide-react"
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
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <CheckCircle className="h-6 w-6 text-green-500" />
            Analysis Results
          </CardTitle>
          <CardDescription>
            Information extracted from {results.processedFiles} of {results.totalFiles} documents with{" "}
            {results.confidence}% confidence.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {hasMissingData && (
            <Alert variant="warning">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Incomplete Data Detected</AlertTitle>
              <AlertDescription>
                Found {results.missingFields.length} fields without information. Please complete the missing data to
                continue with the process.
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
                      ? "border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/30"
                      : "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-full ${
                        isMissing ? "bg-yellow-100 dark:bg-yellow-900" : "bg-green-100 dark:bg-green-900"
                      }`}
                    >
                      <Icon
                        className={`h-4 w-4 ${
                          isMissing ? "text-yellow-600 dark:text-yellow-400" : "text-green-600 dark:text-green-400"
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{field?.label || key}</p>
                      <p
                        className={`text-sm mt-1 ${
                          isMissing ? "text-yellow-700 dark:text-yellow-300 italic" : "text-muted-foreground"
                        }`}
                      >
                        {value || "Information not found"}
                      </p>
                    </div>
                    {!isMissing && <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-1" />}
                    {isMissing && <AlertTriangle className="h-4 w-4 text-yellow-500 flex-shrink-0 mt-1" />}
                  </div>
                </motion.div>
              )
            })}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button onClick={onRestart} variant="outline" className="flex-1">
              Upload New Documents
            </Button>
            <Button className="flex-1" disabled={hasMissingData}>
              {hasMissingData ? "Complete Missing Data" : "Continue Process"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {hasMissingData && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Missing Fields</CardTitle>
            <CardDescription>The following fields require additional information:</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {results.missingFields.map((field) => (
                <div key={field} className="flex items-center gap-2 text-sm">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  <span>{fieldLabels[field]?.label || field}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

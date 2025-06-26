"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { FileText, Edit, Eye, CheckCircle, AlertTriangle, User, DollarSign } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TaxFormDynamic } from "@/components/tax-form-dynamic"
import { Badge } from "@/components/ui/badge"
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

interface StepFileManagerProps {
  files: FileWithPreview[]
  onNext: () => void
  onFileDataUpdate: (fileId: string, updatedData: any) => void
  onUploadNew: () => void
}

export function StepFileManager({ files, onNext, onFileDataUpdate, onUploadNew }: StepFileManagerProps) {
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"view" | "edit">("view")

  const selectedFile = files.find((f) => f.id === selectedFileId)
  const filesWithData = files.filter((f) => f.extractedData)

  const handleSaveFileData = (updatedData: any) => {
    if (selectedFileId) {
      onFileDataUpdate(selectedFileId, updatedData)
      setViewMode("view")
    }
  }

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) return <FileText className="h-6 w-6 text-blue-500" />
    if (file.type === "application/pdf") return <FileText className="h-6 w-6 text-red-500" />
    return <FileText className="h-6 w-6 text-amber-500" />
  }

  const getDataSummary = (data: any) => {
    if (!data) return null

    const summary = []
    if (data.firstName && data.lastName) {
      summary.push(`${data.firstName} ${data.lastName}`)
    }
    if (data.totalIncome) {
      summary.push(`Income: $${data.totalIncome}`)
    }
    if (data.tax) {
      summary.push(`Tax: $${data.tax}`)
    }

    return summary.length > 0 ? summary.join(" • ") : "Data extracted"
  }

  return (
    <div className="space-y-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl">File Manager</CardTitle>
          <CardDescription>
            Manage extracted data from your uploaded documents. Select a file to view or edit its information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-sm">
                {files.length} Total Files
              </Badge>
              <Badge variant="outline" className="text-sm">
                {filesWithData.length} Processed
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {files.map((file) => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.02 }}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  selectedFileId === file.id
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card hover:border-primary/50"
                }`}
                onClick={() => setSelectedFileId(file.id)}
              >
                <div className="flex items-start gap-3">
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
                        {getFileIcon(file.file)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.file.name}</p>
                    <p className="text-xs text-muted-foreground">{(file.file.size / 1024 / 1024).toFixed(2)} MB</p>
                    {file.extractedData ? (
                      <div className="mt-2">
                        <div className="flex items-center gap-1 mb-1">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          <span className="text-xs text-green-600">Data extracted</span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{getDataSummary(file.extractedData)}</p>
                      </div>
                    ) : (
                      <div className="mt-2">
                        <span className="text-xs text-muted-foreground">No data extracted</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedFile && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">{selectedFile.file.name}</CardTitle>
                  <CardDescription>
                    {selectedFile.extractedData ? "View and edit extracted information" : "No data available"}
                  </CardDescription>
                </div>
                {selectedFile.extractedData && (
                  <div className="flex gap-2">
                    <Button
                      variant={viewMode === "view" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setViewMode("view")}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    <Button
                      variant={viewMode === "edit" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setViewMode("edit")}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {selectedFile.extractedData ? (
                viewMode === "edit" ? (
                  typeof selectedFile.extractedData === "object" ? (
                    <AutoForm
                      data={selectedFile.extractedData}
                      onSave={(updatedJson) => {
                        handleSaveFileData(updatedJson)
                        setViewMode("view")
                      }}
                    />
                  ) : (
                    <TaxFormDynamic
                      initialData={selectedFile.extractedData}
                      onSave={handleSaveFileData}
                      onNext={() => setViewMode("view")}
                    />
                  )
                ) : (
                  typeof selectedFile.extractedData === "object" ? (
                    <AutoForm data={selectedFile.extractedData} readOnly />
                  ) : (
                    <div className="space-y-6">
                      {/* Data Summary View */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.entries(selectedFile.extractedData)
                          .filter(([key, value]) => value && value !== "")
                          .slice(0, 12)
                          .map(([key, value]) => (
                            <div key={key} className="p-2 border rounded">
                              <span className="font-semibold">{key}:</span> {JSON.stringify(value)}
                            </div>
                          ))}
                      </div>
                    </div>
                  )
                )
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Data Extracted</h3>
                  <p className="text-sm text-muted-foreground">
                    This file hasn't been processed yet. Go back to the Analysis step to extract data.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      <div className="flex justify-end pt-4">
        <Button onClick={onNext} disabled={filesWithData.length === 0}>
          Continue to Results
        </Button>
      </div>
    </div>
  )
}

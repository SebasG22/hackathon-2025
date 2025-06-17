"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, type File, CheckCircle, AlertCircle, X, FileText, FileIcon as FilePdf, FileImage, Loader2 } from "lucide-react"
import { useDropzone } from "react-dropzone"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"

type FileWithPreview = {
  file: File
  id: string
  progress: number
  status: "uploading" | "complete" | "error"
  previewUrl?: string
  processingResult?: DocumentAIResult
}

type DocumentAIResult = {
  text: string
  pages: Array<{
    pageNumber: number
    width: number
    height: number
    confidence: number
  }>
  entities: Array<{
    type: string
    mentionText: string
    confidence: number
  }>
}

export function UploadDocuments() {
  const [files, setFiles] = useState<FileWithPreview[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const processDocument = async (file: File, fileId: string) => {
    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/process-document", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to process document")
      }

      const result = await response.json()
      
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileId
            ? { ...f, status: "complete", progress: 100, processingResult: result }
            : f
        )
      )

      toast({
        title: "Document processed",
        description: "Your document has been successfully processed.",
      })
    } catch (error) {
      console.error("Error processing document:", error)
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileId ? { ...f, status: "error", progress: 0 } : f
        )
      )

      toast({
        title: "Processing failed",
        description: error instanceof Error ? error.message : "Failed to process document",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const onDrop = (acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map((file) => ({
      file,
      id: crypto.randomUUID(),
      progress: 0,
      status: "uploading" as const,
      previewUrl: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,
    }))

    setFiles((prev) => [...prev, ...newFiles])

    // Process each file
    newFiles.forEach((fileWithPreview) => {
      setIsProcessing(true)
      processDocument(fileWithPreview.file, fileWithPreview.id)
    })
  }

  const removeFile = (fileId: string) => {
    setFiles((prev) => {
      const updatedFiles = prev.filter((f) => f.id !== fileId)
      // Clean up any object URLs to avoid memory leaks
      const fileToRemove = prev.find((f) => f.id === fileId)
      if (fileToRemove?.previewUrl) {
        URL.revokeObjectURL(fileToRemove.previewUrl)
      }
      return updatedFiles
    })
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
    },
    maxSize: 10485760, // 10MB
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
    onDropAccepted: () => setIsDragging(false),
    onDropRejected: () => {
      setIsDragging(false)
      toast({
        title: "Upload failed",
        description: "Please check file type and size (max 10MB).",
        variant: "destructive",
      })
    },
  })

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) return <FileImage className="h-6 w-6 text-blue-500" />
    if (file.type === "application/pdf") return <FilePdf className="h-6 w-6 text-red-500" />
    return <FileText className="h-6 w-6 text-amber-500" />
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Upload Documents</CardTitle>
        <CardDescription>
          Drag and drop your documents or click to browse. Supported formats: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer flex flex-col items-center justify-center min-h-[200px] ${
            isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"
          }`}
        >
          <input {...getInputProps()} />
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="mb-4 rounded-full bg-primary/10 p-3 inline-block">
              <Upload className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-medium mb-1">Drop your files here</h3>
            <p className="text-sm text-muted-foreground mb-4">or click to browse</p>
            <Button variant="outline" size="sm">
              Select Files
            </Button>
          </motion.div>
        </div>

        <AnimatePresence>
          {files.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4"
            >
              <h3 className="font-medium">Uploaded Files</h3>
              <div className="space-y-3">
                {files.map((fileWithPreview) => (
                  <motion.div
                    key={fileWithPreview.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="flex flex-col gap-4 p-4 rounded-lg border bg-card"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        {fileWithPreview.previewUrl ? (
                          <div className="h-10 w-10 rounded overflow-hidden">
                            <img
                              src={fileWithPreview.previewUrl}
                              alt={fileWithPreview.file.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ) : (
                          getFileIcon(fileWithPreview.file)
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{fileWithPreview.file.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Progress value={fileWithPreview.progress} className="h-1.5" />
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {fileWithPreview.progress}%
                          </span>
                        </div>
                      </div>
                      <div className="flex-shrink-0 flex items-center gap-2">
                        {fileWithPreview.status === "uploading" && (
                          <Loader2 className="h-5 w-5 animate-spin text-primary" />
                        )}
                        {fileWithPreview.status === "complete" && (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        )}
                        {fileWithPreview.status === "error" && (
                          <AlertCircle className="h-5 w-5 text-red-500" />
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full"
                          onClick={() => removeFile(fileWithPreview.id)}
                        >
                          <X className="h-4 w-4" />
                          <span className="sr-only">Remove file</span>
                        </Button>
                      </div>
                    </div>

                    {/* Document AI Results */}
                    {fileWithPreview.processingResult && (
                      <div className="mt-2 space-y-4">
                        <div className="flex flex-wrap gap-2">
                          {fileWithPreview.processingResult.entities.map((entity, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {entity.type}: {entity.mentionText}
                            </Badge>
                          ))}
                        </div>
                        <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                          <pre className="text-xs whitespace-pre-wrap">
                            {fileWithPreview.processingResult.text}
                          </pre>
                        </ScrollArea>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => setFiles([])}>
          Clear All
        </Button>
        <Button disabled={files.length === 0 || isProcessing}>Submit</Button>
      </CardFooter>
    </Card>
  )
}

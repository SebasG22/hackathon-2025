"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Upload,
  CheckCircle,
  AlertCircle,
  X,
  FileText,
  FileImage,
  FileIcon as FilePdf,
  Download,
  Trash2,
} from "lucide-react"
import { useDropzone } from "react-dropzone"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

type FileWithPreview = {
  file: File
  id: string
  progress: number
  status: "uploading" | "complete" | "error"
  previewUrl?: string
  extractedData?: any
  analysisResults?: any
}

interface StepUploadProps {
  onFilesUploaded: (files: FileWithPreview[]) => void
  onNext: () => void
  onLoadSampleData?: () => void
  existingFiles?: FileWithPreview[]
}

export function StepUpload({ onFilesUploaded, onNext, onLoadSampleData, existingFiles = [] }: StepUploadProps) {
  const [files, setFiles] = useState<FileWithPreview[]>(existingFiles)
  const [isDragging, setIsDragging] = useState(false)

  // Update local files when existingFiles changes
  useEffect(() => {
    setFiles(existingFiles)
  }, [existingFiles])

  // Add this useEffect after the useState declarations
  useEffect(() => {
    onFilesUploaded(files)
  }, [files, onFilesUploaded])

  const onDrop = (acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map((file) => ({
      file,
      id: crypto.randomUUID(),
      progress: 0,
      status: "uploading" as const,
      previewUrl: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,
    }))

    const updatedFiles = [...files, ...newFiles]
    setFiles(updatedFiles)

    // Simulate upload progress for each file
    newFiles.forEach((fileWithPreview) => {
      simulateFileUpload(fileWithPreview.id)
    })
  }

  const simulateFileUpload = (fileId: string) => {
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 15 + 5
      if (progress >= 100) {
        progress = 100
        clearInterval(interval)
        setFiles((prev) =>
          prev.map((f) => (f.id === fileId ? { ...f, progress: 100, status: "complete" as const } : f)),
        )
        toast({
          title: "File uploaded successfully",
          description: "Your document has been loaded correctly.",
        })
      } else {
        setFiles((prev) => prev.map((f) => (f.id === fileId ? { ...f, progress: Math.round(progress) } : f)))
      }
    }, 200)
  }

  const removeFile = (fileId: string) => {
    setFiles((prev) => {
      const fileToRemove = prev.find((f) => f.id === fileId)
      if (fileToRemove?.previewUrl) {
        URL.revokeObjectURL(fileToRemove.previewUrl)
      }
      return prev.filter((f) => f.id !== fileId)
    })

    toast({
      title: "File removed",
      description: "The file has been removed from your uploads.",
    })
  }

  const clearAllFiles = () => {
    // Clean up object URLs
    files.forEach((file) => {
      if (file.previewUrl) {
        URL.revokeObjectURL(file.previewUrl)
      }
    })

    setFiles([])

    toast({
      title: "All files cleared",
      description: "All uploaded files have been removed.",
    })
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
    },
    maxSize: 10485760, // 10MB
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
    onDropAccepted: () => setIsDragging(false),
    onDropRejected: () => {
      setIsDragging(false)
      toast({
        title: "File upload error",
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

  const completedFiles = files.filter((f) => f.status === "complete")
  const canProceed = completedFiles.length > 0

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Upload Documents</CardTitle>
        <CardDescription>
          Drag and drop your documents or click to browse. Supported formats: PDF, JPG, PNG, WEBP.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Easy Upload Option */}
        <Alert>
          <Download className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Want to try with sample data? Load a pre-filled IRS Form 1040 example.</span>
            <Button onClick={onLoadSampleData} variant="outline" size="sm" className="ml-4">
              <Download className="h-4 w-4 mr-2" />
              Load Sample Form 1040
            </Button>
          </AlertDescription>
        </Alert>

        <motion.div
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          animate={{
            borderColor: isDragging ? "rgb(239, 68, 68)" : "rgb(226, 232, 240)",
            backgroundColor: isDragging ? "rgba(239, 68, 68, 0.05)" : "transparent",
          }}
          transition={{ duration: 0.2 }}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer flex flex-col items-center justify-center min-h-[200px] ${
            isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"
          }`}
          {...getRootProps()}
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
        </motion.div>

        <AnimatePresence>
          {files.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Uploaded Files ({files.length})</h3>
                <Button
                  onClick={clearAllFiles}
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
              </div>
              <div className="space-y-3">
                {files.map((fileWithPreview) => (
                  <motion.div
                    key={fileWithPreview.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="flex items-center gap-4 p-3 rounded-lg border bg-card"
                  >
                    <div className="flex-shrink-0">
                      {fileWithPreview.previewUrl ? (
                        <div className="h-10 w-10 rounded overflow-hidden">
                          <img
                            src={fileWithPreview.previewUrl || "/placeholder.svg"}
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
                      {fileWithPreview.extractedData && <p className="text-xs text-green-600 mt-1">✓ Data extracted</p>}
                    </div>
                    <div className="flex-shrink-0">
                      {fileWithPreview.status === "complete" ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : fileWithPreview.status === "error" ? (
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      ) : null}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => removeFile(fileWithPreview.id)}
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Remove file</span>
                    </Button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex justify-end pt-4">
          <Button onClick={onNext} disabled={!canProceed} className="min-w-[120px]">
            Continue ({completedFiles.length})
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

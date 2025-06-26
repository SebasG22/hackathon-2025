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
  Zap,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files])

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
          title: "Document uploaded successfully",
          description: "Your tax document has been loaded and is ready for analysis.",
          variant: "success",
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
      title: "Document removed",
      description: "The document has been removed from your uploads.",
      variant: "warning",
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
      title: "All documents cleared",
      description: "All uploaded documents have been removed.",
      variant: "warning",
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
        title: "Upload error",
        description: "Please check file type and size (max 10MB).",
        variant: "destructive",
      })
    },
  })

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) return <FileImage className="h-6 w-6 text-loanshark-bolt" />
    if (file.type === "application/pdf") return <FilePdf className="h-6 w-6 text-loanshark-teal" />
    return <FileText className="h-6 w-6 text-loanshark-navy" />
  }

  const completedFiles = files.filter((f) => f.status === "complete")
  const canProceed = completedFiles.length > 0

  return (
    <Card className="w-full border-loanshark-neutral-light bg-white shadow-lg">
      <CardHeader className="bg-loanshark-gradient bg-clip-text">
        <CardTitle className="text-2xl text-loanshark-neutral-dark">Upload Your Documents</CardTitle>
        <CardDescription className="text-loanshark-neutral-dark/70">
          Upload your tax returns, W-2s, and income documents. We'll analyze them in seconds.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <motion.div
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          animate={{
            borderColor: isDragging ? "#00B5A5" : "#E2E8F0",
            backgroundColor: isDragging ? "rgba(0, 181, 165, 0.05)" : "transparent",
          }}
          transition={{ duration: 0.2 }}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer flex flex-col items-center justify-center min-h-[200px] ${
            isDragActive ? "border-loanshark-teal bg-loanshark-teal/5" : "border-loanshark-neutral-dark/25"
          }`}
          {...getRootProps()}
        >
          <input {...getInputProps()} />
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="mb-4 rounded-full bg-loanshark-gradient p-3 inline-block">
              <Upload className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-medium mb-1 text-loanshark-neutral-dark">Drop your documents here</h3>
            <p className="text-sm text-loanshark-neutral-dark/60 mb-4">or click to browse</p>
            <Button className="bg-loanshark-gradient hover:opacity-90 text-white border-0">
              <Zap className="h-4 w-4 mr-2" />
              Select Documents
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
                <h3 className="font-medium text-loanshark-neutral-dark">Uploaded Documents ({files.length})</h3>
                <Button 
                  onClick={clearAllFiles}
                  className="bg-loanshark-gradient hover:opacity-90 text-white border-0 shadow-sm"
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
                    className="flex items-center gap-4 p-3 rounded-lg border border-loanshark-neutral-light bg-loanshark-neutral-light/50"
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
                      <p className="text-sm font-medium truncate text-loanshark-neutral-dark">{fileWithPreview.file.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Progress value={fileWithPreview.progress} className="h-1.5" />
                        <span className="text-xs text-loanshark-neutral-dark/60 whitespace-nowrap">
                          {fileWithPreview.progress}%
                        </span>
                      </div>
                      {fileWithPreview.extractedData && <p className="text-xs text-loanshark-teal mt-1">✓ Data extracted</p>}
                    </div>
                    <div className="flex-shrink-0">
                      {fileWithPreview.status === "complete" ? (
                        <CheckCircle className="h-5 w-5 text-loanshark-teal" />
                      ) : fileWithPreview.status === "error" ? (
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      ) : null}
                    </div>
                    <Button 
                      onClick={() => removeFile(fileWithPreview.id)}
                      variant="ghost"
                      size="sm"
                      className="text-loanshark-neutral-dark/60 hover:text-loanshark-neutral-dark hover:bg-loanshark-neutral-dark/10"
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
          <Button 
            onClick={onNext} 
            disabled={!canProceed} 
            className="min-w-[120px] bg-loanshark-gradient hover:opacity-90 text-white border-0 disabled:opacity-50"
          >
            Continue ({completedFiles.length})
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

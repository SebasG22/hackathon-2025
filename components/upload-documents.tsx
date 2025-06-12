"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, type File, CheckCircle, AlertCircle, X, FileText, FileIcon as FilePdf, FileImage } from "lucide-react"
import { useDropzone } from "react-dropzone"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"

type FileWithPreview = {
  file: File
  id: string
  progress: number
  status: "uploading" | "complete" | "error"
  previewUrl?: string
}

export function UploadDocuments() {
  const [files, setFiles] = useState<FileWithPreview[]>([])
  const [isDragging, setIsDragging] = useState(false)

  const onDrop = (acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map((file) => ({
      file,
      id: crypto.randomUUID(),
      progress: 0,
      status: "uploading" as const,
      previewUrl: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,
    }))

    setFiles((prev) => [...prev, ...newFiles])

    // Simulate upload progress for each file
    newFiles.forEach((fileWithPreview) => {
      simulateFileUpload(fileWithPreview.id)
    })
  }

  const simulateFileUpload = (fileId: string) => {
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 10
      if (progress >= 100) {
        progress = 100
        clearInterval(interval)
        setFiles((prev) => prev.map((f) => (f.id === fileId ? { ...f, progress: 100, status: "complete" } : f)))
        toast({
          title: "Upload complete",
          description: "Your document has been uploaded successfully.",
        })
      } else {
        setFiles((prev) => prev.map((f) => (f.id === fileId ? { ...f, progress: Math.round(progress) } : f)))
      }
    }, 300)
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
        <motion.div
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          animate={{
            borderColor: isDragging ? "rgb(59, 130, 246)" : "rgb(226, 232, 240)",
            backgroundColor: isDragging ? "rgba(59, 130, 246, 0.05)" : "transparent",
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
              <h3 className="font-medium">Uploaded Files</h3>
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
                      className="h-8 w-8 rounded-full"
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
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => setFiles([])}>
          Clear All
        </Button>
        <Button disabled={files.length === 0 || files.some((f) => f.status === "uploading")}>Submit</Button>
      </CardFooter>
    </Card>
  )
}

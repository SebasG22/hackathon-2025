"use client"

import { useState, useCallback } from "react"
import { motion } from "framer-motion"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { StepUpload } from "@/components/step-upload"
import { StepAnalysis } from "@/components/step-analysis"
import { StepFileManager } from "@/components/step-file-manager"
import { StepResults } from "@/components/step-results"

type FileWithPreview = {
  file: File
  id: string
  progress: number
  status: "uploading" | "complete" | "error"
  previewUrl?: string
  extractedData?: any
  analysisResults?: any
}

type Step = "upload" | "analysis" | "files" | "results"

const steps = [
  { id: "upload", label: "Upload Documents", description: "Load your files" },
  { id: "analysis", label: "Analysis", description: "AI Processing" },
  { id: "files", label: "File Manager", description: "Manage extracted data" },
  { id: "results", label: "Results", description: "Final summary" },
]

export function DocumentProcessor() {
  const [currentStep, setCurrentStep] = useState<Step>("upload")
  const [files, setFiles] = useState<FileWithPreview[]>([])
  const [analysisResults, setAnalysisResults] = useState<any>(null)

  const handleFilesUploaded = useCallback((uploadedFiles: FileWithPreview[]) => {
    setFiles(uploadedFiles)
  }, [])

  const handleNextStep = () => {
    if (currentStep === "upload") {
      setCurrentStep("analysis")
    } else if (currentStep === "analysis") {
      setCurrentStep("files")
    } else if (currentStep === "files") {
      setCurrentStep("results")
    }
  }

  const handleStepClick = (stepId: Step) => {
    const stepIndex = steps.findIndex((step) => step.id === stepId)
    const currentIndex = steps.findIndex((step) => step.id === currentStep)

    // Allow going back to previous steps or staying on current step
    if (stepIndex <= currentIndex) {
      setCurrentStep(stepId)
    }
  }

  const handleAnalysisComplete = (results: any) => {
    setAnalysisResults(results)

    // Update files with extracted data
    setFiles((prevFiles) =>
      prevFiles.map((file, index) => ({
        ...file,
        extractedData: results.extractedData,
        analysisResults: results,
      })),
    )
  }

  const handleFileDataUpdate = (fileId: string, updatedData: any) => {
    setFiles((prevFiles) =>
      prevFiles.map((file) => (file.id === fileId ? { ...file, extractedData: updatedData } : file)),
    )
  }

  const handleRestart = () => {
    setCurrentStep("upload")
    // Don't clear files - preserve them
    setAnalysisResults(null)
  }

  const getCurrentStepIndex = () => {
    return steps.findIndex((step) => step.id === currentStep)
  }

  const handleLoadSampleData = () => {
    // Create mock file for sample data
    const sampleFile = new File(["sample"], "IRS_Form_1040_Sample.pdf", { type: "application/pdf" })
    const sampleTaxData = {
      firstName: "Soledad",
      lastName: "Garcia",
      socialSecurityNumber: "101782547",
      homeAddress: "1600 Pennsylvania Avenue NW",
      city: "Washington",
      state: "DC",
      zipCode: "20500",
      filingStatus: "single",
      exemptionYourself: "yes",
      totalExemptions: "1",
      wagesSalariesTips: "91118",
      businessIncome: "91118",
      rentalRealEstate: "1118",
      totalIncome: "92236",
      adjustedGrossIncome: "91118",
      standardDeduction: "12700",
      exemptionsAmount: "8100",
      taxableIncome: "70318",
      tax: "10374",
      federalIncomeTaxWithheld: "11478",
      overpaidAmount: "1104",
      taxpayerOccupation: "POTUS",
      // Initialize empty fields
      spouseFirstName: "",
      spouseLastName: "",
      spouseSocialSecurityNumber: "",
      apartmentNumber: "",
      foreignCountry: "",
      foreignProvince: "",
      foreignPostalCode: "",
      qualifyingPersonName: "",
      presidentialCampaignYou: "",
      presidentialCampaignSpouse: "",
      exemptionSpouse: "",
    }

    const mockFileWithPreview: FileWithPreview = {
      file: sampleFile,
      id: "sample-1040",
      progress: 100,
      status: "complete",
      previewUrl: undefined,
      extractedData: sampleTaxData,
    }

    // Add to existing files instead of replacing
    setFiles((prevFiles) => {
      const existingIds = prevFiles.map((f) => f.id)
      if (existingIds.includes("sample-1040")) {
        return prevFiles // Don't add duplicate
      }
      return [...prevFiles, mockFileWithPreview]
    })

    setCurrentStep("analysis")

    // Create analysis results
    const missingFields = Object.entries(sampleTaxData)
      .filter(([key, value]) => !value || value === "")
      .map(([key]) => key)

    const results = {
      totalFiles: 1,
      processedFiles: 1,
      extractedData: sampleTaxData,
      missingFields,
      confidence: 95,
      documentType: "IRS Form 1040 (2017) - Sample",
    }

    setAnalysisResults(results)
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Breadcrumb */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="w-full">
        <Breadcrumb>
          <BreadcrumbList>
            {steps.map((step, index) => {
              const isActive = step.id === currentStep
              const isCompleted = index < getCurrentStepIndex()
              const isAccessible = index <= getCurrentStepIndex()

              return (
                <div key={step.id} className="flex items-center">
                  <BreadcrumbItem>
                    <div className="flex items-center gap-2">
                      <div
                        className={`
                        w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors cursor-pointer
                        ${
                          isCompleted
                            ? "bg-primary text-primary-foreground hover:bg-primary/90"
                            : isActive
                              ? "bg-primary/20 text-primary border-2 border-primary"
                              : isAccessible
                                ? "bg-muted text-muted-foreground hover:bg-muted/80"
                                : "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                        }
                      `}
                        onClick={() => isAccessible && handleStepClick(step.id as Step)}
                      >
                        {isCompleted ? "✓" : index + 1}
                      </div>
                      <div className="hidden sm:block">
                        {isActive ? (
                          <BreadcrumbPage className="font-medium">{step.label}</BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink
                            className={`${
                              isAccessible ? "cursor-pointer hover:text-foreground" : "cursor-not-allowed opacity-50"
                            }`}
                            onClick={() => isAccessible && handleStepClick(step.id as Step)}
                          >
                            {step.label}
                          </BreadcrumbLink>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">{step.description}</p>
                      </div>
                    </div>
                  </BreadcrumbItem>
                  {index < steps.length - 1 && <BreadcrumbSeparator className="mx-4" />}
                </div>
              )
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </motion.div>

      {/* Step Content */}
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
      >
        {currentStep === "upload" && (
          <StepUpload
            onFilesUploaded={handleFilesUploaded}
            onNext={handleNextStep}
            onLoadSampleData={handleLoadSampleData}
            existingFiles={files}
          />
        )}

        {currentStep === "analysis" && (
          <StepAnalysis files={files} onNext={handleNextStep} onAnalysisComplete={handleAnalysisComplete} />
        )}

        {currentStep === "files" && (
          <StepFileManager
            files={files}
            onNext={handleNextStep}
            onFileDataUpdate={handleFileDataUpdate}
            onUploadNew={() => setCurrentStep("upload")}
          />
        )}

        {currentStep === "results" && analysisResults && (
          <StepResults results={analysisResults} onRestart={handleRestart} />
        )}
      </motion.div>
    </div>
  )
}

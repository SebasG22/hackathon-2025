import { DocumentProcessor } from "@/components/document-processor"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8 bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="w-full max-w-6xl">
        <div className="flex flex-col items-center text-center mb-8">
          <img src="/LoanSharks.png" alt="LoanShark Logo" className="w-64 h-64 object-contain mb-2 mt-8 drop-shadow-lg" />
          <h1 className="text-4xl font-bold text-foreground -mt-8 mb-2">Real Estate Underwriting Evaluation System</h1>
          <p className="text-lg text-muted-foreground">
            Upload, analyze, and assess mortgage documents with AI-powered underwriting.
          </p>
        </div>
        <DocumentProcessor />
      </div>
    </main>
  )
}

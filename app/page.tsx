import { DocumentProcessor } from "@/components/document-processor"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8 bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="w-full max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Real Estate Underwriting Evaluation System</h1>
          <p className="text-lg text-muted-foreground">
            Upload, analyze, and assess mortgage documents with AI-powered underwriting.
          </p>
        </div>
        <DocumentProcessor />
      </div>
    </main>
  )
}

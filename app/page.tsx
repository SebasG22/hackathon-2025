import { DocumentProcessor } from "@/components/document-processor"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8 bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="w-full max-w-6xl">
        <div className="flex flex-col items-center text-center mb-8">
          <img src="/LoanSharksLogo.png" alt="LoanShark Logo" className="w-48 h-48 object-contain drop-shadow-lg" />
          <h2 className="text-6xl font-extrabold bg-loanshark-gradient bg-clip-text text-transparent mb-6 tracking-tight" style={{ fontFamily: 'Inter, Helvetica Neue, Arial, sans-serif' }}>
            LoanShark IA
          </h2>
          <h1 className="text-5xl font-bold text-loanshark-neutral-dark mb-3 tracking-tight">
            Get mortgage confidence in{" "}
            <span className="bg-loanshark-gradient bg-clip-text text-transparent">under a minute</span>
          </h1>
          <p className="text-xl text-loanshark-neutral-dark/80 max-w-2xl leading-relaxed">
            Pre-approval in seconds for the self-employed. Upload your documents and get instant underwriting insights.
          </p>
        </div>
        <DocumentProcessor />
      </div>
    </main>
  )
}

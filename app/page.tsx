import { DocumentProcessor } from "@/components/document-processor"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8 bg-gradient-to-br from-loanshark-neutral-light via-white to-loanshark-neutral-light">
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
          <div className="flex items-center gap-4 mt-6 text-sm text-loanshark-neutral-dark/60">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-loanshark-teal rounded-full"></div>
              <span>Lightning-fast analysis</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-loanshark-navy rounded-full"></div>
              <span>AI-powered accuracy</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-loanshark-bolt rounded-full"></div>
              <span>Freelancer-friendly</span>
            </div>
          </div>
        </div>
        <DocumentProcessor />
      </div>
    </main>
  )
}

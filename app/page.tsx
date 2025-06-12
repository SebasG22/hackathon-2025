import { UploadDocuments } from "@/components/upload-documents"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24 bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="w-full max-w-4xl">
        <UploadDocuments />
      </div>
    </main>
  )
}

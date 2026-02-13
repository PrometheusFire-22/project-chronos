'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useSession } from '@/lib/auth-client'
import { FileDropzone } from '@/components/upload/FileDropzone'
import { ProcessingSteps } from '@/components/upload/ProcessingSteps'
import { ContactsTable } from '@/components/upload/ContactsTable'
import { Button } from '@chronos/ui/components/button'
import { ArrowRight, FileSearch, Brain, Download } from 'lucide-react'

type ViewState = 'upload' | 'processing' | 'results' | 'error' | 'limit_reached'

interface ExtractionResult {
  contacts: {
    name: string
    role: string
    firm: string
    email: string | null
    phone: string | null
    address: string | null
  }[]
  document_metadata: {
    case_name: string
    court_file_no: string
    filing_date: string | null
  }
}

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
}

export function UploadHero() {
  const { data: session } = useSession()
  const isAuthenticated = !!session?.user

  const [viewState, setViewState] = useState<ViewState>('upload')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [result, setResult] = useState<ExtractionResult | null>(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [upgradeUrl, setUpgradeUrl] = useState('')

  const handleFileSelected = useCallback((file: File) => {
    setSelectedFile(file)
  }, [])

  const handleClear = useCallback(() => {
    setSelectedFile(null)
  }, [])

  const handleReset = useCallback(() => {
    setSelectedFile(null)
    setResult(null)
    setErrorMessage('')
    setViewState('upload')
    setCurrentStep(0)
  }, [])

  const handleSubmit = useCallback(async () => {
    if (!selectedFile) return

    setViewState('processing')
    setCurrentStep(0)

    const formData = new FormData()
    formData.append('file', selectedFile)

    try {
      // Step 0: Parsing PDF (Docling)
      setCurrentStep(0)

      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      })

      // Move to step 1 after request sent (extraction happening server-side)
      setCurrentStep(1)

      if (!response.ok) {
        const error = await response.json()
        if (error.error === 'limit_reached') {
          setErrorMessage(error.message)
          setUpgradeUrl(error.upgrade_url || '/sign-up')
          setViewState('limit_reached')
          return
        }
        throw new Error(error.error || 'Processing failed')
      }

      // Step 2: Building results
      setCurrentStep(2)
      const data: ExtractionResult = await response.json()

      // Brief delay so user sees the final step complete
      await new Promise((resolve) => setTimeout(resolve, 400))
      setCurrentStep(3)

      setResult(data)
      setViewState('results')
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'An unexpected error occurred')
      setViewState('error')
    }
  }, [selectedFile])

  const handleDownloadCsv = useCallback(() => {
    if (!selectedFile || !result) return

    // Build CSV client-side from already-fetched result (no re-upload needed)
    const csvRows = [
      ['Name', 'Role', 'Firm', 'Email', 'Phone', 'Address'],
      ...result.contacts.map((c) => [
        c.name,
        c.role,
        c.firm,
        c.email || '',
        c.phone || '',
        c.address || '',
      ]),
    ]
    const csvContent = csvRows.map((row) =>
      row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')
    ).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = selectedFile.name.replace(/\.pdf$/i, '_contacts.csv')
    a.click()
    URL.revokeObjectURL(url)
  }, [selectedFile, result])

  return (
    <section className="relative overflow-hidden bg-background pb-16 pt-24 lg:pb-24 lg:pt-32">
      {/* Background gradient */}
      <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2">
        <div className="h-[500px] w-[800px] rounded-full bg-purple-500/10 blur-[120px]" />
      </div>

      <div className="container relative mx-auto px-4">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16"
        >
          {/* Left column — copy */}
          <motion.div variants={fadeIn} className="max-w-lg">
            <h1 className="heading-hero bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
              Extract contacts from CCAA filings
            </h1>
            <p className="text-body-lg mt-6">
              Upload any CCAA filing PDF and get a structured contact list in seconds.
              Names, roles, firms, emails, and phone numbers — extracted automatically.
            </p>

            {/* How it works */}
            <div className="mt-10 space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                How it works
              </h2>
              {[
                { icon: <FileSearch className="h-4 w-4" />, text: 'Upload a CCAA filing PDF' },
                { icon: <Brain className="h-4 w-4" />, text: 'AI parses and extracts all contacts' },
                { icon: <Download className="h-4 w-4" />, text: 'Download your structured CSV' },
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
                    {step.icon}
                  </div>
                  <span className="text-sm text-muted-foreground">{step.text}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right column — interactive area */}
          <motion.div variants={fadeIn} className="w-full">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-lg shadow-black/5">
              {viewState === 'upload' && (
                <div className="space-y-4">
                  <FileDropzone
                    onFileSelected={handleFileSelected}
                    selectedFile={selectedFile}
                    onClear={handleClear}
                  />
                  {selectedFile && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Button onClick={handleSubmit} className="w-full gap-2">
                        Extract Contacts
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  )}
                </div>
              )}

              {viewState === 'processing' && (
                <ProcessingSteps currentStep={currentStep} />
              )}

              {viewState === 'results' && result && (
                <ContactsTable
                  contacts={result.contacts}
                  metadata={result.document_metadata}
                  onDownloadCsv={handleDownloadCsv}
                  onReset={handleReset}
                  isAuthenticated={isAuthenticated}
                />
              )}

              {viewState === 'limit_reached' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4 text-center py-4"
                >
                  <p className="text-sm text-muted-foreground">{errorMessage}</p>
                  <a href={upgradeUrl}>
                    <Button className="gap-2">
                      {isAuthenticated ? 'Upgrade Plan' : 'Sign Up Free'}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </a>
                  <div>
                    <Button variant="ghost" size="sm" onClick={handleReset}>
                      Back
                    </Button>
                  </div>
                </motion.div>
              )}

              {viewState === 'error' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4 text-center"
                >
                  <p className="text-sm text-red-400">{errorMessage}</p>
                  <Button variant="outline" onClick={handleReset}>
                    Try Again
                  </Button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

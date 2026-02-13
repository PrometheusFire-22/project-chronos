'use client'

import { motion } from 'framer-motion'
import { Loader2, Check, FileSearch, Brain, TableProperties } from 'lucide-react'

export type StepStatus = 'pending' | 'active' | 'done'

interface Step {
  label: string
  icon: React.ReactNode
  status: StepStatus
}

interface ProcessingStepsProps {
  currentStep: number // 0 = parsing, 1 = extracting, 2 = building
}

const stepDefs = [
  { label: 'Parsing PDF', icon: <FileSearch className="h-4 w-4" /> },
  { label: 'Extracting contacts', icon: <Brain className="h-4 w-4" /> },
  { label: 'Building results', icon: <TableProperties className="h-4 w-4" /> },
]

function StepIndicator({ status }: { status: StepStatus }) {
  if (status === 'done') {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500"
      >
        <Check className="h-3.5 w-3.5 text-white" />
      </motion.div>
    )
  }
  if (status === 'active') {
    return (
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-500">
        <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
      </div>
    )
  }
  return (
    <div className="flex h-6 w-6 items-center justify-center rounded-full border border-border bg-muted" />
  )
}

export function ProcessingSteps({ currentStep }: ProcessingStepsProps) {
  const steps: Step[] = stepDefs.map((def, i) => ({
    ...def,
    status: i < currentStep ? 'done' : i === currentStep ? 'active' : 'pending',
  }))

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3 rounded-xl border border-border bg-card p-5"
    >
      {steps.map((step, i) => (
        <div key={i} className="flex items-center gap-3">
          <StepIndicator status={step.status} />
          <span className="text-muted-foreground">{step.icon}</span>
          <span
            className={`text-sm ${
              step.status === 'active'
                ? 'font-medium text-foreground'
                : step.status === 'done'
                  ? 'text-muted-foreground'
                  : 'text-muted-foreground/50'
            }`}
          >
            {step.label}
          </span>
        </div>
      ))}
    </motion.div>
  )
}

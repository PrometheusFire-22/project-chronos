'use client'

import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface FileDropzoneProps {
  onFileSelected: (file: File) => void
  selectedFile: File | null
  onClear: () => void
}

export function FileDropzone({ onFileSelected, selectedFile, onClear }: FileDropzoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFileSelected(acceptedFiles[0])
      }
    },
    [onFileSelected]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024, // 50MB
    disabled: !!selectedFile,
  })

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {selectedFile ? (
          <motion.div
            key="selected"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex items-center gap-3 rounded-xl border border-purple-500/30 bg-purple-500/5 p-4"
          >
            <FileText className="h-8 w-8 shrink-0 text-purple-400" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {selectedFile.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {(selectedFile.size / 1024).toFixed(0)} KB
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onClear()
              }}
              className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              {...getRootProps()}
              className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-all duration-200 ${
                isDragActive
                  ? 'border-purple-500 bg-purple-500/10'
                  : 'border-border hover:border-purple-500/50 hover:bg-purple-500/5'
              }`}
            >
              <input {...getInputProps()} />
              <Upload
                className={`mx-auto mb-3 h-8 w-8 transition-colors ${
                  isDragActive ? 'text-purple-400' : 'text-muted-foreground'
                }`}
              />
              <p className="text-sm font-medium text-foreground">
                {isDragActive ? 'Drop your PDF here' : 'Drag & drop a CCAA filing PDF'}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                or click to browse (max 50MB)
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

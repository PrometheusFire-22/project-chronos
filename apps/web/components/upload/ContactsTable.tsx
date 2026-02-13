'use client'

import { motion } from 'framer-motion'
import { Download, RotateCcw, UserPlus } from 'lucide-react'
import { Button } from '@chronos/ui/components/button'

interface Contact {
  name: string
  role: string
  firm: string
  email: string | null
  phone: string | null
  address: string | null
}

interface DocumentMetadata {
  case_name: string
  court_file_no: string
  filing_date: string | null
}

interface ContactsTableProps {
  contacts: Contact[]
  metadata: DocumentMetadata
  onDownloadCsv: () => void
  onReset: () => void
  isAuthenticated: boolean
}

export function ContactsTable({
  contacts,
  metadata,
  onDownloadCsv,
  onReset,
  isAuthenticated,
}: ContactsTableProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Metadata header */}
      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="heading-card text-base">{metadata.case_name}</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          {metadata.court_file_no}
          {metadata.filing_date && ` \u2022 ${metadata.filing_date}`}
          {` \u2022 ${contacts.length} contacts found`}
        </p>
      </div>

      {/* Results table */}
      <div className="max-h-[360px] overflow-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="sticky top-0 border-b border-border bg-muted/80 backdrop-blur-sm">
            <tr>
              <th className="px-3 py-2 text-left font-medium text-muted-foreground">Name</th>
              <th className="px-3 py-2 text-left font-medium text-muted-foreground">Role</th>
              <th className="px-3 py-2 text-left font-medium text-muted-foreground">Firm</th>
              <th className="hidden px-3 py-2 text-left font-medium text-muted-foreground md:table-cell">
                Email
              </th>
              <th className="hidden px-3 py-2 text-left font-medium text-muted-foreground lg:table-cell">
                Phone
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {contacts.map((contact, i) => (
              <tr key={i} className="transition-colors hover:bg-muted/40">
                <td className="px-3 py-2 font-medium text-foreground">{contact.name}</td>
                <td className="px-3 py-2 text-muted-foreground">{contact.role}</td>
                <td className="px-3 py-2 text-muted-foreground">{contact.firm}</td>
                <td className="hidden px-3 py-2 text-muted-foreground md:table-cell">
                  {contact.email || '\u2014'}
                </td>
                <td className="hidden px-3 py-2 text-muted-foreground lg:table-cell">
                  {contact.phone || '\u2014'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={onDownloadCsv} className="gap-2">
          <Download className="h-4 w-4" />
          Download CSV
        </Button>
        <Button variant="outline" onClick={onReset} className="gap-2">
          <RotateCcw className="h-4 w-4" />
          Upload Another
        </Button>
      </div>

      {!isAuthenticated && (
        <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-4">
          <div className="flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-purple-400" />
            <p className="text-sm text-muted-foreground">
              <a href="/sign-up" className="font-medium text-purple-400 hover:underline">
                Sign up
              </a>{' '}
              to save extractions and get 3 free documents per month.
            </p>
          </div>
        </div>
      )}
    </motion.div>
  )
}

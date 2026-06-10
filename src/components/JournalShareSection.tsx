import { useState } from 'react'
import ConfirmDialog from './ConfirmDialog'
import {
  useCreateJournalShare,
  useDeleteJournalShare,
  useJournalShare,
} from '../hooks/useJournalShare'

type Props = { journalId: string }

function JournalShareSection({ journalId }: Props) {
  const { data: share } = useJournalShare(journalId)
  const createShare = useCreateJournalShare()
  const deleteShare = useDeleteJournalShare()
  const [copied, setCopied] = useState(false)
  const [confirm, setConfirm] = useState<'rotate' | 'revoke' | null>(null)

  const url = share ? `${window.location.origin}/share/${share.token}` : ''

  function copy() {
    navigator.clipboard.writeText(url).then(
      () => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      },
      () => setCopied(false),
    )
  }

  return (
    <div className="mb-6 rounded-lg bg-white p-4 shadow-sm">
      <h2 className="text-sm font-semibold text-slate-800">Teilen</h2>

      {!share ? (
        <div className="mt-2">
          <p className="text-sm text-slate-600">
            Erstelle einen Link, um deine Reise mit anderen zu teilen, welche kein Konto haben.
          </p>
          <button
            onClick={() => createShare.mutate(journalId)}
            disabled={createShare.isPending}
            className="mt-3 rounded-md bg-blue-600 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            Link erzeugen
          </button>
        </div>
      ) : (
        <div className="mt-2 space-y-3">
          <p className="text-xs text-slate-500">
            Wer diesen Link hat, kann das Tagebuch sehen. Teile ihn nur mit Personen, denen du
            vertraust.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              readOnly
              value={url}
              onFocus={(e) => e.target.select()}
              className="min-w-0 flex-1 rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-700"
            />
            <button
              onClick={copy}
              className="shrink-0 rounded-md bg-blue-600 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-700"
            >
              {copied ? 'Kopiert' : 'Kopieren'}
            </button>
          </div>
          <div className="flex gap-4 text-sm">
            <button onClick={() => setConfirm('rotate')} className="text-blue-600 hover:underline">
              Neuen Link erzeugen
            </button>
            <button onClick={() => setConfirm('revoke')} className="text-red-600 hover:underline">
              Link deaktivieren
            </button>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={confirm === 'rotate'}
        title="Neuen Link erzeugen"
        message="Der bisherige Link wird damit ungültig. Fortfahren?"
        confirmLabel="Neuen Link erzeugen"
        isProcessing={createShare.isPending}
        onConfirm={() => {
          createShare.mutate(journalId)
          setConfirm(null)
        }}
        onCancel={() => setConfirm(null)}
      />
      <ConfirmDialog
        isOpen={confirm === 'revoke'}
        title="Link deaktivieren"
        message="Der Link funktioniert danach nicht mehr. Fortfahren?"
        confirmLabel="Deaktivieren"
        isProcessing={deleteShare.isPending}
        onConfirm={() => {
          deleteShare.mutate(journalId)
          setConfirm(null)
        }}
        onCancel={() => setConfirm(null)}
      />
    </div>
  )
}

export default JournalShareSection

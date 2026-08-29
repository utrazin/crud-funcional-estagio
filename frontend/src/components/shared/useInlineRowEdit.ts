import { useState, useCallback } from 'react'

/**
 * Estado compartilhado para edição inline em linhas de tabela (Produtos, Clientes).
 * Só uma linha pode estar em edição por vez.
 */
export function useInlineRowEdit<TDraft>() {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState<TDraft | null>(null)

  const startEdit = useCallback((id: string, initialDraft: TDraft) => {
    setEditingId(id)
    setDraft(initialDraft)
  }, [])

  const updateDraft = useCallback((patch: Partial<TDraft>) => {
    setDraft((prev) => (prev ? { ...prev, ...patch } : prev))
  }, [])

  const cancel = useCallback(() => {
    setEditingId(null)
    setDraft(null)
  }, [])

  return { editingId, draft, startEdit, updateDraft, cancel, setEditingId }
}

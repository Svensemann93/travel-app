export const journalsKeys = {
  all: ['journals'] as const,
  lists: () => [...journalsKeys.all, 'list'] as const,
  list: (userId: string) => [...journalsKeys.lists(), userId] as const,
  details: () => [...journalsKeys.all, 'detail'] as const,
  detail: (journalId: string) => [...journalsKeys.details(), journalId] as const,
}

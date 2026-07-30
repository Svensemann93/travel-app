import { useMutation } from '@tanstack/react-query'
import { useAuth } from './useAuth'
import { useUpdateProfile } from './useUpdateProfile'
import { uploadProfileImage, deleteProfileImage } from '../lib/profileImages'
import type { ProfileImageKind } from '../lib/profileImagePath'

export function useUploadProfileImage() {
  const { user, profile } = useAuth()
  const update = useUpdateProfile()

  return useMutation({
    mutationFn: async ({ kind, file }: { kind: ProfileImageKind; file: File }) => {
      if (!user) throw new Error('Not authenticated')
      const previous = kind === 'avatar' ? profile?.avatar_path : profile?.cover_path
      const path = await uploadProfileImage(user.id, kind, file)
      await update.mutateAsync(kind === 'avatar' ? { avatar_path: path } : { cover_path: path })
      if (previous) await deleteProfileImage(previous).catch(() => {})
    },
  })
}

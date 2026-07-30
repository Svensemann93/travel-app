export type ProfileImageKind = 'avatar' | 'cover'

export function buildProfileImagePath(userId: string, kind: ProfileImageKind, id: string): string {
  return `${userId}/${kind}_${id}.jpg`
}

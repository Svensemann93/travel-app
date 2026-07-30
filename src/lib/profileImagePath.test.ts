import { describe, expect, it } from 'vitest'
import { buildProfileImagePath } from './profileImagePath'

describe('buildProfileImagePath', () => {
  it('places the file in the user folder with the kind prefix', () => {
    expect(buildProfileImagePath('user-1', 'avatar', 'abc')).toBe('user-1/avatar_abc.jpg')
  })

  it('supports the cover kind', () => {
    expect(buildProfileImagePath('user-1', 'cover', 'xyz')).toBe('user-1/cover_xyz.jpg')
  })

  it('keeps the owner id as the first path segment', () => {
    expect(buildProfileImagePath('owner', 'avatar', 'id').split('/')[0]).toBe('owner')
  })
})

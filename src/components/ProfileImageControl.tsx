import { useRef, useState, type ChangeEvent, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useUpdateProfile } from '../hooks/useUpdateProfile'
import { useUploadProfileImage } from '../hooks/useUploadProfileImage'
import type { ProfileImageKind } from '../lib/profileImagePath'
import HeaderMenu from './HeaderMenu'
import ProfileImageFocusEditor from './ProfileImageFocusEditor'

type Props = {
  kind: ProfileImageKind
  src: string
  focusX: number
  focusY: number
  hasImage: boolean
  menuLabel: string
  triggerClassName: string
  icon: ReactNode
}

function ProfileImageControl({
  kind,
  src,
  focusX,
  focusY,
  hasImage,
  menuLabel,
  triggerClassName,
  icon,
}: Props) {
  const { t } = useTranslation('profile')
  const inputRef = useRef<HTMLInputElement>(null)
  const [editing, setEditing] = useState(false)
  const upload = useUploadProfileImage()
  const update = useUpdateProfile()

  function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (file) upload.mutate({ kind, file })
  }

  const items = [
    { label: t('image.change'), onClick: () => inputRef.current?.click() },
    ...(hasImage ? [{ label: t('image.adjustCrop'), onClick: () => setEditing(true) }] : []),
  ]

  return (
    <div className="relative">
      <HeaderMenu label={menuLabel} icon={icon} triggerClassName={triggerClassName} items={items} />
      <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
      {editing && (
        <ProfileImageFocusEditor
          src={src}
          focusX={focusX}
          focusY={focusY}
          shape={kind}
          onCancel={() => setEditing(false)}
          onSave={(x, y) => {
            update.mutate(
              kind === 'avatar'
                ? { avatar_focus_x: x, avatar_focus_y: y }
                : { cover_focus_x: x, cover_focus_y: y },
            )
            setEditing(false)
          }}
        />
      )}
      {upload.isError && (
        <p className="absolute right-0 top-full z-20 mt-1 whitespace-nowrap rounded bg-red-600 px-2 py-1 text-xs text-white">
          {(upload.error as Error).message}
        </p>
      )}
    </div>
  )
}

export default ProfileImageControl

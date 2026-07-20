export function isPublicAsset(value: string): boolean {
  return value.startsWith('http://') || value.startsWith('https://') || value.startsWith('/')
}

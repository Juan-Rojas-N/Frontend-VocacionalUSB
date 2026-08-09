const TOKEN_STORAGE_KEY = 'usb_vocacional_access_token'

export function setAccessToken(token: string): void {
  window.localStorage.setItem(TOKEN_STORAGE_KEY, token)
}

export function getAccessToken(): string | null {
  return window.localStorage.getItem(TOKEN_STORAGE_KEY)
}

export function clearAccessToken(): void {
  window.localStorage.removeItem(TOKEN_STORAGE_KEY)
}

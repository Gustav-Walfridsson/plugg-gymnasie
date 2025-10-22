// Redact emails if accidentally passed
export function log(message: string, data?: any) {
  const sanitized = data ? JSON.parse(
    JSON.stringify(data).replace(/[\w.-]+@[\w.-]+\.\w+/g, '[EMAIL]')
  ) : undefined
  console.log(message, sanitized)
}

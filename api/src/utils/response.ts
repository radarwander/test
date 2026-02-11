export const ok = (data: unknown = null, message = 'success', meta?: Record<string, unknown>) => ({
  code: 0,
  message,
  data,
  meta: meta ?? null
});

export class AppError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

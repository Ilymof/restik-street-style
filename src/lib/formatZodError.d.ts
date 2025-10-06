import type { ZodError } from 'zod';
declare module '../lib/formatZodError' {
  export function formatZodError(error: ZodError): string;
}
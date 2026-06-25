export interface EmailJob {
  email: string;
  subject: string;
  html: string;
  meta?: Record<string, unknown>;
}

type AuthAlertProps = {
  message?: string;
  tone?: 'success' | 'danger';
};

export function AuthAlert({ message, tone = 'danger' }: AuthAlertProps) {
  if (!message) {
    return null;
  }

  const className =
    tone === 'success'
      ? 'border-emerald-400/25 bg-emerald-500/10 text-emerald-200'
      : 'border-red-400/25 bg-red-500/10 text-red-200';

  return (
    <p className={`rounded-lg border px-3 py-2 text-sm leading-5 ${className}`}>
      {message}
    </p>
  );
}

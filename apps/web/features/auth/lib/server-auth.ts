import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { AuthSession } from './auth-api';

const apiUrl =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export async function getServerSession() {
  const headersList = await headers();
  const cookie = headersList.get('cookie');

  const response = await fetch(`${apiUrl}/api/auth/get-session`, {
    headers: cookie ? { cookie } : undefined,
    cache: 'no-store',
  });

  if (!response.ok) {
    return null;
  }

  const text = await response.text();

  if (!text) {
    return null;
  }

  return JSON.parse(text) as AuthSession | null;
}

export async function requireServerSession() {
  const session = await getServerSession();

  if (!session) {
    redirect('/sign-in');
  }

  return session;
}

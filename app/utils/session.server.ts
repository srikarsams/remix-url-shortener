import type { User } from '@prisma/client';
import { createCookieSessionStorage, redirect } from '@remix-run/node';
import bcrypt from 'bcryptjs';

import { db } from './db.server';

type Form = {
  username: string;
  password: string;
};

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  throw new Error('Session secret not set');
}

const storage = createCookieSessionStorage({
  cookie: {
    name: 'shortie_session',
    secure: process.env.NODE_ENV === 'production',
    secrets: [sessionSecret],
    sameSite: 'lax',
    path: '/',
    maxAge: 30 * 24 * 60 * 60,
    httpOnly: true,
  },
});

export async function getUser(username: string) {
  const user = await db.user.findUnique({
    where: {
      username: username,
    },
    select: {
      username: true,
      id: true,
      passwordHash: true,
    },
  });
  return user;
}

export async function login({ username, password }: Form) {
  const user = await getUser(username);
  if (!user) return null;

  const isValidPassword = await bcrypt.compare(password, user.passwordHash);
  console.log(isValidPassword, 'd');
  if (!isValidPassword) return null;

  return { username, id: user.id };
}

export async function register({ username, password }: Form) {
  const passwordHash = await bcrypt.hash(password, 10);

  const user = await db.user.create({
    data: {
      username,
      passwordHash,
    },
  });

  return { username, id: user.id };
}

export async function logout(request: Request) {
  const session = await getUserSession(request);
  return redirect('/login', {
    headers: {
      'Set-Cookie': await storage.destroySession(session),
    },
  });
}

function getUserSession(request: Request) {
  return storage.getSession(request.headers.get('Cookie'));
}

export async function getUserId(request: Request) {
  const session = await getUserSession(request);
  const userId = session.get('userId');
  if (!userId || typeof userId !== 'string') return null;
  return userId;
}

export async function getUserById(userId: string): Promise<User> {
  const user = await db.user.findUnique({
    where: {
      id: userId,
    },
  });
  return user!;
}

export async function requireUserId(request: Request) {
  const redirectUrl = new URL(request.url).pathname;

  const session = await getUserSession(request);
  const userId = session.get('userId');
  if (!userId || typeof userId !== 'string') {
    const searchParams = new URLSearchParams([['redirectTo', redirectUrl]]);
    throw redirect(`/login?${searchParams}`);
  }
  return userId;
}

export async function createUserSession(userId: string, redirectTo: string) {
  const session = await storage.getSession();
  session.set('userId', userId);
  return redirect(redirectTo, {
    headers: {
      'Set-Cookie': await storage.commitSession(session),
    },
  });
}

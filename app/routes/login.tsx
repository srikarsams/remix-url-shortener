import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useActionData } from '@remix-run/react';
import Button from '~/components/button';
import InputField from '~/components/input-field';
import {
  createUserSession,
  getUser,
  getUserId,
  login,
  register,
} from '~/utils/session.server';

type ActionData = {
  formError?: string;
  fieldErrors?: {
    username: string | undefined;
    password: string | undefined;
  };
  fields?: {
    username: string;
    password: string;
  };
};

const badRequest = (data: ActionData) => json(data, { status: 400 });

const validateUsername = (username: unknown) => {
  if (typeof username !== 'string' || username.length < 6) {
    return `Username must be atleast 6 chars long`;
  }
};

const validatePassword = (password: unknown) => {
  if (typeof password !== 'string' || password.length < 6) {
    return `Password must be atleast 6 chars long`;
  }
};

export const action: ActionFunction = async ({ request }) => {
  const url = new URL(request.url).searchParams.get('redirectTo') || '/shorten';
  const form = await request.formData();
  const username = form.get('username');
  const password = form.get('password');

  if (typeof username !== 'string' || typeof password !== 'string') {
    return badRequest({ formError: 'Invalid form data' });
  }

  const fields = { username, password };
  const fieldErrors = {
    username: validateUsername(username),
    password: validatePassword(password),
  };
  if (Object.values(fieldErrors).some(Boolean)) {
    return badRequest({ fieldErrors, fields });
  }

  // if user exists, perform login
  if (await getUser(username)) {
    const user = await login({ username, password });
    if (!user) {
      return badRequest({
        fields,
        formError: 'Username/Password combination is incorrect.',
      });
    }
    return createUserSession(user.id, url);
  }

  // else perform registration
  const user = await register({ username, password });
  return createUserSession(user.id, url);
};

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await getUserId(request);

  // If already logged in, redirect
  if (userId) {
    return redirect('/shorten');
  }
  return null;
};

export default function Login() {
  const actionData = useActionData<ActionData>();
  return (
    <div className="min-h-screen flex flex-col justify-center items-center mx-4">
      <h1 className="text-2xl">Let's shorten!</h1>
      {actionData?.formError && (
        <p className="text-center text-xs text-red-500 mt-2">
          {actionData.formError}
        </p>
      )}
      <form
        className="w-full max-w-sm flex flex-col justify-center items-center mt-4"
        method="post"
      >
        <InputField
          name="username"
          type="text"
          value={actionData?.fields?.username}
          placeholder="Username"
          error={actionData?.fieldErrors?.username || ''}
        />
        <InputField
          name="password"
          type="password"
          value={actionData?.fields?.password}
          placeholder="Password"
          error={actionData?.fieldErrors?.password || ''}
        />
        <Button type={'submit'}>Login / Signup</Button>
      </form>
    </div>
  );
}

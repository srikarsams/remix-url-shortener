import type { url } from '@prisma/client';
import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useActionData, useLoaderData } from '@remix-run/react';
import React, { Fragment, useState } from 'react';
import Button from '~/components/button';
import InputField from '~/components/input-field';
import LinkCard from '~/components/link-card';
import { db } from '~/utils/db.server';
import { requireUserId, getUserById, logout } from '~/utils/session.server';

type ActionData = {
  formError?: string;
  fieldErrors?: {
    url: string | undefined;
    name?: string | undefined;
  };
  fields?: {
    url: string;
    name: string;
  };
};

type LoaderData = {
  urls: url[];
  username: string;
};

const badRequest = (data: ActionData) => json(data, { status: 400 });

const validateUrl = (url: string) => {
  const urlRegex = new RegExp(
    /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/
  );
  const isValid = urlRegex.test(url);
  if (!isValid) {
    return 'Invalid URL. Please try the valid one!';
  }
};

const validateName = (name: string) => {
  if (!name.length) return 'name must be atleast 1 character long';
};

export const loader: LoaderFunction = async ({ request }) => {
  // redirects the user to /login if not logged in
  const userId = await requireUserId(request);
  const user = await getUserById(userId);
  if (!user) {
    return logout(request);
  }
  const urls = await db.url.findMany({
    where: {
      userId,
    },
  });
  return json({ urls, username: user.username });
};

export const action: ActionFunction = async ({ request }) => {
  // redirects the user to /login if not logged in
  const userId = await requireUserId(request);

  const formData = await request.formData();
  const url = formData.get('url');
  const name = formData.get('name');

  if (typeof url !== 'string' || typeof name !== 'string') {
    return badRequest({
      formError: 'Invalid form data. Please try again',
    });
  }

  const fieldErrors = {
    url: validateUrl(url),
    name: validateName(name),
  };
  const fields = { url, name };
  if (Object.values(fieldErrors).some(Boolean)) {
    return badRequest({ fieldErrors, fields });
  }

  const urlObj = await db.url.findFirst({
    where: {
      userId,
      url,
    },
  });

  if (urlObj) {
    return badRequest({
      fieldErrors: {
        url: 'URL already shortened. Please try a new one!',
      },
    });
  }

  const newUrlObj = await db.url.create({
    data: {
      url,
      userId,
      name,
    },
  });

  return json({
    url: newUrlObj.url,
    slug: newUrlObj.slug,
  });
};

export default function Shorten() {
  const actionData = useActionData<ActionData>();
  const loaderData = useLoaderData<LoaderData>();

  const [cuid, setCuid] = useState('');
  return (
    <div className="my-3 mx-2 mt-16 flex flex-col max-w-sm lg:mx-auto">
      <form
        action="/logout"
        method="post"
        className="absolute top-2 right-2 lg:top-6 lg:right-6"
      >
        <button type="submit" className="underline font-semibold">
          Logout
        </button>
      </form>
      <h1 className="font-semibold text-lg text-gray-700 mb-8">
        Hey, {loaderData.username}👋
      </h1>
      {actionData?.formError && (
        <p className="text-center text-xs text-red-500 mt-2">
          {actionData.formError}
        </p>
      )}
      <form method="post" className="w-full mt-4 ">
        <InputField
          name="name"
          placeholder="Please enter the url name"
          type="text"
          value={actionData?.fields?.name}
          error={actionData?.fieldErrors?.name}
        />
        <InputField
          name="url"
          placeholder="Please enter the url to be shortened"
          type="text"
          value={actionData?.fields?.url}
          error={actionData?.fieldErrors?.url}
        />
        <div className="text-center">
          <Button type="submit">Shorten</Button>
        </div>
      </form>
      <div className="mt-10 flex-1">
        <h2 className="font-semibold text-center text-xl mb-4">
          Previously shortened URLs
        </h2>
        {loaderData.urls.length ? (
          loaderData.urls.map((url, index) => {
            return (
              <Fragment key={url.id}>
                <div
                  className={`border-2 border-b-0 ${
                    loaderData.urls.length === index + 1 ? 'border-b-2' : ''
                  } px-2`}
                >
                  <div className={`flex justify-between`}>
                    <a
                      href={`/${url.slug}`}
                      className="font-semibold font-mono text-gray-600 hover:underline w-11/12 py-0.5 border-r-2 text-ellipsis overflow-hidden whitespace-nowrap"
                    >
                      {url.url}
                    </a>
                    <button
                      className="pl-2 hover:underline text-xs"
                      onClick={() => setCuid(cuid === url.slug ? '' : url.slug)}
                    >
                      Details
                    </button>
                  </div>
                </div>
                <LinkCard url={url} isOpen={url.slug === cuid} />
              </Fragment>
            );
          })
        ) : (
          <p className="text-center text-gray-500 mt-12">
            No URLs shortened yet :(
          </p>
        )}
      </div>
    </div>
  );
}

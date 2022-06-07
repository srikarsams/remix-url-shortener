import type { LoaderFunction } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { db } from '~/utils/db.server';

export const loader: LoaderFunction = async ({ params }) => {
  const slug = params.slug;

  const url = await db.url.findFirst({
    where: {
      slug,
    },
  });

  if (!url) {
    return redirect('/');
  }

  return redirect(url.url, {
    headers: {
      'Cache-Control': 'public, max-age=604800',
    },
  });
};

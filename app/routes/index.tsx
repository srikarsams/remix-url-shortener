import type { LoaderFunction } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { useNavigate } from '@remix-run/react';
import Button from '~/components/button';
import { getUserId } from '~/utils/session.server';

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await getUserId(request);

  // If already logged in, redirect
  if (userId) {
    return redirect('/shorten');
  }
  return null;
};

export default function Index() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col justify-center items-center">
      <h2 className="text-5xl font-bold text-center mb-4">
        Short links, big results
      </h2>
      <Button onClick={() => navigate('/login')}>Try for Free</Button>
    </div>
  );
}

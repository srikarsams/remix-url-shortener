import { useNavigate } from '@remix-run/react';
import Button from '~/components/button';

export default function Index() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col justify-center items-center">
      <h2 className="text-5xl font-bold text-center">
        Short links, big results
      </h2>
      <Button onClick={() => navigate('/login')}>Try for Free</Button>
    </div>
  );
}

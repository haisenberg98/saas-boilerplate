'use client';

import { useClerk } from '@clerk/nextjs';
import Button from '@/components/global/Button';

const SignOut = () => {
  const { signOut } = useClerk();

  return (
    <div>
      <Button onClick={() => signOut({ redirectUrl: '/login' })}>Logout</Button>
    </div>
  );
};

export default SignOut;

'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

export default function Guard({ children }) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const user = useSelector((state) => state.auth.user);
  useEffect(() => {
 
    if (!user) {
      router.push('/login');
    } else {
      setChecked(true);
    }
  }, []);

  if (!checked) return null;
  return <>{children}</>;
}

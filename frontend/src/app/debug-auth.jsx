'use client';
import { useSelector } from 'react-redux';

export default function DebugAuth() {
  const user = useSelector((state) => state.auth.user);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  return (
    <div className="p-4 border mt-4 bg-white rounded-lg shadow-md text-black">
      <h2 className="text-lg font-bold">🔍 Redux Auth Debug</h2>
      <pre>{JSON.stringify({ isAuthenticated, user }, null, 2)}</pre>
    </div>
  );
}

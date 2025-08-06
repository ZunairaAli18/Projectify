'use client';

import Board from '../components/Board.js';

export default function UserStoryDashboard() {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* You can later add sidebar or navbar above */}
      
      <div className="max-w-7xl mx-auto">
        <Board />
      </div>
    </div>
  );
}

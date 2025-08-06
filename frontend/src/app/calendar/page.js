'use client';

import { useState } from 'react';
import CustomCalendar from '../components/CustomCalendar'; // adjust path as needed

export default function CalendarPage() {
  const [showCalendar, setShowCalendar] = useState(false);

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <button
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        onClick={() => setShowCalendar(!showCalendar)}
      >
        {showCalendar ? 'Hide Calendar' : 'Show Calendar'}
      </button>

      {showCalendar && (
        <div className="mt-8">
          <CustomCalendar />
        </div>
      )}
    </div>
  );
}

"use client";

export default function Header({
  onAddProjectClick,
  onAddUserClick,
  onSearch,
}) {
  return (
    <header className="h-[100px] w-full px-6 py-3 bg-[#1B3C53] shadow-md flex justify-between items-center rounded-2xl">
      <h1 className="text-4xl text-white font-semibold">Project Dashboard</h1>

      <div className="flex items-center gap-4">
        <input
          type="text"
          placeholder="Search projects..."
          onChange={(e) => onSearch(e.target.value)}
          className="px-3 py-2 w-[250px] rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-black bg-white"
        />

        <button
          onClick={onAddProjectClick}
          className="px-4 py-2 bg-[#58A0C8] text-white rounded hover:bg-yellow-500 transition text-lg font-bold"
        >
          Add Project
        </button>

        <button
          onClick={onAddUserClick}
          className="px-4 py-2 bg-[#58A0C8] text-white rounded hover:bg-green-600 transition text-lg font-bold"
        >
          Add User
        </button>
      </div>
    </header>
  );
}

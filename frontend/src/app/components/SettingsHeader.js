"use client";

export default function Header({
  onAddProjectClick,
  onAddUserClick,
  onSearch,
}) {
  return (
    <header className="h-[100px] w-full px-6 py-3 bg-[#1B3C53] shadow-md flex justify-between  items-center rounded-2xl">
      <h1 className="text-5xl text-white font-semibold">Accounts Centre</h1>
    </header>
  );
}

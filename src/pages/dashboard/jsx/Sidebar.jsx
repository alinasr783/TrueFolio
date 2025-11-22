"use client";

import { SessionNavBar } from "@/components/ui/sidebar"

export default function Sidebar() {
  return (
    <div className="absolute flex h-screen flex-row">
      <div className="absolute top-0 left-0">
        <SessionNavBar />
      </div>
      <main className="flex h-screen grow flex-col overflow-auto">
    
      </main>
    </div>
  );
}
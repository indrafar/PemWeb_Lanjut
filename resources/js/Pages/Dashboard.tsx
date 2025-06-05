import { Input } from '@/Components/ui/input';
import { Button } from '@/Components/ui/button';
import { Card } from '@/Components/ui/Card';
import { Search } from 'lucide-react';

export default function Dashboard() {
  return (
    <div className="min-h-screen grid grid-cols-[250px_1fr] bg-[#A1B6D9] text-[#1B355E]">
      {/* Sidebar */}
      <aside className="p-6 flex flex-col gap-6">
        <div className="text-white text-xl font-bold flex items-center gap-2">
          <img src="/PemWeb_Lanjut/public/images/logonoted.png" alt="Logo" className="w-40 h-auto" />

        </div>
        <nav className="flex flex-col gap-4 text-sm">
          <a href="#" className="hover:font-semibold">Dashboard</a>
          <a href="#" className="hover:font-semibold">Task</a>
          <a href="#" className="hover:font-semibold">Projects</a>
          <a href="#" className="hover:font-semibold">Notifications</a>
          <a href="#" className="hover:font-semibold">Trash</a>
        </nav>
        <div className="mt-auto text-sm text-white">Setting</div>
      </aside>

      {/* Main content */}
      <main className="p-6 space-y-6">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <div className="relative w-1/2">
            <Input placeholder="Search" className="pl-10 rounded-full" />
            <Search className="absolute top-2.5 left-3 w-4 h-4 text-gray-500" />
          </div>
          <Button className="rounded-full bg-white text-[#1B355E] px-6 py-1">Profile</Button>
        </div>

        {/* Grid layout */}
        <div className="grid grid-cols-3 gap-4">
          {/* Project cards */}
          <Card className="h-24 bg-[#7A9BC2] flex items-center justify-center font-semibold">Project</Card>
          <Card className="h-24 bg-[#7A9BC2] flex items-center justify-center font-semibold">Project</Card>
          <Card className="h-24 bg-[#7A9BC2] flex items-center justify-center font-semibold">Project</Card>
        </div>

        {/* Middle section */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="col-span-2 bg-[#7A9BC2] p-4">
            <div className="font-semibold mb-2">Notifikasi</div>
            <div className="bg-white h-24 rounded-md"></div>
          </Card>
          <Card className="bg-[#7A9BC2] p-4">Calendar</Card>
        </div>

        {/* Bottom section */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="h-40 bg-[#7A9BC2] flex items-center justify-center">
            <div className="w-20 h-20 border-8 border-[#1B355E] rounded-full border-t-transparent animate-spin-slow"></div>
          </Card>
          <Card className="h-40 bg-[#7A9BC2]"><p>tes</p></Card>
          <Card className="h-40 bg-[#7A9BC2] p-4 text-sm">
            <p>Orang orang yang ada di project</p>
            <p>EZA</p>
            <p>Indra boomers kelahiran 1890 SM</p>
            <p>Khai cantik kata eza</p>
            <p>Rapli mati lampu alah pepe</p>
          </Card>
        </div>
      </main>
    </div>
  );
}

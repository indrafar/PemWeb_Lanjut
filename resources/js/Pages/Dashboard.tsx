import { Input } from "@/Components/ui/input";
import { Button } from "@/Components/ui/button";
import { Card } from "@/Components/ui/card";
import { Search } from "lucide-react";
import { SidebarProvider } from "@/Components/ui/sidebar";
import { AppSidebar } from "@/Components/Appsidebar";
import { Link } from "@inertiajs/react";
import Calendar from "react-calendar";
import "../../css/calendar-custom.css";

export default function Dashboard() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-white text-[#1B355E]">
        <AppSidebar />

        <div className="flex flex-col flex-1 p-6 space-y-6 overflow-auto">
          {/* Top bar */}
          <div className="flex items-center justify-between">
            <div className="relative w-1/2">
              <Input placeholder="Search" className="pl-10 rounded-full text-[#1B355E] bg-white" />
              <Search className="absolute top-2.5 left-3 w-4 h-4 text-[#1B355E]" />
            </div>
            <Button className="rounded-full bg-white text-[#1B355E] px-6 py-1">Profile</Button>
          </div>

          {/* Grid content */}
          <div className="grid grid-cols-12 grid-rows-[auto] gap-4 auto-rows-min">
            {/* Show More Projects */}
            <div className="col-span-12 flex items-center mb-3">
              <Link href="/projects">
                <Button className="bg-white text-[#1B355E] border border-[#1B355E] hover:bg-[#1B355E] hover:text-white transition-all duration-200">
                  Show More
                </Button>
              </Link>
            </div>

            {/* Project Cards */}
            <Card className="col-span-3 bg-[#A1B6D9] text-white flex items-center justify-center font-semibold h-24">Project</Card>
            <Card className="col-span-3 bg-[#A1B6D9] text-white flex items-center justify-center font-semibold h-24">Project</Card>
            <Card className="col-span-3 bg-[#A1B6D9] text-white flex items-center justify-center font-semibold h-24">Project</Card>

            {/* Calendar */}
            <Card className="col-span-3 row-span-2 bg-[#A1B6D9] p-4 text-white font-semibold flex flex-col justify-between">
              <div>
                <p className="mb-2">Calendar</p>
                <div className="bg-white text-black rounded-md overflow-hidden [&_.react-calendar__tile--now]:bg-[#335DA2] [&_.react-calendar__tile--active]:bg-[#1B355E] [&_.react-calendar__tile--active]:text-white">
                  <Calendar
                    className="w-full text-sm [&_button]:p-1 [&_abbr]:no-underline [&_abbr]:text-xs"
                    calendarType="iso8601"
                  />
                </div>
              </div>
              <div className="mt-3">
                <Link href="/calendar">
                  <Button className="text-sm px-3 py-1 rounded bg-white text-[#1B355E] hover:bg-[#1B355E] hover:text-white transition">
                    Show More
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Notification */}
            <Card className="col-span-9 row-span-2 bg-[#A1B6D9] p-4 text-white min-h-[160px] flex flex-col justify-between">
              <div>
                <div className="font-semibold mb-2">Notifikasi</div>
                {/* Content notifikasi */}
              </div>
              <div className="mt-3 self-end">
                <Link href="/notifications">
                  <Button className="text-sm px-3 py-1 rounded bg-white text-[#1B355E] hover:bg-[#1B355E] hover:text-white transition">
                    Show More
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Spinner */}
            <Card className="col-span-4 bg-[#A1B6D9] flex flex-col items-center justify-center h-40">
              <div className="w-20 h-20 border-8 border-[#1B355E] rounded-full border-t-transparent animate-spin-slow"></div>
              <Link href="/spinner" className="mt-3">
                <Button className="text-sm px-3 py-1 rounded bg-white text-[#1B355E] hover:bg-[#1B355E] hover:text-white transition">
                  Show More
                </Button>
              </Link>
            </Card>

            {/* Placeholder */}
            <Card className="col-span-4 bg-[#A1B6D9] flex flex-col items-center justify-center text-white h-40">
              <p>tes</p>
              <Link href="/placeholder" className="mt-3">
                <Button className="text-sm px-3 py-1 rounded bg-white text-[#1B355E] hover:bg-[#1B355E] hover:text-white transition">
                  Show More
                </Button>
              </Link>
            </Card>

            {/* People Section */}
            <Card className="col-span-4 bg-[#A1B6D9] p-4 text-sm overflow-auto text-white h-40 flex flex-col justify-between">
              <div>
                <p className="font-semibold mb-2">Orang orang yang ada di project</p>
                <p>EZA</p>
                <p>Indra boomers kelahiran 1890 SM</p>
                <p>Khai cantik kata eza</p>
                <p>Rapli mati lampu alah pepe</p>
              </div>
              <div className="mt-3 self-end">
                <Link href="/roles">
                  <Button className="text-sm px-3 py-1 rounded bg-white text-[#1B355E] hover:bg-[#1B355E] hover:text-white transition">
                    Show More
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}

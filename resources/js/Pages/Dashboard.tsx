import { Input } from "@/Components/ui/input";
import { Button } from "@/Components/ui/button";
import { Card } from "@/Components/ui/card";
import { Search } from "lucide-react";
import { SidebarProvider } from "@/Components/ui/sidebar";
import { AppSidebar } from "@/Components/Appsidebar";
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link, router } from "@inertiajs/react";
import Calendar from "react-calendar";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";
import "../../css/calendar-custom.css";

interface Props {
  stats: {
    total: number;
    inProgress: number;
    stuck: number;
    done: number;
  };
  chartData: Array<{
    date: string;
    tasks: number;
  }>;
}

export default function Dashboard({ stats, chartData }: Props) {
  const pieData = [
    { name: "In Progress", value: stats.inProgress },
    { name: "Stuck", value: stats.stuck },
    { name: "Done", value: stats.done },
  ];

  const COLORS = ["#F59E0B", "#EF4444", "#10B981"];

  const navigateToTasks = (status?: string) => {
    router.get(route("tasks.index", status ? { status } : {}));
  };

  return (
    <AuthenticatedLayout>
    <SidebarProvider>
      <div className="flex min-h-screen bg-white text-[#1B355E]">

        <div className="flex flex-col flex-1 p-4 sm:p-6 space-y-6 overflow-auto">

          {/* Task Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card
              className="bg-[#1B355E] text-white p-4 font-semibold w-full cursor-pointer hover:opacity-90"
              onClick={() => navigateToTasks()}
            >
              All Tasks: {stats.total}
            </Card>
            <Card
              className="bg-yellow-500 text-white p-4 font-semibold w-full cursor-pointer hover:opacity-90"
              onClick={() => navigateToTasks("Working on it")}
            >
              In Progress: {stats.inProgress}
            </Card>
            <Card
              className="bg-red-500 text-white p-4 font-semibold w-full cursor-pointer hover:opacity-90"
              onClick={() => navigateToTasks("Stuck")}
            >
              Stuck: {stats.stuck}
            </Card>
            <Card
              className="bg-green-600 text-white p-4 font-semibold w-full cursor-pointer hover:opacity-90"
              onClick={() => navigateToTasks("Done")}
            >
              Done: {stats.done}
            </Card>
          </div>

          {/* Charts and Calendar */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Pie Chart: Tasks by Status */}
            <Card className="lg:col-span-4 p-4 w-full">
              <h2 className="font-bold mb-3 text-lg md:text-xl">
                Tasks by Status
              </h2>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={70}
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={index}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            {/* Bar Chart: Tasks by Due Date */}
            <Card className="lg:col-span-4 p-4 w-full">
              <h2 className="font-bold mb-3 text-lg md:text-xl">
                Tasks by Due Date
              </h2>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="tasks" fill="#1B355E" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Calendar */}
            <Card className="lg:col-span-4 bg-[#A1B6D9] p-4 text-white font-semibold w-full">
              <p className="mb-2 text-lg">Calendar</p>
              <div className="bg-white text-black rounded-md overflow-hidden [&_.react-calendar__tile--now]:bg-[#335DA2] [&_.react-calendar__tile--active]:bg-[#1B355E] [&_.react-calendar__tile--active]:text-white">
                <Calendar
                  className="w-full text-sm [&_button]:p-1 [&_abbr]:no-underline [&_abbr]:text-xs"
                  calendarType="iso8601"
                />
              </div>
              <div className="mt-3">
                <Link href="/calendar">
                  <Button className="text-sm px-3 py-1 rounded bg-white text-[#1B355E] hover:bg-[#1B355E] hover:text-white transition">
                    Show More
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Overdue Tasks */}
            <Card className="lg:col-span-6 p-4 w-full">
              <h2 className="font-bold mb-2 text-lg md:text-xl">
                Overdue Tasks
              </h2>
              <ul className="text-sm text-red-600 space-y-1">
                <li>Update API Docs - Due: Jun 3</li>
                <li>Design Review - Due: Jun 4</li>
              </ul>
            </Card>

            {/* Tasks by Owner */}
            <Card className="lg:col-span-6 p-4 w-full">
              <h2 className="font-bold mb-2 text-lg md:text-xl">
                Tasks by Owner
              </h2>
              <ul className="text-sm space-y-1">
                <li>Alice: 5 tasks</li>
                <li>David: 7 tasks</li>
                <li>Sarah: 3 tasks</li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </SidebarProvider>
    </AuthenticatedLayout>
  );
}

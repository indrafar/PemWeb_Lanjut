import { Head, router, usePage, Link } from '@inertiajs/react';
import { useState } from "react";
import { Input } from "@/Components/ui/input";
import { Button } from "@/Components/ui/button";
import { Card } from "@/Components/ui/card";
import { SidebarProvider } from "@/Components/ui/sidebar";
import { AppSidebar } from "@/Components/Appsidebar";
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
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

// Interface types
interface TaskStats {
  total: number;
  inProgress: number;
  stuck: number;
  done: number;
}

interface ChartDataEntry {
  date: string;
  tasks: number;
}

interface OverdueTask {
  id: number;
  title: string;
  due_date: string;
}

interface TasksByOwnerEntry {
  owner_name: string;
  tasks_count: number;
}

export default function Dashboard() {
  const { stats, chartData, overdueTasks, tasksByOwner } = usePage().props as {
    stats: TaskStats;
    chartData: ChartDataEntry[];
    overdueTasks: OverdueTask[];
    tasksByOwner: TasksByOwnerEntry[];
  };

  const pieData = [
    { name: "In Progress", value: stats.inProgress },
    { name: "Stuck", value: stats.stuck },
    { name: "Done", value: stats.done },
  ];

  const COLORS = ["#F59E0B", "#EF4444", "#10B981"];

  const navigateToTasks = (status?: string) => {
    router.get(route("tasks.index", status ? { status } : {}));
  };

  const formatDate = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <AuthenticatedLayout>
      <Head title="Dashboard" />
      <SidebarProvider>
                <div className="flex flex-col flex-1 p-4 sm:p-6 space-y-6 overflow-auto bg-gray-50 font-inter">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-4xl font-extrabold text-[#1B355E]">Dashboard Overview</h1>
          </div>

          {/* Task Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card onClick={() => navigateToTasks()} className="bg-[#1B355E] text-white p-4 font-semibold cursor-pointer rounded-xl shadow-md hover:opacity-90 transition-opacity">
              All Tasks: {stats.total}
            </Card>
            <Card onClick={() => navigateToTasks("Working on it")} className="bg-yellow-500 text-white p-4 font-semibold cursor-pointer rounded-xl shadow-md hover:opacity-90 transition-opacity">
              In Progress: {stats.inProgress}
            </Card>
            <Card onClick={() => navigateToTasks("Stuck")} className="bg-red-500 text-white p-4 font-semibold cursor-pointer rounded-xl shadow-md hover:opacity-90 transition-opacity">
              Stuck: {stats.stuck}
            </Card>
            <Card onClick={() => navigateToTasks("Done")} className="bg-green-600 text-white p-4 font-semibold cursor-pointer rounded-xl shadow-md hover:opacity-90 transition-opacity">
              Done: {stats.done}
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Pie Chart */}
            <Card className="lg:col-span-4 p-6 bg-white rounded-xl shadow-lg">
              <h2 className="font-bold mb-4 text-2xl text-[#1B355E]">Tasks by Status</h2>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            {/* Bar Chart */}
            <Card className="lg:col-span-4 p-6 bg-white rounded-xl shadow-lg">
              <h2 className="font-bold mb-4 text-2xl text-[#1B355E]">Tasks by Due Date</h2>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData}>
                  <XAxis dataKey="date" tickFormatter={formatDate} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="tasks" fill="#1B355E" radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Calendar */}
            <Card className="lg:col-span-4 bg-[#A1B6D9] p-6 rounded-xl text-white font-semibold shadow-lg">
              <p className="mb-4 text-2xl font-bold">Calendar</p>
              <div className="bg-white text-black rounded-lg overflow-hidden p-2 flex justify-center items-center">
                <Calendar className="w-full text-sm border-0 shadow-none" calendarType="iso8601" />
              </div>
              <div className="mt-4 text-center">
                <Link href={route("calendar.index")}>
                  <Button className="text-sm px-4 py-2 rounded-md bg-white text-[#1B355E] hover:bg-[#1B355E] hover:text-white transition shadow-sm">
                    Show More
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Overdue Tasks */}
            <Card className="lg:col-span-6 p-6 bg-white rounded-xl shadow-lg">
              <h2 className="font-bold mb-4 text-2xl text-[#1B355E]">Overdue Tasks</h2>
              {overdueTasks.length > 0 ? (
                <ul className="text-base text-red-600 space-y-2">
                  {overdueTasks.map(task => (
                    <li key={task.id} className="border-b border-gray-100 pb-2 last:border-b-0">
                      <span className="font-medium">{task.title}</span> - Due: {formatDate(task.due_date)}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-sm">No overdue tasks found!</p>
              )}
            </Card>

            {/* Tasks by Owner */}
            <Card className="lg:col-span-6 p-6 bg-white rounded-xl shadow-lg">
              <h2 className="font-bold mb-4 text-2xl text-[#1B355E]">Tasks by Owner</h2>
              {tasksByOwner.length > 0 ? (
                <ul className="text-base space-y-2">
                  {tasksByOwner.map((owner, index) => (
                    <li key={index} className="border-b border-gray-100 pb-2 last:border-b-0 text-gray-700">
                      <span className="font-medium">{owner.owner_name}:</span> {owner.tasks_count} tasks
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-sm">No tasks by owner found.</p>
              )}
            </Card>
          </div>
        </div>
      </SidebarProvider>
    </AuthenticatedLayout>
  );
}

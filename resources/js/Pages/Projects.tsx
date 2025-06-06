import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useState } from 'react';

type Project = {
  id: number;
  name: string;
  status: 'Active' | 'Completed' | 'Pending';
  updatedAt: string;
};

export default function Projects() {
  const [projects] = useState<Project[]>([
    {
      id: 1,
      name: 'Redesign Website',
      status: 'Active',
      updatedAt: '2025-06-06',
    },
    {
      id: 2,
      name: 'Mobile App Development',
      status: 'Pending',
      updatedAt: '2025-06-04',
    },
    {
      id: 3,
      name: 'Marketing Campaign Q3',
      status: 'Completed',
      updatedAt: '2025-05-30',
    },
  ]);

  return (
    <AuthenticatedLayout header="Projects">
      <div className="p-6 bg-white min-h-screen">
        <h1 className="text-2xl font-bold mb-6">Your Projects</h1>
        <div className="space-y-4">
          {projects.map((project) => (
            <div key={project.id} className="p-4 border rounded shadow-sm hover:shadow-md transition">
              <h2 className="text-xl font-semibold">{project.name}</h2>
              <p className="text-sm text-gray-600">Status: {project.status}</p>
              <p className="text-xs text-gray-400">Last updated: {project.updatedAt}</p>
            </div>
          ))}
        </div>
      </div>
    </AuthenticatedLayout>
  );
}

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useState } from 'react';

type Project = {
  id: number;
  name: string;
  status: 'Active' | 'Completed' | 'Pending';
  updatedAt: string;
  deadline: string;
  owner: string;
  description: string;
};

export default function Projects() {
  const [projects] = useState<Project[]>([
    {
      id: 1,
      name: 'Redesign Website',
      status: 'Active',
      updatedAt: '2025-06-06',
      deadline: '2025-06-20',
      owner: 'Alice Johnson',
      description: 'Revamp the company’s main website to improve UI/UX and responsiveness.',
    },
    {
      id: 2,
      name: 'Mobile App Development',
      status: 'Pending',
      updatedAt: '2025-06-04',
      deadline: '2025-07-15',
      owner: 'David Lee',
      description: 'Develop a cross-platform mobile app for our product catalog and customer service.',
    },
    {
      id: 3,
      name: 'Marketing Campaign Q3',
      status: 'Completed',
      updatedAt: '2025-05-30',
      deadline: '2025-05-28',
      owner: 'Sarah Kim',
      description: 'Run a digital marketing campaign focusing on new feature releases in Q3.',
    },
  ]);

  return (
    <AuthenticatedLayout header="Projects">
      <div className="p-6 bg-white min-h-screen">
        <h1 className="text-3xl font-bold mb-8">Project Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div key={project.id} className="bg-gray-50 border border-gray-200 rounded-xl p-5 shadow hover:shadow-md transition">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-semibold">{project.name}</h2>
                <span
                  className={`text-sm font-medium px-2 py-1 rounded-full ${
                    project.status === 'Active'
                      ? 'bg-green-100 text-green-700'
                      : project.status === 'Pending'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {project.status}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-3">{project.description}</p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li><strong>Owner:</strong> {project.owner}</li>
                <li><strong>Deadline:</strong> {project.deadline}</li>
                <li><strong>Last Updated:</strong> {project.updatedAt}</li>
              </ul>
            </div>
          ))}
        </div>
      </div>
    </AuthenticatedLayout>
  );
}

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import { Tab } from '@headlessui/react';


interface Project {
  id: number;
  name: string;
  deleted_at: string;
  leader: {
    name: string;
  } | null;
}

interface Task {
  id: number;
  title: string;
  deleted_at: string;
  project: {
    name: string;
  } | null;
  owner: {
    name: string;
  } | null;
  assignedTo: {
    name: string;
  } | null;
}

interface Props {
  deletedProjects: Project[];
  deletedTasks: Task[];
  can: {
    restore: boolean;
    forceDelete: boolean;
  };
}

export default function Trash({ deletedProjects, deletedTasks, can }: Props) {
  const handleRestore = (type: 'project' | 'task', id: number) => {
    if (confirm('Are you sure you want to restore this item?')) {
      router.post(route('trash.restore'), { type, id });
    }
  };

  const handleForceDelete = (type: 'project' | 'task', id: number) => {
    if (confirm('Are you sure you want to permanently delete this item? This action cannot be undone.')) {
      router.delete(route('trash.force-delete'), { data: { type, id } });
    }
  };

  return (
    <AuthenticatedLayout>
      <Head title="Trash" />
      
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Tab.Group>
          <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1">
            <Tab className={({ selected }) =>
              `w-full rounded-lg py-2.5 text-sm font-medium leading-5 
              ${selected 
                ? 'bg-white shadow text-blue-700'
                : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
              }`
            }>
              Projects ({deletedProjects.length})
            </Tab>
            <Tab className={({ selected }) =>
              `w-full rounded-lg py-2.5 text-sm font-medium leading-5 
              ${selected 
                ? 'bg-white shadow text-blue-700'
                : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
              }`
            }>
              Tasks ({deletedTasks.length})
            </Tab>
          </Tab.List>
          
          <Tab.Panels className="mt-2">
            <Tab.Panel>
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Project Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Leader
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Deleted At
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {deletedProjects.map((project) => (
                      <tr key={project.id}>
                        <td className="px-6 py-4 whitespace-nowrap">{project.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {project.leader?.name || 'No Leader'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {new Date(project.deleted_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {can.restore && (
                            <button
                              onClick={() => handleRestore('project', project.id)}
                              className="text-blue-600 hover:text-blue-900 mr-4"
                            >
                              Restore
                            </button>
                          )}
                          {can.forceDelete && (
                            <button
                              onClick={() => handleForceDelete('project', project.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Tab.Panel>
            
            <Tab.Panel>
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Task Title
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Project
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Assigned To
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Deleted At
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {deletedTasks.map((task) => (
                      <tr key={task.id}>
                        <td className="px-6 py-4 whitespace-nowrap">{task.title}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {task.project?.name || 'No Project'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {task.assignedTo?.name || 'Unassigned'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {new Date(task.deleted_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {can.restore && (
                            <button
                              onClick={() => handleRestore('task', task.id)}
                              className="text-blue-600 hover:text-blue-900 mr-4"
                            >
                              Restore
                            </button>
                          )}
                          {can.forceDelete && (
                            <button
                              onClick={() => handleForceDelete('task', task.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </AuthenticatedLayout>
  );
}

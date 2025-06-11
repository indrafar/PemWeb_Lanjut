import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { router } from '@inertiajs/react';

// Defines the structure of a user
interface User {
    id: number;
    name: string;
    username: string;
    email: string;
    role: string;
}

// Defines the props expected by the ManageUsers component
interface Props {
    users: User[];
    isAdmin: boolean;
}

// --- Reusable Form Components ---
// These components are duplicated here for self-containment of this file.
// In a larger application, they would typically be imported from a common UI library.

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const FormInput = ({ label, error, ...props }: FormInputProps) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input
      {...props}
      className={`mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
        error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
      } px-3 py-2`}
    />
    {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
  </div>
);

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  children: React.ReactNode;
  error?: string;
}

const FormSelect = ({ label, children, error, ...props }: FormSelectProps) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <select
      {...props}
      className={`mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
        error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
      } px-3 py-2`}
    >
      {children}
    </select>
    {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
  </div>
);
// --- End of Reusable Form Components ---


export default function ManageUsers({ users, isAdmin }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    // useForm hook for handling form data and submission
    const { data, setData, post, put, reset, processing, errors } = useForm({
        id: '', // User ID (used for editing)
        name: '', // User's name
        username: '', // User's username
        email: '', // User's email
        password: '', // User's password (left empty for security during edit)
        role: 'Anggota Tim' // Default role for new users
    });

    // Array of possible roles for users
    const roles = ['Admin', 'Manajer Proyek', 'Anggota Tim'];

    // Handles form submission for both creating and updating users
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (editingUser) {
            // If editingUser exists, update the user
            put(route('users.update', editingUser.id), {
                onSuccess: () => {
                    // On successful update, close modal, reset form, and clear editingUser
                    setIsModalOpen(false);
                    reset();
                    setEditingUser(null);
                },
                onError: (currentErrors) => {
                    // Log and handle errors during update
                    console.error("Update user errors:", currentErrors);
                    // You might want to display a toast notification here
                }
            });
        } else {
            // If no editingUser, create a new user
            post(route('users.store'), {
                onSuccess: () => {
                    // On successful creation, close modal and reset form
                    setIsModalOpen(false);
                    reset();
                },
                onError: (currentErrors) => {
                    // Log and handle errors during creation
                    console.error("Create user errors:", currentErrors);
                    // You might want to display a toast notification here
                }
            });
        }
    };

    // Handles editing a user: opens the modal and pre-fills form with user data
    const handleEdit = (user: User) => {
        setEditingUser(user);
        setData({
            id: user.id.toString(), // Convert ID to string for form input
            name: user.name,
            username: user.username,
            email: user.email,
            password: '', // Password field intentionally left blank for security
            role: user.role
        });
        setIsModalOpen(true);
    };

    // Handles deleting a user after confirmation
    const handleDelete = (userId: number) => {
        // Use a browser confirm dialog (consider replacing with a custom modal for better UX)
        if (confirm('Are you sure you want to delete this user?')) { 
            router.delete(route('users.destroy', userId));
        }
    };

    return (
        <AuthenticatedLayout>
            {/* Sets the page title */}
            <Head title="Manage Users" />
            {/* Main content area with subtle background and Inter font */}
            <div className="py-12 bg-gray-50 min-h-screen font-inter">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Card container for the user table */}
                    <div className="bg-white overflow-hidden shadow-lg sm:rounded-lg rounded-xl">
                        <div className="p-6">
                            {/* Header section with title and Add User button */}
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-3xl font-bold text-[#1B355E]">Manage Users</h2> {/* Dark blue header */}
                                {isAdmin && ( // Only show Add New User button if user is Admin
                                    <button
                                        onClick={() => {
                                            setEditingUser(null); // Ensure no user is being edited when adding a new one
                                            reset(); // Reset form data to default values
                                            setIsModalOpen(true); // Open the modal
                                        }}
                                        className="bg-[#1B355E] text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-800 transition-colors flex items-center gap-2"
                                    >
                                        {/* Plus icon */}
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                                        Add New User
                                    </button>
                                )}
                            </div>

                            {/* Responsive table container */}
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    {/* Table header */}
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                            {isAdmin && ( // Only show Actions column if user is Admin
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                            )}
                                        </tr>
                                    </thead>
                                    {/* Table body */}
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {users.length > 0 ? ( // Conditionally render users or 'no users found' message
                                            users.map((user) => (
                                                <tr key={user.id} className="hover:bg-gray-50 transition-colors"> {/* Hover effect for rows */}
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{user.username}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{user.email}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                        {/* Role badge with conditional styling */}
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                            user.role === 'Admin' ? 'bg-red-100 text-red-800' :
                                                            user.role === 'Manajer Proyek' ? 'bg-indigo-100 text-indigo-800' :
                                                            'bg-green-100 text-green-800'
                                                        }`}>
                                                            {user.role}
                                                        </span>
                                                    </td>
                                                    {isAdmin && ( // Only show action buttons if user is Admin
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                            <button
                                                                onClick={() => handleEdit(user)}
                                                                className="text-blue-600 hover:text-blue-800 transition-colors mr-4"
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(user.id)}
                                                                className="text-red-600 hover:text-red-800 transition-colors"
                                                            >
                                                                Delete
                                                            </button>
                                                        </td>
                                                    )}
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={isAdmin ? 5 : 4} className="px-6 py-4 text-center text-gray-500">
                                                    No users found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add/Edit User Modal Form */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"> {/* Darker overlay, added p-4 */}
                    <div className="bg-white p-8 rounded-xl w-full max-w-md mx-auto shadow-2xl max-h-[90vh] overflow-y-auto"> {/* Larger max-w, rounded-xl, shadow-2xl */}
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-3xl font-bold text-[#1B355E]"> {/* Dark blue header */}
                                {editingUser ? 'Edit User' : 'Add New User'}
                            </h3>
                            {/* Close modal button with SVG icon */}
                            <button
                                onClick={() => {
                                    setIsModalOpen(false);
                                    setEditingUser(null);
                                    reset();
                                }}
                                className="text-gray-500 hover:text-gray-700 transition-colors"
                            >
                                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>

                        {/* Form for adding/editing user details */}
                        <form onSubmit={handleSubmit} className="space-y-6"> {/* Increased space-y */}
                            <FormInput
                                label="Name"
                                type="text"
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                                required
                                error={errors.name} // Display validation error
                            />

                            <FormInput
                                label="Username"
                                type="text"
                                value={data.username}
                                onChange={e => setData('username', e.target.value)}
                                required
                                error={errors.username} // Display validation error
                            />

                            <FormInput
                                label="Email"
                                type="email"
                                value={data.email}
                                onChange={e => setData('email', e.target.value)}
                                required
                                error={errors.email} // Display validation error
                            />

                            <FormInput
                                label="Password"
                                type="password"
                                value={data.password}
                                onChange={e => setData('password', e.target.value)}
                                required={!editingUser} // Password is required only for new users
                                error={errors.password} // Display validation error
                            />

                            <FormSelect
                                label="Role"
                                value={data.role}
                                onChange={e => setData('role', e.target.value)}
                                error={errors.role} // Display validation error
                            >
                                {roles.map(role => (
                                    <option key={role} value={role}>
                                        {role}
                                    </option>
                                ))}
                            </FormSelect>

                            {/* Action buttons for form submission */}
                            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200"> {/* Added border-t */}
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsModalOpen(false);
                                        setEditingUser(null);
                                        reset();
                                    }}
                                    className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing} // Disable button while processing
                                    className="px-6 py-2 bg-[#1B355E] text-white rounded-md shadow-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1B355E] disabled:opacity-50 transition-colors"
                                >
                                    {processing ? 'Saving...' : (editingUser ? 'Update' : 'Create')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}

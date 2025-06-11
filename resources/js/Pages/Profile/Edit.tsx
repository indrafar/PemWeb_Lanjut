import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react'; // Tambahkan useForm
import { FormEvent, useState } from 'react'; // Tambahkan FormEvent
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import PrimaryButton from '@/Components/PrimaryButton'; // Import PrimaryButton
import { Transition } from '@headlessui/react'; // Import Transition

type ActiveTab = 'profile' | 'password' | 'delete';

// Komponen Ikon (tetap sama)
const IconUser = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>;
const IconKey = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L4.257 19.743A1 1 0 013 19.172V17a1 1 0 01.553-.894L11.447 13.5A6 6 0 0118 8z" clipRule="evenodd" /></svg>;
const IconTrash = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;

export default function Edit({ mustVerifyEmail, status }: PageProps<{ mustVerifyEmail: boolean; status?: string }>) {
    const user = usePage<PageProps>().props.auth.user;
    const [activeTab, setActiveTab] = useState<ActiveTab>('profile');

    // State & Form untuk statistik
    const { data: statsData, setData: setStatsData, patch, errors, processing, recentlySuccessful } = useForm({
        opportunities_applied: user.opportunities_applied || 0,
        opportunities_won: user.opportunities_won || 0,
        current_opportunities: user.current_opportunities || 0,
    });

    const submitStats = (e: FormEvent) => {
        e.preventDefault();
        // Anda perlu membuat route 'profile.stats.update' di backend
        patch(route('profile.stats.update'), { preserveScroll: true });
    };

    const getTabClassName = (tabName: ActiveTab) => {
        const base = "flex items-center px-4 py-3 text-sm font-semibold transition-colors duration-200 focus:outline-none";
        return activeTab === tabName
            ? `${base} text-blue-600 border-b-2 border-blue-600`
            : `${base} text-gray-500 border-b-2 border-transparent hover:text-blue-600 hover:border-blue-200`;
    };

    return (
        <div style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #d1d5db 1px, transparent 0)', backgroundSize: '20px 20px' }}>
            <AuthenticatedLayout>
                <Head title="My Dashboard" />
                <div className="py-12">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 lg:grid-cols-12 lg:gap-8">
                            <div className="lg:col-span-4 mb-8 lg:mb-0">
                                <form onSubmit={submitStats} className="p-6 bg-white rounded-xl shadow-lg transition-shadow hover:shadow-2xl">
                                    <div className="relative group w-32 h-32 mx-auto">
                                        <img
                                            className="w-full h-full rounded-full object-cover ring-4 ring-blue-500 ring-offset-2 ring-offset-white"
                                            src={`https://ui-avatars.com/api/?name=${user.name.replace(' ', '+')}&bold=true&background=random&size=128`}
                                            alt={user.name}
                                        />
                                        <button type="button" className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                        </button>
                                    </div>
                                    <div className="text-center mt-4">
                                        <h2 className="text-2xl font-bold text-gray-800">{user.name}</h2>
                                        <p className="text-base text-gray-500">Microsoft Inc.</p>
                                    </div>

                                    {/* Statistik Pengguna yang Dapat Diedit */}
                                    <div className="mt-8 space-y-2 text-sm">
                                        {[
                                            { label: 'Opportunities applied', name: 'opportunities_applied', color: 'yellow' },
                                            { label: 'Opportunities won', name: 'opportunities_won', color: 'green' },
                                            { label: 'Current opportunities', name: 'current_opportunities', color: 'blue' }
                                        ].map(item => (
                                            <div key={item.name} className="flex justify-between items-center p-2 rounded-lg hover:bg-slate-50 transition-colors">
                                                <label htmlFor={item.name} className="text-gray-600">{item.label}</label>
                                                <input
                                                    type="number"
                                                    id={item.name}
                                                    name={item.name}
                                                    value={statsData[item.name as keyof typeof statsData]}
                                                    onChange={e => setStatsData(item.name as keyof typeof statsData, parseInt(e.target.value))}
                                                    className={`font-bold text-${item.color}-600 bg-${item.color}-100 rounded-full w-16 text-center border-none focus:ring-2 focus:ring-${item.color}-400`}
                                                />
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex items-center gap-4 mt-4">
                                        <PrimaryButton disabled={processing}>Update Stats</PrimaryButton>
                                        <Transition show={recentlySuccessful} enter="transition ease-in-out" enterFrom="opacity-0" leave="transition ease-in-out" leaveTo="opacity-0">
                                            <p className="text-sm text-gray-600">Updated.</p>
                                        </Transition>
                                    </div>

                                    <button type="button" className="w-full mt-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-transform transform hover:-translate-y-1">
                                        View Public Profile
                                    </button>
                                </form>
                            </div>

                            {/* Panel Kanan (tetap sama) */}
                            <div className="lg:col-span-8">
                                <div className="bg-white rounded-xl shadow-lg">
                                    <nav className="flex items-center border-b border-gray-200 px-4">
                                        <button onClick={() => setActiveTab('profile')} className={getTabClassName('profile')}><IconUser /> Profile</button>
                                        <button onClick={() => setActiveTab('password')} className={getTabClassName('password')}><IconKey /> Password</button>
                                        <div className="ml-auto">
                                            <button onClick={() => setActiveTab('delete')} className={`${getTabClassName('delete')} text-red-500 hover:text-red-700 hover:border-red-300`}><IconTrash/> Delete</button>
                                        </div>
                                    </nav>
                                    <div className="p-6 md:p-8">
                                        {activeTab === 'profile' && <UpdateProfileInformationForm mustVerifyEmail={mustVerifyEmail} status={status} className="max-w-full" />}
                                        {activeTab === 'password' && <UpdatePasswordForm className="max-w-full" />}
                                        {activeTab === 'delete' && <DeleteUserForm className="max-w-full" />}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </AuthenticatedLayout>
        </div>
    );
}
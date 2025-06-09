import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        username: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'Anggota Tim', // Default role
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <>
            <Head title="Register" />

            <div className="min-h-screen flex items-center justify-center bg-[#1B355E]">
                <div className="w-full max-w-6xl bg-white rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
                    {/* Ilustrasi Kiri */}
                    <div className="hidden md:block relative bg-[#A1B6D9]">
                        <img
                            src="https://img.freepik.com/free-photo/view-messy-office-workspace-with-laptop_23-2150282014.jpg"
                            alt="Register Illustration"
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/60"></div>
                        <div className="relative z-10 flex items-center justify-center h-full">
                            <img src="/PemWeb_Lanjut/public/images/logonoted.png" alt="Logo" className="w-40 h-auto" />
                        </div>
                    </div>

                    {/* Form Kanan */}
                    <div className="p-12">
                        <h1 className="text-4xl font-bold text-[#1B355E] mb-8">Create account</h1>

                        <form onSubmit={submit} className="space-y-6">
                            {/* Name field */}
                            <div>
                                <InputLabel htmlFor="name" value="Name" className="text-[#1B355E]" />
                                <TextInput
                                    id="name"
                                    name="name"
                                    value={data.name}
                                    className="mt-1 block w-full"
                                    autoComplete="name"
                                    isFocused={true}
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                />
                                <InputError message={errors.name} className="mt-2" />
                            </div>

                            {/* Username field */}
                            <div>
                                <InputLabel htmlFor="username" value="Username" className="text-[#1B355E]" />
                                <TextInput
                                    id="username"
                                    name="username"
                                    value={data.username}
                                    className="mt-1 block w-full"
                                    autoComplete="username"
                                    onChange={(e) => setData('username', e.target.value)}
                                    required
                                />
                                <InputError message={errors.username} className="mt-2" />
                            </div>

                            {/* Email field */}
                            <div>
                                <InputLabel htmlFor="email" value="Email" className="text-[#1B355E]" />
                                <TextInput
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    className="mt-1 block w-full"
                                    autoComplete="email"
                                    onChange={(e) => setData('email', e.target.value)}
                                    required
                                />
                                <InputError message={errors.email} className="mt-2" />
                            </div>

                            {/* Password fields... (keep existing password fields) */}
                            <div>
                                <InputLabel htmlFor="password" value="Password" className="text-[#1B355E]" />
                                <TextInput
                                    id="password"
                                    type="password"
                                    name="password"
                                    value={data.password}
                                    className="mt-1 block w-full"
                                    autoComplete="new-password"
                                    onChange={(e) => setData('password', e.target.value)}
                                    required
                                />
                                <InputError message={errors.password} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="password_confirmation" value="Confirm Password" className="text-[#1B355E]" />
                                <TextInput
                                    id="password_confirmation"
                                    type="password"
                                    name="password_confirmation"
                                    value={data.password_confirmation}
                                    className="mt-1 block w-full"
                                    autoComplete="new-password"
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    required
                                />
                                <InputError message={errors.password_confirmation} className="mt-2" />
                            </div>

                            <div className="flex items-center justify-between">
                                <Link
                                    href={route('login')}
                                    className="text-sm text-gray-600 hover:underline"
                                >
                                    Already have an account?
                                </Link>
                                <PrimaryButton
                                    className="bg-[#396EC4] hover:bg-[#1B355E] text-white px-6 py-2 rounded"
                                    disabled={processing}
                                >
                                    Register
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}

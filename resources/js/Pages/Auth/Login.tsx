import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function Login({ status, canResetPassword }: { status?: string; canResetPassword: boolean }) {
    const { data, setData, post, processing, errors, reset } = useForm<{
        username: string;
        password: string;
        remember: boolean;
    }>({
        username: '',
        password: '',
        remember: false,
    });


    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), { onFinish: () => reset('password') });
    };

    return (
        <>
            <Head title="Log in" />

<div className="min-h-screen flex items-center justify-center bg-[#1B355E]">
    <div className="w-full max-w-6xl bg-white rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* Ilustrasi Kiri */}
        <div className="hidden md:block relative bg-[#A1B6D9]">
            <img
                src="https://img.freepik.com/free-photo/view-messy-office-workspace-with-laptop_23-2150282014.jpg?ga=GA1.1.9329213.1710743119&semt=ais_items_boosted&w=740"
                alt="Login Illustration"
                className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Overlay gelap */}
            <div className="absolute inset-0 bg-black/60"></div>
            {/* Logo di atas overlay */}
        <div className="relative z-10 flex items-center justify-center h-full">
            <img src="/images/logonoted2.png" alt="Logo" className="w-40 h-auto" />
        </div>
        </div>
        {/* Status Message */}
        {status && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-green-100 text-green-800 px-4 py-2 rounded shadow z-20">
            {status}
            </div>
        )}

        {/* Form Kanan */}
        <div className="p-12">
            <h1 className="text-4xl font-bold text-[#1B355E] mb-8">Create account</h1>

            <form onSubmit={submit} className="space-y-6">
                <div>
                    <InputLabel htmlFor="username" value="Username" className="text-[#1B355E]" />
                    <TextInput
                        id="username"
                        type="text"
                        name="username"
                        value={data.username}
                        className="mt-1 block w-full"
                        autoComplete="username"
                        isFocused={true}
                        onChange={(e) => setData('username', e.target.value)}
                    />
                    <InputError message={errors.username} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="password" value="Password" className="text-[#1B355E]" />
                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full"
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                    />
                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="flex items-center">
                    <Checkbox
                        name="remember"
                        checked={data.remember}
                        onChange={(e) => setData('remember', e.target.checked)}
                    />
                    <span className="ml-2 text-sm text-gray-600">Remember me</span>
                </div>

                <div className="flex items-center justify-between">
                    {canResetPassword && (
                        <Link href={route('password.request')} className="text-sm text-gray-600 hover:underline">
                            Forgot your password?
                        </Link>
                    )}
                    <PrimaryButton
                        className="bg-[#396EC4] hover:bg-[#1B355E] text-white px-6 py-2 rounded"
                        disabled={processing}
                    >
                        Log in
                    </PrimaryButton>
                </div>
            </form>

            <div className="mt-8 text-center text-sm text-gray-600">
                Don’t have an account?{' '}
                <Link href={route('register')} className="text-[#396EC4] hover:underline font-semibold">
                    Register
                </Link>
            </div>
        </div>
    </div>
</div>

        </>
    );
}

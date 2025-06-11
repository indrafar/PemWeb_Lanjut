<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Hash;

class UserPermissionSeeder extends Seeder
{
    // Definisi Permissions (menggunakan format baru yang Anda berikan)
    private $permissions = [
        'manage-users',
        'manage-projects',
        'manage-tasks',
        'view-tasks',
        'create-tasks',
        'edit-tasks',
        'delete-tasks',
        'add-comment', // Menambahkan permission untuk komentar
    ];

    // Definisi Roles dan Permissions yang terkait (menggunakan format baru yang Anda berikan)
    private $roles = [
        'Admin' => [
            'manage-users',
            'manage-projects',
            'manage-tasks',
            'view-tasks',
            'create-tasks',
            'edit-tasks',
            'delete-tasks',
            'add-comment', // Admin bisa komentar
        ],
        'Manajer Proyek' => [
            'manage-projects',
            'manage-tasks',
            'view-tasks',
            'create-tasks',
            'edit-tasks',
            'add-comment', // Manajer Proyek bisa komentar
        ],
        'Anggota Tim' => [
            'view-tasks',
            'create-tasks',
            'edit-tasks',
            'add-comment', // Anggota Tim bisa komentar
        ],
    ];

    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Reset cached roles and permissions untuk memastikan semuanya bersih
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // 1. Membuat atau menemukan Permissions
        // Menggunakan findOrCreate untuk menghindari duplikasi
        foreach ($this->permissions as $permissionName) {
            Permission::findOrCreate($permissionName, 'web'); // Tambahkan guard jika defaultnya bukan 'web'
        }

        // 2. Membuat atau menemukan Roles dan menyinkronkan Permissions
        // Menggunakan findOrCreate untuk menghindari duplikasi Role
        foreach ($this->roles as $roleName => $permissionsToAssign) {
            $role = Role::findOrCreate($roleName, 'web'); // Tambahkan guard jika defaultnya bukan 'web'
            $role->syncPermissions($permissionsToAssign);
        }

        // 3. Membuat atau menemukan User dan memberikan Role
        // Pastikan username unik dan email juga unik

        // User Admin
        $adminEmail = 'admin@admin.com';
        $adminUsername = 'admin';
        if (User::where('email', $adminEmail)->doesntExist() && User::where('username', $adminUsername)->doesntExist()) {
            $adminUser = User::create([
                'name' => 'Admin',
                'username' => $adminUsername,
                'email' => $adminEmail,
                'password' => Hash::make('password'),
                'role' => 'Admin'
            ]);
            $adminUser->assignRole('Admin');
        } else {
            // Jika user sudah ada, temukan dan pastikan role-nya benar
            $adminUser = User::where('email', $adminEmail)->first();
            if ($adminUser) {
                $adminUser->assignRole('Admin');
            }
        }

        // User Manajer Proyek
        $managerEmail = 'Indra@example.com';
        $managerUsername = 'Indra';
        if (User::where('email', $managerEmail)->doesntExist() && User::where('username', $managerUsername)->doesntExist()) {
            $managerUser = User::create([
                'name' => 'Indra Farhan',
                'username' => $managerUsername,
                'email' => $managerEmail,
                'password' => Hash::make('password'),
                'role' => 'Manajer Proyek'
            ]);
            $managerUser->assignRole('Manajer Proyek');
        } else {
            $managerUser = User::where('email', $managerEmail)->first();
            if ($managerUser) {
                $managerUser->assignRole('Manajer Proyek');
            }
        }

        // User Anggota Tim 1
        $rezaEmail = 'Reza@example.com';
        $rezaUsername = 'Reza';
        if (User::where('email', $rezaEmail)->doesntExist() && User::where('username', $rezaUsername)->doesntExist()) {
            $rezaUser = User::create([
                'name' => 'Reza',
                'username' => $rezaUsername,
                'email' => $rezaEmail,
                'password' => Hash::make('password'),
                'role' => 'Anggota Tim'
            ]);
            $rezaUser->assignRole('Anggota Tim');
        } else {
            $rezaUser = User::where('email', $rezaEmail)->first();
            if ($rezaUser) {
                $rezaUser->assignRole('Anggota Tim');
            }
        }

        // User Anggota Tim 2
        $khaiEmail = 'Khai@example.com';
        $khaiUsername = 'Khai';
        if (User::where('email', $khaiEmail)->doesntExist() && User::where('username', $khaiUsername)->doesntExist()) {
            $khaiUser = User::create([
                'name' => 'Khai',
                'username' => $khaiUsername,
                'email' => $khaiEmail,
                'password' => Hash::make('password'),
                'role' => 'Anggota Tim'
            ]);
            $khaiUser->assignRole('Anggota Tim');
        } else {
            $khaiUser = User::where('email', $khaiEmail)->first();
            if ($khaiUser) {
                $khaiUser->assignRole('Anggota Tim');
            }
        }

        // User Anggota Tim 3
        $raflyEmail = 'Rafly@example.com';
        $raflyUsername = 'Rafly';
        if (User::where('email', $raflyEmail)->doesntExist() && User::where('username', $raflyUsername)->doesntExist()) {
            $raflyUser = User::create([
                'name' => 'Rafly',
                'username' => $raflyUsername,
                'email' => $raflyEmail,
                'password' => Hash::make('password'),
                'role' => 'Anggota Tim'
            ]);
            $raflyUser->assignRole('Anggota Tim');
        } else {
            $raflyUser = User::where('email', $raflyEmail)->first();
            if ($raflyUser) {
                $raflyUser->assignRole('Anggota Tim');
            }
        }
    }
}

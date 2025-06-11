<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Hash;

class UserPermissionSeeder extends Seeder
{
    // Inisiasi permission
    private $permissions = [
        'manage-users',
        'manage-projects',
        'manage-tasks',
        'view-tasks',
        'create-tasks',
        'edit-tasks',
        'delete-tasks',
    ];

    private $roles = [
        'Admin' => [
            'manage-users',
            'manage-projects',
            'manage-tasks',
            'view-tasks',
            'create-tasks',
            'edit-tasks',
            'delete-tasks',
        ],
        'Manajer Proyek' => [
            'manage-projects',
            'manage-tasks',
            'view-tasks',
            'create-tasks',
            'edit-tasks',
        ],
        'Anggota Tim' => [
            'view-tasks',
            'create-tasks',
        ],
    ];

    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Membuat permissions
        foreach ($this->permissions as $permission) {
            Permission::create(['name' => $permission]);
        }

        // Membuat role
        foreach ($this->roles as $roleName => $permissions) {
            $role = Role::create(['name' => $roleName]);
            $role->syncPermissions($permissions);
        }

        // Membuat user
        $adminUser = User::create([
            'name' => 'Admin',
            'username' => 'admin',
            'email' => 'admin@admin.com',
            'password' => Hash::make('password'),
            'role' => 'Admin'
        ]);

        $managerUser = User::create([
            'name' => 'Indra Farhan',
            'username' => 'Indra',
            'email' => 'Indra@example.com',
            'password' => Hash::make('password'),
            'role' => 'Manajer Proyek'
        ]);

        $memberUser = User::create([
            'name' => 'Reza',
            'username' => 'Reza',
            'email' => 'Reza@example.com',
            'password' => Hash::make('password'),
            'role' => 'Anggota Tim'
        ]);
        $memberUser = User::create([
            'name' => 'Khai',
            'username' => 'Khai',
            'email' => 'Khai@example.com',
            'password' => Hash::make('password'),
            'role' => 'Anggota Tim'
        ]);
        $memberUser = User::create([
            'name' => 'Rafly',
            'username' => 'Rafly',
            'email' => 'Rafly@example.com',
            'password' => Hash::make('password'),
            'role' => 'Anggota Tim'
        ]);

        // Assign role ke user
        $adminUser->assignRole('Admin');
        $managerUser->assignRole('Manajer Proyek');
        $memberUser->assignRole('Anggota Tim');
    }
}
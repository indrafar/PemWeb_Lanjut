<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Delete existing roles and permissions
        Role::query()->delete();
        Permission::query()->delete();

        // Create roles
        $adminRole = Role::create(['name' => 'Admin']);
        $managerRole = Role::create(['name' => 'Project Manager']);
        $memberRole = Role::create(['name' => 'Team Member']);

        // Create permissions
        $permissions = [
            'create tasks',
            'edit tasks',
            'delete tasks',
            'manage users',
            'manage projects'
        ];

        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission]);
        }

        // Assign permissions to roles
        $adminRole->givePermissionTo(Permission::all());
        
        $managerRole->givePermissionTo([
            'create tasks',
            'edit tasks',
            'delete tasks',
            'manage projects'
        ]);

        $memberRole->givePermissionTo([
            'create tasks',
            'edit tasks'
        ]);

        // Call UserPermissionSeeder
        $this->call([
            UserPermissionSeeder::class,
        ]);
    }
}

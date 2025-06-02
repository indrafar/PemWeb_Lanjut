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
        'role',
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

        // Membuat user
        $user = User::create([
            'name' => 'gober',
            'username' => 'indra',
            'email' => 'indra@gmail.com',
            'password' => Hash::make('12345')
        ]);

        // Membuat role
        $role = Role::create(['name' => 'Superadmin']);

        // Mengambil semua permissions
        $permissions = Permission::pluck('id', 'id')->all();

        // Sinkronisasi permissions ke role
        $role->syncPermissions($permissions);

        // Assign role ke user
        if ($user && $role) {
            $user->assignRole([$role->name]);
        }
    }
}
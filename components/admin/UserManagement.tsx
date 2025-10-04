import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getUsers, getManagers, createUser } from '../../services/api';
import { User, Role } from '../../types';
import { ROLES } from '../../constants';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { PlusCircleIcon } from '../common/Icons';

const UserManagement: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [managers, setManagers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const [newUserName, setNewUserName] = useState('');
    const [newUserEmail, setNewUserEmail] = useState('');
    const [newUserRole, setNewUserRole] = useState<Role>(Role.Employee);
    const [newUserManangerId, setNewUserManangerId] = useState<string>('');
    const [isCreatingUser, setIsCreatingUser] = useState(false);

    const userMap = useMemo(() => {
        return new Map(users.map(user => [user.id, user.name]));
    }, [users]);

    const fetchAllData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [fetchedUsers, fetchedManagers] = await Promise.all([getUsers(), getManagers()]);
            setUsers(fetchedUsers);
            setManagers(fetchedManagers);
        } catch (error) {
            console.error("Failed to fetch data:", error);
            setError("Failed to load user data.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreatingUser(true);
        setError('');
        try {
            await createUser({ name: newUserName, email: newUserEmail, role: newUserRole, managerId: newUserManangerId });
            setNewUserName('');
            setNewUserEmail('');
            setNewUserRole(Role.Employee);
            setNewUserManangerId('');
            await fetchAllData(); // Refresh list
        } catch (err: any) {
            console.error("Failed to create user:", err);
            setError(err.message || "Failed to create user.");
        } finally {
            setIsCreatingUser(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
                <Card title="Create New User">
                    <form onSubmit={handleCreateUser} className="space-y-4">
                        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                        <Input
                            id="newUserName"
                            label="Username"
                            value={newUserName}
                            onChange={(e) => setNewUserName(e.target.value)}
                            required
                        />
                         <Input
                            id="newUserEmail"
                            label="User Email"
                            type="email"
                            value={newUserEmail}
                            onChange={(e) => setNewUserEmail(e.target.value)}
                            required
                        />
                        <Select
                            id="newUserRole"
                            label="User Role"
                            value={newUserRole}
                            onChange={(e) => setNewUserRole(e.target.value as Role)}
                        >
                            {ROLES.map(role => <option key={role} value={role}>{role}</option>)}
                        </Select>
                        <Select
                            id="newUserManangerId"
                            label="Manager Assigned"
                            value={newUserManangerId}
                            onChange={(e) => setNewUserManangerId(e.target.value)}
                        >
                            <option value="">None</option>
                            {managers.map(manager => <option key={manager.id} value={manager.id}>{manager.name}</option>)}
                        </Select>
                        <div className="text-center pt-2">
                             <Button type="submit" disabled={isCreatingUser}>
                                <PlusCircleIcon className="h-5 w-5 mr-2"/>
                                {isCreatingUser ? 'Creating...' : 'Create User'}
                            </Button>
                            <p className="text-xs text-gray-500 mt-2">(Default password will be '1234')</p>
                        </div>
                    </form>
                </Card>
            </div>
            <div className="lg:col-span-2">
                <Card title="All Users">
                    {isLoading ? (
                        <p>Loading users...</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Role</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Manager</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {users.map(user => (
                                        <tr key={user.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{user.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{user.email}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{user.role}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{user.managerId ? userMap.get(user.managerId) || 'N/A' : 'N/A'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default UserManagement;
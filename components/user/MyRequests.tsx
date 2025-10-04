import React, { useState, useEffect, useMemo } from 'react';
import { getMyExpenseRequests, getUsers } from '../../services/api';
import { User, ExpenseRequest, ApprovalStatus } from '../../types';
import { Card } from '../common/Card';

interface MyRequestsProps {
    user: User;
}

const StatusBadge: React.FC<{ status: ApprovalStatus }> = ({ status }) => {
    const statusClasses = {
        [ApprovalStatus.Draft]: 'bg-gray-200 text-gray-800',
        [ApprovalStatus.Pending]: 'bg-yellow-200 text-yellow-800',
        [ApprovalStatus.Approved]: 'bg-green-200 text-green-800',
        [ApprovalStatus.Rejected]: 'bg-red-200 text-red-800',
    };
    return (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClasses[status]}`}>
            {status}
        </span>
    );
};

const MyRequests: React.FC<MyRequestsProps> = ({ user }) => {
    const [requests, setRequests] = useState<ExpenseRequest[]>([]);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const userMap = useMemo(() => {
        return new Map(allUsers.map(u => [u.id, u.name]));
    }, [allUsers]);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [myRequests, users] = await Promise.all([getMyExpenseRequests(), getUsers()]);
                setRequests(myRequests);
                setAllUsers(users);
            } catch (error) {
                console.error("Failed to fetch requests:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [user.id]);

    const getUserName = (id: string) => userMap.get(id) || 'Unknown User';

    return (
        <Card title="My Submitted Requests">
            {isLoading ? (
                <p>Loading your requests...</p>
            ) : requests.length === 0 ? (
                <p>You have not submitted any expense requests.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Description</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Approvers</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {requests.map(req => (
                                <tr key={req.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{new Date(req.expenseDate).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{req.description}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{new Intl.NumberFormat('en-US', { style: 'currency', currency: req.currency }).format(req.amount)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={req.status} /></td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                        {req.approvers.map(a => `${getUserName(a.userId)} (${a.status})`).join(', ') || 'N/A'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </Card>
    );
};

export default MyRequests;
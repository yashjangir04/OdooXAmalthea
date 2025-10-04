import React, { useState, useEffect, useMemo } from 'react';
import { getApprovalQueue, processApproval, getUsers } from '../../services/api';
import { User, ExpenseRequest } from '../../types';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { CheckCircleIcon, XCircleIcon } from '../common/Icons';

interface ApprovalQueueProps {
    user: User;
    onProcessed: () => void;
}

const ApprovalQueue: React.FC<ApprovalQueueProps> = ({ user, onProcessed }) => {
    const [queue, setQueue] = useState<ExpenseRequest[]>([]);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    const userMap = useMemo(() => {
        return new Map(allUsers.map(u => [u.id, u.name]));
    }, [allUsers]);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [approvalQueue, users] = await Promise.all([getApprovalQueue(), getUsers()]);
                setQueue(approvalQueue);
                setAllUsers(users);
            } catch (error) {
                console.error("Failed to fetch approval queue:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [user.id]);

    const handleApproval = async (requestId: string, decision: 'Approved' | 'Rejected') => {
        setProcessingId(requestId);
        try {
            await processApproval(requestId, decision);
            setQueue(prevQueue => prevQueue.filter(req => req.id !== requestId));
            onProcessed();
        } catch (error) {
            console.error("Failed to process approval:", error);
        } finally {
            setProcessingId(null);
        }
    };

    const getUserName = (id: string) => userMap.get(id) || 'Unknown User';

    return (
        <Card title="Requests Awaiting Your Approval">
            {isLoading ? (
                <p>Loading your approval queue...</p>
            ) : queue.length === 0 ? (
                <p>You have no pending approvals.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                             <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Submitted By</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Description</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {queue.map(req => (
                                <tr key={req.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{getUserName(req.userId)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{new Date(req.expenseDate).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{req.description}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{new Intl.NumberFormat('en-US', { style: 'currency', currency: req.currency }).format(req.amount)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                        <Button 
                                            size="sm"
                                            onClick={() => handleApproval(req.id, 'Approved')} 
                                            disabled={processingId === req.id}
                                            className="bg-green-600 hover:bg-green-700 focus:ring-green-500"
                                        >
                                            <CheckCircleIcon className="h-5 w-5 mr-1"/> Approve
                                        </Button>
                                        <Button 
                                            size="sm"
                                            variant="danger"
                                            onClick={() => handleApproval(req.id, 'Rejected')} 
                                            disabled={processingId === req.id}
                                        >
                                            <XCircleIcon className="h-5 w-5 mr-1"/> Reject
                                        </Button>
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

export default ApprovalQueue;
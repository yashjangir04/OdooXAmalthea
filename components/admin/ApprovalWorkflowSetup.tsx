import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getUsers, getApprovalWorkflowForUser, saveApprovalWorkflowForUser } from '../../services/api';
import { User, Role, ApprovalWorkflow } from '../../types';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { Input } from '../common/Input';
import { Select } from '../common/Select';

const ApprovalWorkflowSetup: React.FC = () => {
    const [workflowUsers, setWorkflowUsers] = useState<User[]>([]);
    const [selectedUserId, setSelectedUserId] = useState<string>('');
    const [workflow, setWorkflow] = useState<ApprovalWorkflow>({
        approvers: [],
        isSequenced: false,
        minApprovalPercentage: 50,
        specialApproverId: '',
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isFetchingWorkflow, setIsFetchingWorkflow] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');

    const fetchUsers = useCallback(async () => {
        setIsLoading(true);
        try {
            const users = await getUsers();
            // Admins are not part of the approval workflow
            const nonAdminUsers = users.filter(u => u.role !== Role.Admin);
            setWorkflowUsers(nonAdminUsers);
        } catch (error) {
            console.error("Failed to fetch users:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    useEffect(() => {
        if (!selectedUserId) {
            setWorkflow({ approvers: [], isSequenced: false, minApprovalPercentage: 50, specialApproverId: '' });
            return;
        }

        const fetchWorkflow = async () => {
            setIsFetchingWorkflow(true);
            try {
                const savedWorkflow = await getApprovalWorkflowForUser(selectedUserId);
                setWorkflow(savedWorkflow);
            } catch (error) {
                console.error(`Failed to fetch workflow for user ${selectedUserId}:`, error);
                setWorkflow({ approvers: [], isSequenced: false, minApprovalPercentage: 50, specialApproverId: '' });
            } finally {
                setIsFetchingWorkflow(false);
            }
        };

        fetchWorkflow();
    }, [selectedUserId]);

    const handleApproverToggle = (userId: string) => {
        setWorkflow(prev => {
            // Using a Set is a robust way to handle adding/removing unique items.
            const approversSet = new Set(prev.approvers);
            if (approversSet.has(userId)) {
                approversSet.delete(userId);
            } else {
                approversSet.add(userId);
            }
            return { ...prev, approvers: Array.from(approversSet) };
        });
    };

    const handleSaveWorkflow = async () => {
        if (!selectedUserId) {
            setSaveMessage("Please select a user first.");
            return;
        }
        setIsSaving(true);
        setSaveMessage('');
        try {
            await saveApprovalWorkflowForUser(selectedUserId, workflow);
            setSaveMessage('Workflow saved successfully!');
            setTimeout(() => setSaveMessage(''), 3000);
        } catch (error) {
            console.error("Failed to save workflow:", error);
            setSaveMessage('Failed to save workflow.');
        } finally {
            setIsSaving(false);
        }
    };
    
    // A user cannot be their own approver. Filter them out from the list of potential approvers.
    const potentialApprovers = useMemo(() => {
        return workflowUsers.filter(u => u.id !== selectedUserId);
    }, [workflowUsers, selectedUserId]);

    const usersByRole = useMemo(() => {
        return potentialApprovers.reduce((acc, user) => {
            acc[user.role] = [...(acc[user.role] || []), user];
            return acc;
        }, {} as Record<Role, User[]>);
    }, [potentialApprovers]);


    if (isLoading) return <p>Loading users...</p>;

    return (
        <Card title="Configure Approval Chain">
            <div className="space-y-6">
                <div className="max-w-md">
                   <Select
                        id="user-selector"
                        label="Select User to Configure Workflow For"
                        value={selectedUserId}
                        onChange={e => setSelectedUserId(e.target.value)}
                    >
                        <option value="">-- Please select a user --</option>
                        {workflowUsers.map(user => (
                            <option key={user.id} value={user.id}>{user.name} ({user.role})</option>
                        ))}
                    </Select>
                </div>
                
                {!selectedUserId ? (
                    <div className="text-center py-10 border-t border-gray-200 dark:border-gray-700 mt-6">
                        <p className="text-gray-500">Please select a user to view or modify their approval workflow.</p>
                    </div>
                ) : isFetchingWorkflow ? (
                     <div className="text-center py-10 border-t border-gray-200 dark:border-gray-700 mt-6">
                        <p className="text-gray-500">Loading workflow...</p>
                    </div>
                ) : (
                    <>
                        <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                            <h4 className="font-semibold text-lg mb-2">Select Approvers</h4>
                            <p className="text-sm text-gray-500 mb-4">Choose which users will be part of the approval process for <strong>{workflowUsers.find(u => u.id === selectedUserId)?.name}'s</strong> requests. If sequenced, the order is from top to bottom.</p>
                            <div className="space-y-4 max-h-96 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                {Object.keys(usersByRole).length > 0 ? Object.entries(usersByRole).map(([role, usersInRole]) => (
                                    <div key={role}>
                                        <h5 className="font-bold text-md text-gray-700 dark:text-gray-300">{role}</h5>
                                        <ul className="mt-2 space-y-2">
                                            {usersInRole.map(user => (
                                                <li key={user.id} className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        id={`user-${user.id}`}
                                                        checked={workflow.approvers.includes(user.id)}
                                                        onChange={() => handleApproverToggle(user.id)}
                                                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                    />
                                                    <label htmlFor={`user-${user.id}`} className="ml-3 text-sm text-gray-800 dark:text-gray-200">
                                                        {user.name}
                                                    </label>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )) : <p className="text-gray-500">No other users available to be approvers.</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                            <div>
                                <h4 className="font-semibold text-lg mb-2">Workflow Rules</h4>
                                <div className="space-y-4">
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="isSequenced"
                                            checked={workflow.isSequenced}
                                            onChange={e => setWorkflow(prev => ({ ...prev, isSequenced: e.target.checked }))}
                                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <label htmlFor="isSequenced" className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Enforce Approvers Sequence
                                        </label>
                                    </div>
                                    <Input
                                        id="minApprovalPercentage"
                                        label="Minimum Approval Percentage (%)"
                                        type="number"
                                        value={workflow.minApprovalPercentage}
                                        onChange={e => setWorkflow(prev => ({...prev, minApprovalPercentage: parseInt(e.target.value, 10) || 0}))}
                                        min="0"
                                        max="100"
                                    />
                                    <Select
                                        id="specialApprover"
                                        label="Special Approver (Instant Approval)"
                                        value={workflow.specialApproverId || ''}
                                        onChange={e => setWorkflow(prev => ({...prev, specialApproverId: e.target.value || undefined}))}
                                    >
                                        <option value="">None</option>
                                        {potentialApprovers.map(user => (
                                            <option key={user.id} value={user.id}>{user.name}</option>
                                        ))}
                                    </Select>
                                </div>
                            </div>
                            <div>
                                <h4 className="font-semibold text-lg mb-2">Description of Rules</h4>
                                <textarea
                                    rows={6}
                                    className="w-full p-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 dark:bg-gray-700 dark:border-gray-600 border-gray-300 focus:ring-blue-500"
                                    placeholder="Describe the approval rules and process for users..."
                                ></textarea>
                            </div>
                        </div>

                        <div className="flex justify-end items-center pt-6 border-t border-gray-200 dark:border-gray-700">
                            {saveMessage && <p className={`mr-4 ${saveMessage.includes('successfully') ? 'text-green-600' : 'text-red-600'}`}>{saveMessage}</p>}
                            <Button onClick={handleSaveWorkflow} disabled={isSaving}>
                                {isSaving ? 'Saving...' : 'Save Workflow'}
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </Card>
    );
};

export default ApprovalWorkflowSetup;
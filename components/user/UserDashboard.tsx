
import React, { useState } from 'react';
import { User } from '../../types';
import CreateExpenseRequest from './CreateExpenseRequest';
import MyRequests from './MyRequests';
import ApprovalQueue from './ApprovalQueue';

interface UserDashboardProps {
    user: User;
}

type UserTab = 'new' | 'history' | 'approvals';

const UserDashboard: React.FC<UserDashboardProps> = ({ user }) => {
    const [activeTab, setActiveTab] = useState<UserTab>('new');
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleRequestSubmitted = () => {
        // Switch tab to history and trigger a refresh
        setActiveTab('history');
        setRefreshTrigger(t => t + 1);
    }
    
    const handleApprovalProcessed = () => {
        // Just trigger a refresh of the lists
        setRefreshTrigger(t => t + 1);
    }

    const tabClasses = (tabName: UserTab) =>
        `px-4 py-2 font-semibold rounded-t-lg transition-colors ${
        activeTab === tabName
            ? 'bg-white dark:bg-gray-800 border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
        }`;

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200">User Dashboard</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Submit and track your expense requests, and manage approvals.</p>
            </div>
            
            <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                    <button onClick={() => setActiveTab('new')} className={tabClasses('new')}>
                        New Expense Request
                    </button>
                    <button onClick={() => setActiveTab('history')} className={tabClasses('history')}>
                        My Requests
                    </button>
                    <button onClick={() => setActiveTab('approvals')} className={tabClasses('approvals')}>
                        Approval Queue
                    </button>
                </nav>
            </div>

            <div>
                {activeTab === 'new' && <CreateExpenseRequest user={user} onSubmitted={handleRequestSubmitted} />}
                {activeTab === 'history' && <MyRequests user={user} key={`history-${refreshTrigger}`} />}
                {activeTab === 'approvals' && <ApprovalQueue user={user} onProcessed={handleApprovalProcessed} key={`approvals-${refreshTrigger}`} />}
            </div>
        </div>
    );
};

export default UserDashboard;

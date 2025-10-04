
import React, { useState } from 'react';
import UserManagement from './UserManagement';
import ApprovalWorkflowSetup from './ApprovalWorkflowSetup';

type AdminTab = 'users' | 'workflow';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('users');

  const tabClasses = (tabName: AdminTab) =>
    `px-4 py-2 font-semibold rounded-t-lg transition-colors ${
      activeTab === tabName
        ? 'bg-white dark:bg-gray-800 border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
    }`;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Admin Dashboard</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Manage users and configure the approval process.</p>
      </div>

      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-4" aria-label="Tabs">
          <button onClick={() => setActiveTab('users')} className={tabClasses('users')}>
            User Management
          </button>
          <button onClick={() => setActiveTab('workflow')} className={tabClasses('workflow')}>
            Approval Workflow Setup
          </button>
        </nav>
      </div>
      
      <div>
        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'workflow' && <ApprovalWorkflowSetup />}
      </div>
    </div>
  );
};

export default AdminDashboard;

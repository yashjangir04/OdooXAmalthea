
import React from 'react';
import { User } from '../../types';
import { Button } from './Button';
import { UserCircleIcon, LogOutIcon } from './Icons';

interface HeaderProps {
  user: User;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-md p-4 flex justify-between items-center">
      <h1 className="text-xl md:text-2xl font-bold text-blue-600 dark:text-blue-400">
        Expense Approval System
      </h1>
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <UserCircleIcon className="h-6 w-6 text-gray-500 dark:text-gray-400" />
          <span className="hidden sm:inline font-medium text-gray-700 dark:text-gray-300">{user.name} ({user.role})</span>
        </div>
        <Button onClick={onLogout} variant="secondary" size="sm">
          <LogOutIcon className="h-5 w-5 mr-1" />
          Logout
        </Button>
      </div>
    </header>
  );
};

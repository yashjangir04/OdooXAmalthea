
import React, { useState } from 'react';
import { User, ExpenseCategory, ApprovalStatus } from '../../types';
import { createExpenseRequest } from '../../services/api';
import { CURRENCIES, EXPENSE_CATEGORIES } from '../../constants';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { Input } from '../common/Input';
import { Select } from '../common/Select';

interface CreateExpenseRequestProps {
    user: User;
    onSubmitted: () => void;
}

const CreateExpenseRequest: React.FC<CreateExpenseRequestProps> = ({ user, onSubmitted }) => {
    const [description, setDescription] = useState('');
    const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
    const [category, setCategory] = useState<ExpenseCategory>(ExpenseCategory.Other);
    const [paidBy, setPaidBy] = useState('Personal Card');
    const [amount, setAmount] = useState<number | ''>('');
    const [currency, setCurrency] = useState('USD');
    const [remarks, setRemarks] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    
    const handleSubmit = async (status: ApprovalStatus) => {
        if (!description || !amount) {
            setError('Description and Amount are required.');
            return;
        }
        setError('');
        setIsSubmitting(true);
        try {
            await createExpenseRequest({
                userId: user.id,
                description,
                expenseDate,
                category,
                paidBy,
                amount: Number(amount),
                currency,
                remarks,
                status,
            });
            onSubmitted();
        } catch (err) {
            setError('Failed to submit request.');
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    return (
        <Card title="New Expense Details">
            <form className="space-y-4">
                {error && <p className="text-red-500 bg-red-100 p-3 rounded-md">{error}</p>}
                <Input
                    id="description"
                    label="Description"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    required
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        id="expenseDate"
                        label="Expense Date"
                        type="date"
                        value={expenseDate}
                        onChange={e => setExpenseDate(e.target.value)}
                        required
                    />
                    <Select
                        id="category"
                        label="Category"
                        value={category}
                        onChange={e => setCategory(e.target.value as ExpenseCategory)}
                    >
                        {EXPENSE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </Select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                        id="paidBy"
                        label="Paid By"
                        value={paidBy}
                        onChange={e => setPaidBy(e.target.value)}
                    />
                    <Input
                        id="amount"
                        label="Total Amount"
                        type="number"
                        value={amount}
                        onChange={e => setAmount(e.target.value === '' ? '' : parseFloat(e.target.value))}
                        required
                    />
                    <Select
                        id="currency"
                        label="Currency"
                        value={currency}
                        onChange={e => setCurrency(e.target.value)}
                    >
                        {CURRENCIES.map(curr => <option key={curr} value={curr}>{curr}</option>)}
                    </Select>
                </div>
                <div>
                    <label htmlFor="remarks" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Remarks / Description</label>
                    <textarea
                        id="remarks"
                        rows={4}
                        value={remarks}
                        onChange={e => setRemarks(e.target.value)}
                        className="w-full p-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 dark:bg-gray-700 dark:border-gray-600 border-gray-300 focus:ring-blue-500"
                    ></textarea>
                </div>

                <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button type="button" variant="secondary" onClick={() => handleSubmit(ApprovalStatus.Draft)} disabled={isSubmitting}>
                        {isSubmitting ? 'Saving...' : 'Save as Draft'}
                    </Button>
                    <Button type="button" onClick={() => handleSubmit(ApprovalStatus.Pending)} disabled={isSubmitting}>
                        {isSubmitting ? 'Submitting...' : 'Submit for Approval'}
                    </Button>
                </div>
            </form>
        </Card>
    );
};

export default CreateExpenseRequest;

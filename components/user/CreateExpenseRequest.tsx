
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
    const [receiptImage, setReceiptImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            setReceiptImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setReceiptImage(null);
            setImagePreview(null);
        }
        // Clear the input value to allow re-selecting the same file
        e.target.value = '';
    };

    const removeImage = () => {
        setReceiptImage(null);
        setImagePreview(null);
    }
    
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
            }, receiptImage);
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
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
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
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                     <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Attach Receipt</label>
                         <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md">
                            <div className="space-y-1 text-center">
                                {imagePreview ? (
                                    <div>
                                        <img src={imagePreview} alt="Receipt Preview" className="mx-auto h-24 w-auto rounded-md" />
                                        <button type="button" onClick={removeImage} className="mt-2 text-sm text-red-600 hover:text-red-500">Remove Image</button>
                                    </div>
                                ) : (
                                    <>
                                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path></svg>
                                        <div className="flex text-sm text-gray-600 dark:text-gray-400">
                                            <label htmlFor="file-upload" className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"><span className="px-1">Upload a file</span><input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleFileChange} /></label>
                                            <p className="pl-1">or drag and drop</p>
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-500">PNG, JPG, GIF up to 10MB</p>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
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
import { User, Role, ExpenseRequest, ApprovalWorkflow, ApprovalStatus } from '../types';
import { COUNTRIES } from '../constants';

const API_BASE_URL = 'http://localhost:5000/api';

// --- Helper for API calls ---
const apiFetch = async (url: string, options: Omit<RequestInit, 'body'> & { body?: any } = {}) => {
  options.credentials = 'include';
  
  if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
    options.headers = { ...options.headers, 'Content-Type': 'application/json' };
    options.body = JSON.stringify(options.body);
  }

  const response = await fetch(`${API_BASE_URL}${url}`, options as RequestInit);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  
  // Handle responses with no content
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return null;
  }
  
  return response.json();
};


// --- API Functions ---

export const fetchCurrencyForCountry = async (countryCode: string): Promise<string> => {
  // This remains a client-side constant lookup, no need for an API call.
  return Promise.resolve(COUNTRIES[countryCode]?.currency || 'USD');
};

export const adminSignup = async (details: Omit<User, 'id' | 'role'> & { password?: string }): Promise<User> => {
    return apiFetch('/auth/signup', {
        method: 'POST',
        body: details,
    });
};

export const login = async (email: string, password_unused: string): Promise<User> => {
    return apiFetch('/auth/login', {
        method: 'POST',
        body: { email, password: password_unused },
    });
};

export const logoutUser = async (): Promise<void> => {
    await apiFetch('/auth/logout', { method: 'POST' });
};

export const getCurrentUser = async (): Promise<User | null> => {
    try {
        return await apiFetch('/auth/current-user');
    } catch (error) {
        console.warn("Not logged in:", error);
        return null;
    }
}

export const createUser = async (details: { name: string, email: string, role: Role, managerId?: string }): Promise<User> => {
    return apiFetch('/users', {
        method: 'POST',
        body: details,
    });
};

export const getUsers = async (): Promise<User[]> => {
    return apiFetch('/users');
};

export const getManagers = async (): Promise<User[]> => {
    return apiFetch('/users/managers');
};

export const getApprovalWorkflowForUser = async (userId: string): Promise<ApprovalWorkflow> => {
    return apiFetch(`/workflows/${userId}`);
}

export const saveApprovalWorkflowForUser = async (userId: string, workflow: ApprovalWorkflow): Promise<ApprovalWorkflow> => {
    return apiFetch(`/workflows/${userId}`, {
        method: 'POST',
        body: workflow,
    });
}

export const createExpenseRequest = async (request: Omit<ExpenseRequest, 'id' | 'createdAt' | 'approvers' | 'receiptImageUrl'>, receiptImage: File | null): Promise<ExpenseRequest> => {
    const formData = new FormData();

    // FormData can only append strings or Blobs (Files are Blobs)
    Object.entries(request).forEach(([key, value]) => {
        formData.append(key, String(value));
    });

    if (receiptImage) {
        formData.append('receiptImage', receiptImage, receiptImage.name);
    }

    return apiFetch('/expenses', {
        method: 'POST',
        body: formData, // pass FormData directly
    });
};

export const getMyExpenseRequests = async (): Promise<ExpenseRequest[]> => {
    return apiFetch('/expenses');
};

export const getApprovalQueue = async (): Promise<ExpenseRequest[]> => {
    return apiFetch('/expenses/queue');
};

export const processApproval = async (requestId: string, decision: 'Approved' | 'Rejected'): Promise<ExpenseRequest> => {
    return apiFetch(`/expenses/${requestId}/process`, {
        method: 'POST',
        body: { decision },
    });
};
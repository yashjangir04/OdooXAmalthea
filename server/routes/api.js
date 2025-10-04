const express = require('express');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const User = require('../models/UserModel');
const ExpenseRequest = require('../models/ExpenseRequestModel');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() }); // Use memory storage for simplicity

// --- AUTH ROUTES ---

// POST /api/auth/signup (Admin only)
router.post('/auth/signup', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already exists.' });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        const newAdmin = new User({ name, email, password: hashedPassword, role: 'Admin' });
        await newAdmin.save();

        res.status(201).json(newAdmin);
    } catch (error) {
        console.error("Error during admin signup:", error);
        res.status(500).json({ message: 'Server error during signup.' });
    }
});

// POST /api/auth/login
router.post('/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }

        req.session.user = { id: user._id, name: user.name, role: user.role };

        res.json(user);
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ message: 'Server error during login.' });
    }
});

// GET /api/auth/current-user
router.get('/auth/current-user', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.session.user.id);
        if (!user) {
            req.session.destroy();
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error("Error fetching current user:", error);
        res.status(500).json({ message: 'Server error' });
    }
});

// POST /api/auth/logout
router.post('/auth/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error("Error during logout:", err);
      return res.status(500).json({ message: 'Could not log out, please try again.' });
    }
    res.clearCookie('connect.sid'); // The default session cookie name
    res.status(200).json({ message: 'Logged out successfully' });
  });
});


// --- USER ROUTES ---
router.use(authMiddleware); // Protect all routes below

// GET /api/users
router.get('/users', async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch(error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: 'Server error fetching users.' });
    }
});

// GET /api/users/managers
router.get('/users/managers', async (req, res) => {
    try {
        const managers = await User.find({ role: 'Manager' });
        res.json(managers);
    } catch(error) {
        console.error("Error fetching managers:", error);
        res.status(500).json({ message: 'Server error fetching managers.' });
    }
});

// POST /api/users
router.post('/users', async (req, res) => {
    if (req.session.user.role !== 'Admin') {
        return res.status(403).json({ message: 'Forbidden' });
    }
    const { name, email, role, managerId } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'A user with this email already exists.' });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('1234', salt); // Default password

        const newUserPayload = { name, email, role, password: hashedPassword };
        // Only include managerId if it's a non-empty string, otherwise Mongoose will throw a CastError
        if (managerId) {
            newUserPayload.managerId = managerId;
        }

        const newUser = new User(newUserPayload);
        await newUser.save();

        res.status(201).json(newUser);
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ message: 'Server error creating user.' });
    }
});


// --- WORKFLOW ROUTES ---

// GET /api/workflows/:userId
router.get('/workflows/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user.workflow);
    } catch(error) {
        console.error(`Error fetching workflow for user ${req.params.userId}:`, error);
        res.status(500).json({ message: 'Server error fetching workflow.' });
    }
});

// POST /api/workflows/:userId
router.post('/workflows/:userId', async (req, res) => {
    if (req.session.user.role !== 'Admin') {
        return res.status(403).json({ message: 'Forbidden' });
    }
    try {
        const user = await User.findByIdAndUpdate(
            req.params.userId,
            { $set: { workflow: req.body } },
            { new: true, runValidators: true }
        );
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user.workflow);
    } catch (error) {
         console.error(`Error saving workflow for user ${req.params.userId}:`, error);
         res.status(500).json({ message: 'Server error saving workflow.' });
    }
});


// --- EXPENSE ROUTES ---

// GET /api/expenses (My requests)
router.get('/expenses', async (req, res) => {
    try {
        const requests = await ExpenseRequest.find({ userId: req.session.user.id }).sort({ createdAt: -1 });
        res.json(requests);
    } catch(error) {
        console.error("Error fetching user's expense requests:", error);
        res.status(500).json({ message: "Server error fetching your requests." });
    }
});

// GET /api/expenses/queue (My approval queue)
router.get('/expenses/queue', async (req, res) => {
    try {
        const myId = req.session.user.id;
        // Find requests where I am a pending approver
        const potentialRequests = await ExpenseRequest.find({
            status: 'Pending',
            'approvers.userId': myId,
            'approvers.status': 'Pending'
        }).populate('userId');

        const queue = [];
        for (const req of potentialRequests) {
            // Handle case where user was deleted but requests remain
            if (!req.userId) continue;

            const workflow = req.userId.workflow; // Populated user has workflow
            if (!workflow.isSequenced) {
                queue.push(req);
                continue;
            }

            // It's sequenced, check if it's my turn
            const myApproverIndex = req.approvers.findIndex(a => a.userId.toString() === myId);
            
            let isMyTurn = true;
            for (let i = 0; i < myApproverIndex; i++) {
                if (req.approvers[i].status !== 'Approved') {
                    isMyTurn = false;
                    break;
                }
            }
            if (isMyTurn) {
                queue.push(req);
            }
        }

        res.json(queue);
    } catch (error) {
        console.error("Error fetching approval queue:", error);
        res.status(500).json({ message: "Server error fetching approval queue." });
    }
});


// POST /api/expenses
router.post('/expenses', upload.single('receiptImage'), async (req, res) => {
    const { userId, ...rest } = req.body;
    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        const newRequestData = { userId, ...rest };
        
        // As we are using multer, number values come in as strings
        newRequestData.amount = Number(newRequestData.amount);

        if (req.file) {
            // We are not saving the file, but we record that it was uploaded.
            newRequestData.receiptImageUrl = req.file.originalname;
        }

        if (newRequestData.status === 'Pending') {
            newRequestData.approvers = user.workflow.approvers.map(approverId => ({
                userId: approverId,
                status: 'Pending'
            }));
        }

        const newRequest = new ExpenseRequest(newRequestData);
        await newRequest.save();
        res.status(201).json(newRequest);
    } catch (error) {
        console.error("Error creating expense request:", error);
        res.status(500).json({ message: 'Server error creating expense request.' });
    }
});

// POST /api/expenses/:id/process
router.post('/expenses/:id/process', async (req, res) => {
    const { decision } = req.body; // 'Approved' or 'Rejected'
    const approverId = req.session.user.id;
    const { id: requestId } = req.params;

    try {
        const request = await ExpenseRequest.findById(requestId).populate('userId');
        if (!request) return res.status(404).json({ message: "Request not found" });
        if (!request.userId) return res.status(404).json({ message: "Original user for this request not found." });


        const approverIndex = request.approvers.findIndex(a => a.userId.toString() === approverId);
        if (approverIndex === -1) return res.status(403).json({ message: "You are not an approver on this request." });

        request.approvers[approverIndex].status = decision;

        const workflow = request.userId.workflow;

        // Check for final status
        if (decision === 'Rejected') {
            request.status = 'Rejected';
        } else if (workflow.specialApproverId && workflow.specialApproverId.toString() === approverId) {
            request.status = 'Approved';
        } else {
            const approvedCount = request.approvers.filter(a => a.status === 'Approved').length;
            const totalApprovers = request.approvers.length;
            const approvalPercentage = totalApprovers > 0 ? (approvedCount / totalApprovers) * 100 : 0;
            
            if (approvalPercentage >= workflow.minApprovalPercentage) {
                request.status = 'Approved';
            } else if (approvedCount + request.approvers.filter(a => a.status === 'Rejected').length === totalApprovers) {
                // All have voted, but percentage not met
                request.status = 'Rejected';
            }
        }

        await request.save();
        res.json(request);
    } catch(error) {
        console.error(`Error processing approval for request ${requestId}:`, error);
        res.status(500).json({ message: 'Server error processing approval.' });
    }
});


module.exports = router;
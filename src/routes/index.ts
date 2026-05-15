import { Router } from 'express';
import * as auth from '../controllers/authController';
import * as forms from '../controllers/formController';
import * as subs from '../controllers/submissionController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Auth
router.post('/auth/register', auth.register);
router.post('/auth/login', auth.login);
router.post('/auth/google', auth.googleLogin);
router.get('/users/me', authMiddleware, auth.getProfile);
router.put('/users/me', authMiddleware, auth.updateProfile);

// Forms
router.get('/forms', authMiddleware, forms.getForms);
router.post('/forms', authMiddleware, forms.createForm);
router.get('/forms/stats', authMiddleware, forms.getStats);
router.get('/forms/:id', authMiddleware, forms.getForm);
router.put('/forms/:id', authMiddleware, forms.updateForm);
router.patch('/forms/:id', authMiddleware, forms.patchForm);
router.delete('/forms/:id', authMiddleware, forms.deleteForm);

// Submissions
router.get('/submissions/form/:formId', authMiddleware, subs.getSubmissions);
router.delete('/submissions/:id', authMiddleware, subs.deleteSubmission);

// Public Submissions
router.post('/submissions/f/:uuid', subs.submitForm);

export default router;

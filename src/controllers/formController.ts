import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { Form } from '../models/Form';
import { Submission } from '../models/Submission';

// Serialize DB form doc → frontend-compatible shape (structure → schema)
function serializeForm(form: any) {
  const obj = form.toObject ? form.toObject() : form;
  return {
    ...obj,
    schema: obj.structure ?? { steps: [] },
    structure: undefined,
  };
}

export const getForms = async (req: AuthRequest, res: Response) => {
  try {
    const forms = await Form.find({ user: req.user?.id }).sort({ updatedAt: -1 });
    res.json({ forms: forms.map(serializeForm) });
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
};

export const createForm = async (req: AuthRequest, res: Response) => {
  try {
    // Frontend sends 'structure' (already mapped in builder/page.tsx)
    const form = await Form.create({ ...req.body, user: req.user?.id });
    res.status(201).json({ form: serializeForm(form) });
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
};

export const getForm = async (req: AuthRequest, res: Response) => {
  try {
    const form = await Form.findOne({ _id: req.params.id, user: req.user?.id });
    if (!form) return res.status(404).json({ message: 'Form not found' });
    res.json({ form: serializeForm(form) });
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
};

export const updateForm = async (req: AuthRequest, res: Response) => {
  try {
    const form = await Form.findOneAndUpdate(
      { _id: req.params.id, user: req.user?.id },
      req.body,
      { new: true }
    );
    if (!form) return res.status(404).json({ message: 'Form not found' });
    res.json({ form: serializeForm(form) });
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
};

export const deleteForm = async (req: AuthRequest, res: Response) => {
  try {
    const form = await Form.findOneAndDelete({ _id: req.params.id, user: req.user?.id });
    if (!form) return res.status(404).json({ message: 'Form not found' });
    await Submission.deleteMany({ form: form._id });
    res.json({ message: 'Form deleted' });
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
};

export const patchForm = async (req: AuthRequest, res: Response) => {
  try {
    const form = await Form.findOneAndUpdate(
      { _id: req.params.id, user: req.user?.id },
      { $set: req.body },
      { new: true }
    );
    if (!form) return res.status(404).json({ message: 'Form not found' });
    res.json({ form: serializeForm(form) });
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
};

export const getStats = async (req: AuthRequest, res: Response) => {
  try {
    const forms = await Form.find({ user: req.user?.id });
    const totalForms = forms.length;
    const totalSubmissions = forms.reduce((acc, f) => acc + (f.submissionCount || 0), 0);
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const thisMonthForms = await Form.find({ user: req.user?.id, createdAt: { $gte: startOfMonth } });
    const thisMonth = thisMonthForms.reduce((acc, f) => acc + (f.submissionCount || 0), 0);

    res.json({ stats: { totalForms, totalSubmissions, thisMonth } });
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
};

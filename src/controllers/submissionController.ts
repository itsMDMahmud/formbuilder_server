import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { Form } from '../models/Form';
import { Submission } from '../models/Submission';

export const submitForm = async (req: Request, res: Response) => {
  const { uuid } = req.params;
  try {
    const form = await Form.findOne({ uuid, status: 'published' });
    if (!form) return res.status(404).json({ message: 'Form not found or not published' });

    await Submission.create({
      form: form._id,
      data: req.body,
      userAgent: req.headers['user-agent'],
      ip: req.ip,
    });

    await Form.updateOne({ _id: form._id }, { $inc: { submissionCount: 1 } });

    res.status(201).json({ message: 'Submitted successfully' });
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
};

export const getSubmissions = async (req: AuthRequest, res: Response) => {
  const { formId } = req.params;
  try {
    const form = await Form.findOne({ _id: formId, user: req.user?.id });
    if (!form) return res.status(404).json({ message: 'Form not found' });

    const submissions = await Submission.find({ form: formId }).sort({ createdAt: -1 });
    res.json({ submissions });
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
};

export const deleteSubmission = async (req: AuthRequest, res: Response) => {
  try {
    const sub = await Submission.findById(req.params.id);
    if (!sub) return res.status(404).json({ message: 'Submission not found' });

    const form = await Form.findOne({ _id: sub.form, user: req.user?.id });
    if (!form) return res.status(403).json({ message: 'Access denied' });

    await Submission.findByIdAndDelete(req.params.id);
    await Form.updateOne({ _id: form._id }, { $inc: { submissionCount: -1 } });

    res.json({ message: 'Submission deleted' });
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
};

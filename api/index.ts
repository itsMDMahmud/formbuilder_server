import app from '../src/app';
import { connectDB } from '../src/config/db';

export default async (req: any, res: any) => {
  await connectDB();
  return app(req, res);
};

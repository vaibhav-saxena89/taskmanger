import mongoose, { Schema, model, models } from 'mongoose';

const taskSchema = new Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '', trim: true },
  completed: { type: Boolean, default: false },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  assignedTo: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  status: { type: String, enum: ['Pending', 'In Progress', 'Completed', 'Cancelled'], default: 'Pending' },
  dueDate: { type: Date, default: null },
}, { timestamps: true });

const Task = models.Task || model('Task', taskSchema);
export default Task;

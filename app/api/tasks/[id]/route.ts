import { connectDB } from '@/lib/mongodb';
import Task from '@/models/Task';
import { NextResponse } from 'next/server';

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { params } = context;
  const awaitedParams = await params;

  await connectDB();
  await Task.findByIdAndDelete(awaitedParams.id);
  return NextResponse.json({ message: 'Task deleted' });
}

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { params } = context;
  const awaitedParams = await params;

  const body = await req.json();

  await connectDB();
  const updatedTask = await Task.findByIdAndUpdate(awaitedParams.id, body, { new: true });

  if (!updatedTask) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  }

  return NextResponse.json(updatedTask);
}

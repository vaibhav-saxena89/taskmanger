'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface Task {
  _id: string;
  title: string;
  completed: boolean;
}

export default function HomePage() {
  const router = useRouter();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch tasks from API
  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/tasks');
      if (!res.ok) throw new Error('Failed to fetch tasks');
      const data = await res.json();
      setTasks(data);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Logout function
  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
      });
      if (res.ok) {
        router.push('/login');
      } else {
        alert('Logout failed');
      }
    } catch (error) {
      console.error('Logout error:', error);
      alert('Logout failed');
    }
  };

  // Example: assuming you have userId stored somewhere (e.g., state, context, or props)
const userId = '64bfa7e6b8656c00238d7d1a';  // Replace with actual userId dynamically

const addTask = async () => {
  if (!title.trim()) return;

  try {
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, userId }),  // <-- add userId here
    });

    if (!res.ok) throw new Error('Failed to add task');

    setTitle('');
    fetchTasks();
  } catch (error) {
    console.error('Add task error:', error);
    alert('Failed to add task');
  }
};


  // Delete a task by id
  const deleteTask = async (id: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete task');
      fetchTasks();
    } catch (error) {
      console.error('Delete task error:', error);
      alert('Failed to delete task');
    }
  };

  // Toggle completion status
  const toggleComplete = async (task: Task) => {
    try {
      const res = await fetch(`/api/tasks/${task._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !task.completed }),
      });
      if (!res.ok) throw new Error('Failed to update task');
      fetchTasks();
    } catch (error) {
      console.error('Toggle complete error:', error);
      alert('Failed to update task');
    }
  };

  // Edit task title
  const editTitle = async (id: string, newTitle: string) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle }),
      });
      if (!res.ok) throw new Error('Failed to update task');
      fetchTasks();
    } catch (error) {
      console.error('Edit title error:', error);
      alert('Failed to update task');
    }
  };

  // Export tasks as CSV
  const exportCSV = () => {
    if (tasks.length === 0) {
      alert('No tasks to export');
      return;
    }
    const headers = ['ID', 'Title', 'Completed'];
    const rows = tasks.map((t) => [t._id, `"${t.title.replace(/"/g, '""')}"`, t.completed ? 'Yes' : 'No']);
    const csvContent =
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'tasks.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export tasks as PDF using jsPDF
  const exportPDF = () => {
    if (tasks.length === 0) {
      alert('No tasks to export');
      return;
    }
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Task List', 14, 22);

    const columns = ['ID', 'Title', 'Completed'];
    const rows = tasks.map((t) => [t._id, t.title, t.completed ? 'Yes' : 'No']);

    (doc as any).autoTable({
      head: [columns],
      body: rows,
      startY: 30,
    });

    doc.save('tasks.pdf');
  };

  return (
    <main className="p-10 max-w-xl mx-auto">
      {/* Header with logout button */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-600">Task Manager ✅</h1>
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Logout
        </button>
      </div>

      {/* Input and Add Button */}
      <div className="flex gap-2 mb-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border p-2 flex-1 rounded"
          placeholder="Enter a task..."
          onKeyDown={(e) => {
            if (e.key === 'Enter') addTask();
          }}
        />
        <button
          onClick={addTask}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add
        </button>
      </div>

      {/* Export Buttons */}
      <div className="flex gap-4 mb-4">
        <button
          onClick={exportCSV}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          Export CSV
        </button>
        <button
          onClick={exportPDF}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
        >
          Export PDF
        </button>
      </div>

      {/* Task List */}
      {loading ? (
        <p>Loading tasks...</p>
      ) : (
        <ul className="space-y-2">
          {tasks.map((task) => (
            <li
              key={task._id}
              className="flex items-center justify-between border p-2 rounded shadow"
            >
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleComplete(task)}
                />
                <EditableTitle task={task} onSave={editTitle} />
              </div>
              <button
                onClick={() => deleteTask(task._id)}
                className="text-red-500 hover:underline"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

function EditableTitle({
  task,
  onSave,
}: {
  task: Task;
  onSave: (id: string, newTitle: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(task.title);

  useEffect(() => {
    setValue(task.title);
  }, [task.title]);

  const handleBlur = () => {
    setIsEditing(false);
    if (value.trim() && value !== task.title) {
      onSave(task._id, value.trim());
    } else {
      setValue(task.title);
    }
  };

  return isEditing ? (
    <input
      className="border px-2 py-1 rounded"
      value={value}
      autoFocus
      onChange={(e) => setValue(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={(e) => {
        if (e.key === 'Enter') handleBlur();
        if (e.key === 'Escape') {
          setIsEditing(false);
          setValue(task.title);
        }
      }}
    />
  ) : (
    <span
      onClick={() => setIsEditing(true)}
      className={`cursor-pointer ${task.completed ? 'line-through text-gray-500' : ''}`}
      title="Click to edit"
    >
      {task.title}
    </span>
  );
}

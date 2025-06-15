
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

  const addTask = async () => {
    if (!title.trim()) return;
    try {
      setLoading(true);
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim() }),
      });
      if (!res.ok) throw new Error('Failed to add task');
      setTitle('');
      await fetchTasks();
    } catch (error) {
      console.error('Add task error:', error);
      alert('Failed to add task');
    } finally {
      setLoading(false);
    }
  };

  const deleteTask = async (id: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete task');
      await fetchTasks();
    } catch (error) {
      console.error('Delete task error:', error);
      alert('Failed to delete task');
    } finally {
      setLoading(false);
    }
  };

  const toggleComplete = async (task: Task) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/tasks/${task._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !task.completed }),
      });
      if (!res.ok) throw new Error('Failed to update task');
      await fetchTasks();
    } catch (error) {
      console.error('Toggle complete error:', error);
      alert('Failed to update task');
    } finally {
      setLoading(false);
    }
  };

  const editTitle = async (id: string, newTitle: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle }),
      });
      if (!res.ok) throw new Error('Failed to update title');
      await fetchTasks();
    } catch (error) {
      console.error('Edit title error:', error);
      alert('Failed to update title');
    } finally {
      setLoading(false);
    }
  };

  // CSV export
  const exportCSV = () => {
    const header = ['Title', 'Completed'];
    const rows = tasks.map((task) => [task.title, task.completed ? 'Yes' : 'No']);
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += header.join(',') + '\n';
    rows.forEach((row) => {
      csvContent += row.join(',') + '\n';
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'tasks.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // PDF export using jsPDF and autotable
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text('Tasks List', 14, 20);
    const rows = tasks.map((task) => [task.title, task.completed ? 'Yes' : 'No']);
    (doc as any).autoTable({
      head: [['Title', 'Completed']],
      body: rows,
      startY: 30,
    });
    doc.save('tasks.pdf');
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
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

  return (
    <main className="p-10 max-w-xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-600">Task Manager ✅</h1>
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Logout
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border p-2 flex-1"
          placeholder="Enter a task..."
          onKeyDown={(e) => {
            if (e.key === 'Enter') addTask();
          }}
          disabled={loading}
        />
        <button
          onClick={addTask}
          className="bg-blue-500 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          Add
        </button>
      </div>

      <div className="flex gap-4 mb-4">
        <button
          onClick={exportCSV}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
          disabled={loading || tasks.length === 0}
        >
          Export CSV
        </button>
        <button
          onClick={exportPDF}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
          disabled={loading || tasks.length === 0}
        >
          Export PDF
        </button>
      </div>

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
                  disabled={loading}
                />
                <EditableTitle task={task} onSave={editTitle} />
              </div>
              <button
                onClick={() => deleteTask(task._id)}
                className="text-red-500 hover:underline"
                disabled={loading}
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

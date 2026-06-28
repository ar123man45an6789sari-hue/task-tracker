import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = 'https://task-tracker-backend-lu0y.onrender.com/api/tasks';

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get(API_URL);
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    } else if (title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    }
    if (!description.trim()) {
      newErrors.description = 'Description is required';
    } else if (description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addTask = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (editingTask) {
        // UPDATE existing task
        await axios.put(`${API_URL}/${editingTask._id}`, {
          title: title.trim(),
          description: description.trim()
        });
        setSuccessMessage('Task updated successfully! ✅');
        setEditingTask(null);
      } else {
        // CREATE new task
        await axios.post(API_URL, {
          title: title.trim(),
          description: description.trim(),
          status: 'pending'
        });
        setSuccessMessage('Task added successfully! ✅');
      }
      
      setTitle('');
      setDescription('');
      setErrors({});
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchTasks();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // EDIT task - fill form with task data
  const editTask = (task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingTask(null);
    setTitle('');
    setDescription('');
    setErrors({});
  };

  const deleteTask = async (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        fetchTasks();
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await axios.put(`${API_URL}/${id}`, { status: newStatus });
      fetchTasks();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  return (
    <div className="App">
      <div className="container">
        <h1>📋 Task Tracker</h1>
        
        {successMessage && (
          <div className="success-message">{successMessage}</div>
        )}

        <form onSubmit={addTask} className="task-form">
          <h2>{editingTask ? '✏️ Edit Task' : '➕ Add New Task'}</h2>
          
          <div className="form-group">
            <input
              type="text"
              placeholder="Task Title"
              value={title}
              onChange={(e) => { setTitle(e.target.value); if (errors.title) setErrors({...errors, title: ''}); }}
              className={`input-field ${errors.title ? 'error' : ''}`}
            />
            {errors.title && <span className="error-message">{errors.title}</span>}
          </div>

          <div className="form-group">
            <textarea
              placeholder="Task Description"
              value={description}
              onChange={(e) => { setDescription(e.target.value); if (errors.description) setErrors({...errors, description: ''}); }}
              className={`input-field ${errors.description ? 'error' : ''}`}
              rows="3"
            />
            {errors.description && <span className="error-message">{errors.description}</span>}
          </div>

          <div className="form-buttons">
            <button type="submit" className="btn-primary">
              {editingTask ? 'Update Task' : 'Add Task'}
            </button>
            {editingTask && (
              <button type="button" onClick={cancelEdit} className="btn-cancel">
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="tasks-list">
          <h2>Tasks ({tasks.length})</h2>
          {tasks.length === 0 ? (
            <p className="no-tasks">No tasks yet. Add your first task!</p>
          ) : (
            tasks.map((task) => (
              <div key={task._id} className={`task-card status-${task.status}`}>
                <div className="task-header">
                  <h3>{task.title}</h3>
                  <span className={`status-badge ${task.status}`}>{task.status}</span>
                </div>
                <p className="task-description">{task.description}</p>
                <div className="task-actions">
                  <select
                    value={task.status}
                    onChange={(e) => updateStatus(task._id, e.target.value)}
                    className="status-select"
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                  <button onClick={() => editTask(task)} className="btn-edit">
                    Edit
                  </button>
                  <button onClick={() => deleteTask(task._id)} className="btn-delete">
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
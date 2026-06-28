import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = 'http://localhost:5000/api/tasks';

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch tasks on component mount
  useEffect(() => {
    fetchTasks();
  }, []);

  // Fetch all tasks
  const fetchTasks = async () => {
    try {
      const response = await axios.get(API_URL);
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  // Form Validation
  const validateForm = () => {
    const newErrors = {};

    // Title validation
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    } else if (title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    } else if (title.trim().length > 50) {
      newErrors.title = 'Title must be less than 50 characters';
    }

    // Description validation
    if (!description.trim()) {
      newErrors.description = 'Description is required';
    } else if (description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    } else if (description.trim().length > 200) {
      newErrors.description = 'Description must be less than 200 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Clear errors when user types
  const handleTitleChange = (e) => {
    setTitle(e.target.value);
    if (errors.title) {
      setErrors({ ...errors, title: '' });
    }
  };

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
    if (errors.description) {
      setErrors({ ...errors, description: '' });
    }
  };

  // Add new task
  const addTask = async (e) => {
    e.preventDefault();

    // Validate before submitting
    if (!validateForm()) {
      return;
    }

    try {
      const newTask = { title: title.trim(), description: description.trim(), status: 'pending' };
      await axios.post(API_URL, newTask);
      
      // Clear form and show success message
      setTitle('');
      setDescription('');
      setErrors({});
      setSuccessMessage('Task added successfully! ✅');
      
      // Hide success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
      
      fetchTasks();
    } catch (error) {
      console.error('Error adding task:', error);
      setSuccessMessage('Error adding task. Please try again.');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  // Delete task
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

  // Update task status
  const updateStatus = async (id, newStatus) => {
    try {
      await axios.put(`${API_URL}/${id}`, { status: newStatus });
      fetchTasks();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  return (
    <div className="App">
      <div className="container">
        <h1>📋 Task Tracker</h1>
        
        {/* Success Message */}
        {successMessage && (
          <div className="success-message">
            {successMessage}
          </div>
        )}

        {/* Add Task Form */}
        <form onSubmit={addTask} className="task-form">
          <h2>Add New Task</h2>
          
          <div className="form-group">
            <input
              type="text"
              placeholder="Task Title"
              value={title}
              onChange={handleTitleChange}
              className={`input-field ${errors.title ? 'error' : ''}`}
            />
            {errors.title && <span className="error-message">{errors.title}</span>}
          </div>

          <div className="form-group">
            <textarea
              placeholder="Task Description"
              value={description}
              onChange={handleDescriptionChange}
              className={`input-field ${errors.description ? 'error' : ''}`}
              rows="3"
            />
            {errors.description && <span className="error-message">{errors.description}</span>}
          </div>

          <button type="submit" className="btn-primary">
            Add Task
          </button>
        </form>

        {/* Tasks List */}
        <div className="tasks-list">
          <h2>Tasks ({tasks.length})</h2>
          {tasks.length === 0 ? (
            <p className="no-tasks">No tasks yet. Add your first task!</p>
          ) : (
            tasks.map((task) => (
              <div key={task._id} className={`task-card status-${task.status}`}>
                <div className="task-header">
                  <h3>{task.title}</h3>
                  <span className={`status-badge ${task.status}`}>
                    {task.status}
                  </span>
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
                  <button
                    onClick={() => deleteTask(task._id)}
                    className="btn-delete"
                  >
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
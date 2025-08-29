/**
 * Main Application Component
 * =========================
 * Root component that manages the entire Task Manager application.
 * Handles authentication state, routing between login/register/main app,
 * and coordinates all child components.
 * 
 * @component
 * @author Task Manager Team
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import Login from './components/Login';
import Register from './components/Register';
import TaskList from './components/TaskList';
import TaskForm from './components/TaskForm';

// Base URL for all API requests to the backend
const API_URL = 'http://localhost:5000/api';

function App() {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  // User authentication state
  const [user, setUser] = useState(null);  // Stores logged-in user info
  const [token, setToken] = useState(localStorage.getItem('token'));  // Auth token from localStorage
  
  // UI state
  const [showRegister, setShowRegister] = useState(false);  // Toggle between login/register forms
  
  // Task management state
  const [tasks, setTasks] = useState([]);  // Array of all user's tasks
  const [editingTask, setEditingTask] = useState(null);  // Task currently being edited

  // ============================================================================
  // LIFECYCLE EFFECTS
  // ============================================================================
  
  /**
   * Effect: Auto-login user if valid token exists in localStorage
   * Runs when component mounts or token changes
   */
  useEffect(() => {
    if (token) {
      // Retrieve stored user data from localStorage
      const userData = localStorage.getItem('user');
      if (userData) {
        // Parse and set user data
        setUser(JSON.parse(userData));
        // Fetch user's tasks from backend
        fetchTasks();
      }
    }
    // Disable exhaustive-deps warning as fetchTasks uses token from closure
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // ============================================================================
  // API FUNCTIONS
  // ============================================================================
  
  /**
   * Fetch all tasks for the authenticated user from the backend
   * @param {string|null} authToken - Optional token to use (for immediate use after login)
   */
  const fetchTasks = async (authToken = null) => {
    // Use provided token or fall back to state token
    const tokenToUse = authToken || token;
    if (!tokenToUse) return;  // Exit if no token available
    
    try {
      // Make authenticated request to fetch tasks
      const response = await axios.get(`${API_URL}/tasks`, {
        headers: { Authorization: `Bearer ${tokenToUse}` }
      });
      // Update tasks state with fetched data
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      // If unauthorized (token expired/invalid), logout user
      if (error.response?.status === 401) {
        handleLogout();
      }
    }
  };

  // ============================================================================
  // AUTHENTICATION HANDLERS
  // ============================================================================
  
  /**
   * Handle successful user login
   * @param {Object} userData - User information (username, email)
   * @param {string} userToken - Authentication token from backend
   */
  const handleLogin = (userData, userToken) => {
    // Update application state
    setUser(userData);
    setToken(userToken);
    
    // Persist authentication in localStorage for session persistence
    localStorage.setItem('token', userToken);
    localStorage.setItem('user', JSON.stringify(userData));
    
    // Immediately fetch tasks with new token
    fetchTasks(userToken);
  };

  /**
   * Handle user logout - clear all authentication data
   */
  const handleLogout = async () => {
    try {
      // Notify backend to invalidate session
      await axios.post(`${API_URL}/logout`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      // Continue with logout even if backend call fails
      console.error('Logout error:', error);
    }
    
    // Clear application state
    setUser(null);
    setToken(null);
    setTasks([]);
    
    // Clear persisted authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  // ============================================================================
  // TASK MANAGEMENT HANDLERS
  // ============================================================================
  
  /**
   * Create a new task
   * @param {Object} taskData - Task information (title, description)
   */
  const handleCreateTask = async (taskData) => {
    try {
      // Send authenticated request to create task
      const response = await axios.post(`${API_URL}/tasks`, taskData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Add new task to beginning of tasks array (newest first)
      setTasks([response.data, ...tasks]);
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  /**
   * Update an existing task
   * @param {string} taskId - MongoDB ObjectId of task to update
   * @param {Object} taskData - Updated task information
   */
  const handleUpdateTask = async (taskId, taskData) => {
    try {
      // Send authenticated request to update task
      const response = await axios.put(`${API_URL}/tasks/${taskId}`, taskData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Update task in local state
      setTasks(tasks.map(task => task.id === taskId ? response.data : task));
      // Clear editing state
      setEditingTask(null);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  /**
   * Delete a task
   * @param {string} taskId - MongoDB ObjectId of task to delete
   */
  const handleDeleteTask = async (taskId) => {
    try {
      // Send authenticated request to delete task
      await axios.delete(`${API_URL}/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Remove task from local state
      setTasks(tasks.filter(task => task.id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  /**
   * Toggle task completion status
   * @param {Object} task - Task object to toggle
   */
  const handleToggleComplete = async (task) => {
    // Update task with opposite completion status
    await handleUpdateTask(task.id, { completed: !task.completed });
  };

  // ============================================================================
  // RENDER LOGIC
  // ============================================================================
  
  // Show authentication forms if user is not logged in
  if (!user) {
    return (
      <div className="auth-container">
        {showRegister ? (
          // Registration form
          <Register 
            onRegister={() => setShowRegister(false)}  // Switch to login after registration
            onSwitchToLogin={() => setShowRegister(false)}
          />
        ) : (
          // Login form
          <Login 
            onLogin={handleLogin}
            onSwitchToRegister={() => setShowRegister(true)}
          />
        )}
      </div>
    );
  }

  // Main application UI for authenticated users
  return (
    <div className="app">
      {/* Application header with user info and logout */}
      <header className="app-header">
        <h1>Task Manager</h1>
        <div className="user-info">
          <span>Welcome, {user.username}!</span>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </header>

      {/* Main content area */}
      <main className="app-main">
        {/* Task creation/editing form */}
        <TaskForm 
          onSubmit={editingTask ? 
            // If editing, update existing task
            (data) => handleUpdateTask(editingTask.id, data) : 
            // Otherwise, create new task
            handleCreateTask
          }
          initialData={editingTask}  // Pre-fill form when editing
          onCancel={() => setEditingTask(null)}  // Cancel editing
        />

        {/* Display all tasks */}
        <TaskList 
          tasks={tasks}
          onToggleComplete={handleToggleComplete}
          onEdit={setEditingTask}  // Set task for editing
          onDelete={handleDeleteTask}
        />
      </main>
    </div>
  );
}

export default App;
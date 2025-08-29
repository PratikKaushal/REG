/**
 * TaskForm Component
 * ==================
 * Enhanced form for creating and editing tasks with advanced features
 * 
 * Features:
 * - Task title and description input
 * - Date picker for setting deadlines
 * - Time selector for specific scheduling
 * - Category selection for task organization
 * - Form validation and error prevention
 * 
 * @param {Function} onSubmit - Callback when form is submitted with task data
 * @param {Object} initialData - Existing task data when editing
 * @param {Function} onCancel - Callback to cancel editing mode
 */

import React, { useState, useEffect } from 'react';

function TaskForm({ onSubmit, initialData, onCancel }) {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  // Form state with all task fields
  // Includes new scheduling and categorization features
  const [formData, setFormData] = useState({
    title: '',           // Required: Task title
    description: '',     // Optional: Detailed task description
    due_date: '',       // Optional: Deadline date (YYYY-MM-DD format)
    due_time: '',       // Optional: Specific time (HH:MM format)
    category: 'general' // Default: Task category for grouping
  });

  // ============================================================================
  // CONSTANTS AND CONFIGURATION
  // ============================================================================
  
  // Calculate today's date for date picker minimum value
  // Prevents users from selecting past dates for new tasks
  const today = new Date().toISOString().split('T')[0];

  // Task category configuration
  // Each category has a unique color scheme for visual differentiation
  const categories = [
    { value: 'general', label: 'General', color: 'category-general' },         // Default gray
    { value: 'marketing', label: 'Marketing', color: 'category-marketing' },   // Blue theme
    { value: 'meeting', label: 'Meeting', color: 'category-meeting' },         // Purple theme
    { value: 'production', label: 'Production', color: 'category-production' }, // Green theme
    { value: 'design', label: 'Design', color: 'category-design' },           // Orange theme
    { value: 'development', label: 'Development', color: 'category-development' } // Deep purple
  ];

  // Update form when editing an existing task
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        due_date: initialData.due_date || '',
        due_time: initialData.due_time || '',
        category: initialData.category || 'general'
      });
    }
  }, [initialData]);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.title.trim()) {
      onSubmit(formData);
      // Reset form after successful submission (only for new tasks)
      if (!initialData) {
        setFormData({ 
          title: '', 
          description: '', 
          due_date: '', 
          due_time: '',
          category: 'general' 
        });
      }
    }
  };

  // Handle input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Handle category selection
  const handleCategoryClick = (categoryValue) => {
    setFormData({
      ...formData,
      category: categoryValue
    });
  };

  return (
    <div className="task-form">
      <h3>{initialData ? 'Edit Task' : 'Create New Task'}</h3>
      <form onSubmit={handleSubmit}>
        {/* Title Input */}
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            placeholder="Enter task title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        {/* Date and Time Row */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="due_date">Due Date</label>
            <input
              type="date"
              id="due_date"
              name="due_date"
              value={formData.due_date}
              onChange={handleChange}
              min={today}
            />
          </div>
          <div className="form-group">
            <label htmlFor="due_time">Time</label>
            <input
              type="time"
              id="due_time"
              name="due_time"
              value={formData.due_time}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Description */}
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            placeholder="Add task description (optional)"
            value={formData.description}
            onChange={handleChange}
            rows="3"
          />
        </div>

        {/* Category Selection */}
        <div className="form-group">
          <label>Category</label>
          <div className="category-buttons">
            {categories.map(cat => (
              <button
                key={cat.value}
                type="button"
                className={`category-btn ${cat.value} ${formData.category === cat.value ? 'active' : ''}`}
                onClick={() => handleCategoryClick(cat.value)}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            {initialData ? 'Update Task' : 'Create Task'}
          </button>
          {initialData && (
            <button type="button" onClick={onCancel} className="btn btn-secondary">
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default TaskForm;
/**
 * TaskItem Component
 * ==================
 * Individual task card display with rich metadata and interactive controls
 * 
 * Features:
 * - Task completion checkbox
 * - Title and description display
 * - Due date and time formatting
 * - Category badges with color coding
 * - Overdue status detection
 * - Edit and delete actions
 * 
 * @param {Object} task - Task data object from database
 * @param {Function} onToggleComplete - Callback to toggle task completion
 * @param {Function} onEdit - Callback to edit task
 * @param {Function} onDelete - Callback to delete task
 */

import React from 'react';

function TaskItem({ task, onToggleComplete, onEdit, onDelete }) {
  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================
  
  /**
   * Format date from ISO string to human-readable format
   * Converts YYYY-MM-DD to "Jan 5, 2024" format
   * @param {string} dateString - ISO date string from database
   * @returns {string} Formatted date or empty string if no date
   */
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  /**
   * Format time from 24-hour to 12-hour format with AM/PM
   * Converts "14:30" to "2:30 PM"
   * @param {string} timeString - 24-hour time string (HH:MM)
   * @returns {string} Formatted time with AM/PM or empty string
   */
  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;  // Convert 0 to 12 for midnight
    return `${displayHour}:${minutes} ${ampm}`;
  };

  /**
   * Map category value to corresponding CSS class
   * Each category has unique color scheme defined in CSS
   * @param {string} category - Category value from task
   * @returns {string} CSS class name for category styling
   */
  const getCategoryClass = (category) => {
    const categoryClasses = {
      'general': 'category-general',           // Gray theme
      'marketing': 'category-marketing',       // Blue theme
      'meeting': 'category-meeting',           // Purple theme
      'production': 'category-production',     // Green theme
      'design': 'category-design',             // Orange theme
      'development': 'category-development'    // Deep purple theme
    };
    return categoryClasses[category] || 'category-general';  // Default to general
  };

  /**
   * Check if task is past its due date
   * Completed tasks are never considered overdue
   * @returns {boolean} True if task is overdue, false otherwise
   */
  const isOverdue = () => {
    // No due date or task completed = not overdue
    if (!task.due_date || task.completed) return false;
    
    // Compare due date with today (ignoring time)
    const dueDate = new Date(task.due_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);  // Reset time to start of day
    
    return dueDate < today;  // True if due date is before today
  };

  return (
    <div className={`task-item ${task.completed ? 'completed' : ''} ${isOverdue() ? 'overdue' : ''}`}>
      <div className="task-content">
        {/* Checkbox for completion */}
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => onToggleComplete(task)}
          className="task-checkbox"
          aria-label={`Mark ${task.title} as ${task.completed ? 'incomplete' : 'complete'}`}
        />
        
        {/* Task details */}
        <div className="task-details">
          <h4 className="task-title">{task.title}</h4>
          
          {/* Description if exists */}
          {task.description && (
            <p className="task-description">{task.description}</p>
          )}
          
          {/* Task metadata */}
          <div className="task-meta">
            {/* Category badge */}
            {task.category && (
              <span className={`task-category ${getCategoryClass(task.category)}`}>
                {task.category}
              </span>
            )}
            
            {/* Due date */}
            {task.due_date && (
              <span className="task-date">
                📅 {formatDate(task.due_date)}
              </span>
            )}
            
            {/* Due time */}
            {task.due_time && (
              <span className="task-time">
                ⏰ {formatTime(task.due_time)}
              </span>
            )}
            
            {/* Overdue indicator */}
            {isOverdue() && (
              <span className="task-overdue-badge">Overdue</span>
            )}
          </div>
        </div>
      </div>
      
      {/* Task actions */}
      <div className="task-actions">
        <button 
          onClick={() => onEdit(task)} 
          className="btn btn-small btn-edit"
          disabled={task.completed}
          aria-label={`Edit ${task.title}`}
        >
          ✏️
        </button>
        <button 
          onClick={() => onDelete(task.id)} 
          className="btn btn-small btn-delete"
          aria-label={`Delete ${task.title}`}
        >
          🗑️
        </button>
      </div>
    </div>
  );
}

export default TaskItem;
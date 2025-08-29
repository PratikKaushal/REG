import React from 'react';
import TaskItem from './TaskItem';

function TaskList({ tasks, onToggleComplete, onEdit, onDelete }) {
  const pendingTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);

  return (
    <div className="task-list">
      <div className="task-section">
        <h3>
          Pending Tasks
          <span className="task-count">{pendingTasks.length}</span>
        </h3>
        {pendingTasks.length === 0 ? (
          <p className="no-tasks">No pending tasks</p>
        ) : (
          <div className="tasks">
            {pendingTasks.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                onToggleComplete={onToggleComplete}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
      </div>

      <div className="task-section">
        <h3>
          Completed Tasks
          <span className="task-count">{completedTasks.length}</span>
        </h3>
        {completedTasks.length === 0 ? (
          <p className="no-tasks">No completed tasks</p>
        ) : (
          <div className="tasks">
            {completedTasks.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                onToggleComplete={onToggleComplete}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default TaskList;
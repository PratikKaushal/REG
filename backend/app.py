"""
Task Manager Backend API with MongoDB
======================================
A RESTful API for task management with user authentication.
Built with Flask and MongoDB for scalable data storage.

Author: Task Manager Team
Version: 1.0.0
Database: MongoDB
"""

# Import required libraries
from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from datetime import datetime, timedelta
import hashlib
import secrets
from functools import wraps
from bson import ObjectId

# ============================================================================
# APPLICATION CONFIGURATION
# ============================================================================

# Initialize Flask application
app = Flask(__name__)

# Secret key for session management (should be environment variable in production)
app.config['SECRET_KEY'] = 'your-secret-key-change-in-production'

# Enable CORS (Cross-Origin Resource Sharing) for frontend communication
CORS(app)

# ============================================================================
# DATABASE CONNECTION AND SETUP
# ============================================================================

# Connect to MongoDB server running on localhost at default port
client = MongoClient('mongodb://localhost:27017/')

# Select or create the task_manager database
db = client['task_manager']

# Define collections (similar to tables in SQL databases)
users_collection = db['users']        # Stores user account information
tasks_collection = db['tasks']        # Stores task data for all users
sessions_collection = db['sessions']  # Stores active login sessions/tokens

# Create indexes for improved query performance
# Unique indexes ensure no duplicate usernames or emails
users_collection.create_index('username', unique=True)
users_collection.create_index('email', unique=True)

# Index for fast token lookups during authentication
sessions_collection.create_index('token', unique=True)

# Index for automatic session cleanup (TTL index could be added here)
sessions_collection.create_index('expires')

# Index for efficient task queries by user
tasks_collection.create_index('user_id')

# ============================================================================
# UTILITY FUNCTIONS
# ============================================================================

def hash_password(password):
    """
    Hash a password using SHA-256 algorithm for secure storage.
    
    Args:
        password (str): Plain text password from user input
        
    Returns:
        str: Hexadecimal string of the hashed password
        
    Note: In production, use bcrypt or argon2 for better security
    """
    return hashlib.sha256(password.encode()).hexdigest()

def verify_token(f):
    """
    Decorator function to protect routes that require authentication.
    Validates the JWT token from the Authorization header.
    
    Args:
        f: The route function to be protected
        
    Returns:
        Decorated function that checks authentication before executing
        
    Usage:
        @app.route('/protected-route')
        @verify_token
        def protected_function():
            # This will only execute if token is valid
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        # Extract token from Authorization header
        token = request.headers.get('Authorization')
        
        # Check if token was provided
        if not token:
            return jsonify({'error': 'No token provided'}), 401
        
        # Remove 'Bearer ' prefix from token string
        token = token.replace('Bearer ', '')
        
        # Look up session in database using the token
        session = sessions_collection.find_one({'token': token})
        
        # Verify session exists
        if not session:
            return jsonify({'error': 'Invalid token'}), 401
        
        # Check if session has expired
        if session['expires'] < datetime.now():
            # Remove expired session from database
            sessions_collection.delete_one({'token': token})
            return jsonify({'error': 'Token expired'}), 401
        
        # Attach user_id to request object for use in protected routes
        request.user_id = session['user_id']
        
        # Execute the protected route function
        return f(*args, **kwargs)
    
    return decorated

# ============================================================================
# AUTHENTICATION ROUTES
# ============================================================================

@app.route('/api/register', methods=['POST'])
def register():
    """
    Register a new user account.
    
    Expected JSON payload:
        {
            "username": "string",
            "email": "string",
            "password": "string"
        }
    
    Returns:
        201: User created successfully
        400: Missing required fields
        400: Username or email already exists
    """
    # Extract data from request body
    data = request.json
    username = data.get('username')
    password = data.get('password')
    email = data.get('email')
    
    # Validate all required fields are present
    if not username or not password or not email:
        return jsonify({'error': 'All fields are required'}), 400
    
    # Check if username or email already exists in database
    # $or operator checks if either condition is true
    if users_collection.find_one({'$or': [{'username': username}, {'email': email}]}):
        return jsonify({'error': 'Username or email already exists'}), 400
    
    # Create user document with hashed password
    user = {
        'username': username,
        'email': email,
        'password': hash_password(password),  # Never store plain text passwords
        'created_at': datetime.now()
    }
    
    # Insert new user into database
    users_collection.insert_one(user)
    
    return jsonify({'message': 'User registered successfully'}), 201

@app.route('/api/login', methods=['POST'])
def login():
    """
    Authenticate user and create session token.
    
    Expected JSON payload:
        {
            "username": "string",
            "password": "string"
        }
    
    Returns:
        200: Login successful with token
        400: Missing credentials
        401: Invalid username or password
    """
    # Extract credentials from request
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    # Validate credentials are provided
    if not username or not password:
        return jsonify({'error': 'Username and password required'}), 400
    
    # Find user by username in database
    user = users_collection.find_one({'username': username})
    
    # Check if user exists
    if not user:
        return jsonify({'error': 'Invalid credentials'}), 401
    
    # Verify password matches stored hash
    if user['password'] != hash_password(password):
        return jsonify({'error': 'Invalid credentials'}), 401
    
    # Generate secure random token for session
    token = secrets.token_hex(32)
    
    # Remove any existing sessions for this user (single session policy)
    sessions_collection.delete_many({'user_id': username})
    
    # Create new session document with 24-hour expiration
    session = {
        'token': token,
        'user_id': username,
        'expires': datetime.now() + timedelta(hours=24)
    }
    sessions_collection.insert_one(session)
    
    # Return token and user info to client
    return jsonify({
        'token': token,
        'username': username,
        'email': user['email']
    }), 200

@app.route('/api/verify', methods=['GET'])
@verify_token
def verify():
    """
    Verify if current session token is valid.
    Protected route - requires valid authentication token.
    
    Returns:
        200: Token is valid
        401: Token is invalid or expired
    """
    return jsonify({
        'valid': True,
        'user_id': request.user_id
    }), 200

@app.route('/api/logout', methods=['POST'])
@verify_token
def logout():
    """
    Logout user by removing their session token.
    Protected route - requires valid authentication token.
    
    Returns:
        200: Logout successful
        401: Invalid token
    """
    # Extract token from header
    token = request.headers.get('Authorization').replace('Bearer ', '')
    
    # Remove session from database
    sessions_collection.delete_one({'token': token})
    
    return jsonify({'message': 'Logged out successfully'}), 200

# ============================================================================
# TASK MANAGEMENT ROUTES
# ============================================================================

@app.route('/api/tasks', methods=['GET'])
@verify_token
def get_tasks():
    """
    Retrieve all tasks for the authenticated user.
    Protected route - requires valid authentication token.
    
    Returns:
        200: List of user's tasks sorted by creation date
        401: Unauthorized (invalid/missing token)
    """
    # Query database for all tasks belonging to current user
    tasks = list(tasks_collection.find({'user_id': request.user_id}))
    
    # Format tasks for JSON response
    for task in tasks:
        # Convert MongoDB ObjectId to string
        task['id'] = str(task['_id'])
        del task['_id']  # Remove MongoDB's internal _id field
        
        # Convert datetime objects to ISO format strings for JSON serialization
        if 'created_at' in task:
            task['created_at'] = task['created_at'].isoformat()
        if 'updated_at' in task:
            task['updated_at'] = task['updated_at'].isoformat()
    
    # Sort tasks by creation date (newest first)
    tasks.sort(key=lambda x: x.get('created_at', ''), reverse=True)
    
    return jsonify(tasks), 200

@app.route('/api/tasks', methods=['POST'])
@verify_token
def create_task():
    """
    Create a new task for the authenticated user.
    Protected route - requires valid authentication token.
    
    Expected JSON payload:
        {
            "title": "string (required)",
            "description": "string (optional)",
            "due_date": "string (optional) - ISO date format",
            "due_time": "string (optional) - HH:MM format",
            "category": "string (optional) - task category"
        }
    
    Returns:
        201: Task created successfully
        400: Missing title
        401: Unauthorized
    """
    # Extract task data from request body
    data = request.json
    
    # Required field
    title = data.get('title')
    
    # Optional fields with defaults
    description = data.get('description', '')  # Default to empty string if not provided
    
    # Date and time fields for task scheduling
    due_date = data.get('due_date', None)  # ISO format date (YYYY-MM-DD) for task deadline
    due_time = data.get('due_time', None)  # 24-hour format time (HH:MM) for specific timing
    
    # Category field for task organization
    # Categories: general, marketing, meeting, production, design, development
    category = data.get('category', 'general')  # Default to 'general' if not specified
    
    # Validate required fields
    if not title:
        return jsonify({'error': 'Title is required'}), 400
    
    # Create task document with all fields
    task = {
        'title': title,                      # Task title (required)
        'description': description,          # Task details (optional)
        'completed': False,                  # New tasks start as incomplete
        'user_id': request.user_id,         # Associate task with authenticated user
        'due_date': due_date,                # Deadline date in ISO format (optional)
        'due_time': due_time,                # Specific time for task (optional)
        'category': category,                # Task category for grouping/filtering
        'created_at': datetime.now(),        # Timestamp of task creation
        'updated_at': datetime.now()         # Timestamp of last modification
    }
    
    # Insert task into database
    result = tasks_collection.insert_one(task)
    
    # Prepare response with created task
    task['id'] = str(result.inserted_id)
    del task['_id']  # Remove MongoDB's internal field
    # Convert datetime objects to strings
    task['created_at'] = task['created_at'].isoformat()
    task['updated_at'] = task['updated_at'].isoformat()
    
    return jsonify(task), 201

@app.route('/api/tasks/<task_id>', methods=['PUT'])
@verify_token
def update_task(task_id):
    """
    Update an existing task.
    Protected route - requires valid authentication token.
    
    Args:
        task_id: MongoDB ObjectId as string
        
    Expected JSON payload (all fields optional):
        {
            "title": "string",
            "description": "string",
            "completed": boolean
        }
    
    Returns:
        200: Task updated successfully
        400: Invalid task ID format
        404: Task not found or unauthorized
        401: Missing/invalid token
    """
    data = request.json
    
    try:
        # Verify task exists and belongs to current user
        task = tasks_collection.find_one({
            '_id': ObjectId(task_id),
            'user_id': request.user_id
        })
        
        if not task:
            return jsonify({'error': 'Task not found'}), 404
        
        # Build update document with only provided fields
        update_data = {'updated_at': datetime.now()}
        
        # Only update fields that were provided in request
        # This allows partial updates without overwriting existing data
        
        # Core task fields
        if 'title' in data:
            update_data['title'] = data['title']
        if 'description' in data:
            update_data['description'] = data['description']
        if 'completed' in data:
            update_data['completed'] = data['completed']
            
        # Scheduling fields - can be updated independently
        if 'due_date' in data:
            update_data['due_date'] = data['due_date']  # Update deadline date
        if 'due_time' in data:
            update_data['due_time'] = data['due_time']  # Update deadline time
            
        # Organization field
        if 'category' in data:
            update_data['category'] = data['category']  # Update task category
        
        # Apply updates to database using $set operator
        tasks_collection.update_one(
            {'_id': ObjectId(task_id)},
            {'$set': update_data}
        )
        
        # Retrieve and return updated task
        updated_task = tasks_collection.find_one({'_id': ObjectId(task_id)})
        # Format for JSON response
        updated_task['id'] = str(updated_task['_id'])
        del updated_task['_id']
        updated_task['created_at'] = updated_task['created_at'].isoformat()
        updated_task['updated_at'] = updated_task['updated_at'].isoformat()
        
        return jsonify(updated_task), 200
        
    except Exception as e:
        # Handle invalid ObjectId format
        return jsonify({'error': 'Invalid task ID'}), 400

@app.route('/api/tasks/<task_id>', methods=['DELETE'])
@verify_token
def delete_task(task_id):
    """
    Delete a task permanently.
    Protected route - requires valid authentication token.
    
    Args:
        task_id: MongoDB ObjectId as string
        
    Returns:
        200: Task deleted successfully
        400: Invalid task ID format
        404: Task not found or unauthorized
        401: Missing/invalid token
    """
    try:
        # Attempt to delete task (only if it belongs to current user)
        result = tasks_collection.delete_one({
            '_id': ObjectId(task_id),
            'user_id': request.user_id
        })
        
        # Check if any document was deleted
        if result.deleted_count == 0:
            return jsonify({'error': 'Task not found'}), 404
        
        return jsonify({'message': 'Task deleted successfully'}), 200
        
    except Exception as e:
        # Handle invalid ObjectId format
        return jsonify({'error': 'Invalid task ID'}), 400

# ============================================================================
# HEALTH CHECK ROUTE
# ============================================================================

@app.route('/api/health', methods=['GET'])
def health_check():
    """
    Health check endpoint to verify API and database connectivity.
    Useful for monitoring and deployment verification.
    
    Returns:
        200: Service is healthy
        500: Database connection failed
    """
    try:
        # Test MongoDB connection by requesting server info
        client.server_info()
        return jsonify({'status': 'healthy', 'database': 'connected'}), 200
    except:
        return jsonify({'status': 'unhealthy', 'database': 'disconnected'}), 500

# ============================================================================
# APPLICATION ENTRY POINT
# ============================================================================

if __name__ == '__main__':
    """
    Start the Flask development server.
    This block only runs when script is executed directly,
    not when imported as a module.
    """
    print("=" * 50)
    print("Task Manager API with MongoDB")
    print("=" * 50)
    print("MongoDB connection: mongodb://localhost:27017/")
    print("Database: task_manager")
    print("Collections: users, tasks, sessions")
    print("-" * 50)
    print("Starting Flask server on http://localhost:5000")
    print("-" * 50)
    
    # Run Flask development server
    # debug=True enables auto-reload on code changes
    # port=5000 sets the server port
    app.run(debug=True, port=5000)
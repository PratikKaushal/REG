/**
 * Login Component
 * ===============
 * Handles user authentication by providing a login form.
 * Validates credentials with the backend and manages login errors.
 * 
 * @component
 * @param {Function} onLogin - Callback function called on successful login with user data and token
 * @param {Function} onSwitchToRegister - Callback to switch to registration form
 */

import React, { useState } from 'react';
import axios from 'axios';

function Login({ onLogin, onSwitchToRegister }) {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  // Form data state - stores username and password inputs
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  
  // Error message state for displaying login failures
  const [error, setError] = useState('');

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================
  
  /**
   * Handle form input changes
   * Updates formData state when user types in input fields
   * Uses computed property name to update the correct field
   * @param {Event} e - Input change event
   */
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value  // Dynamic key based on input name attribute
    });
  };

  /**
   * Handle form submission
   * Sends login credentials to backend and processes response
   * @param {Event} e - Form submission event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();  // Prevent default form submission
    setError('');  // Clear any previous error messages

    try {
      // Send POST request to login endpoint with credentials
      const response = await axios.post('http://localhost:5000/api/login', formData);
      
      // Extract authentication data from successful response
      const { token, username, email } = response.data;
      
      // Call parent component's login handler with user info and token
      onLogin({ username, email }, token);
    } catch (error) {
      // Log error for debugging
      console.error('Login error:', error);
      
      // Handle different error scenarios
      if (error.code === 'ERR_NETWORK') {
        // Network error - backend server not reachable
        setError('Cannot connect to server. Please ensure the backend is running on port 5000.');
      } else {
        // Display error message from backend or generic fallback message
        setError(error.response?.data?.error || 'Login failed');
      }
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================
  
  return (
    <div className="auth-form">
      {/* Form title */}
      <h2>Login</h2>
      
      {/* Error message display - only shown when error exists */}
      {error && <div className="error-message">{error}</div>}
      
      {/* Login form */}
      <form onSubmit={handleSubmit}>
        {/* Username input field */}
        <div className="form-group">
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            required  // HTML5 validation
          />
        </div>
        
        {/* Password input field */}
        <div className="form-group">
          <input
            type="password"  // Masks password input
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required  // HTML5 validation
          />
        </div>
        
        {/* Submit button */}
        <button type="submit" className="btn btn-primary">Login</button>
      </form>
      
      {/* Link to switch to registration form */}
      <p className="auth-switch">
        Don't have an account? 
        <button onClick={onSwitchToRegister} className="link-btn">
          Register here
        </button>
      </p>
    </div>
  );
}

export default Login;
// Login page component
import React, { useState } from 'react'

function Login({ onLogin }) {
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (username.trim()) {
      setLoading(true)
      // Simulate login delay
      setTimeout(() => {
        onLogin(username)
        setLoading(false)
      }, 1000)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Police Officer Dashboard</h1>
          <p>Smart Tourist Safety Monitoring System</p>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Officer ID / Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your officer ID"
              required
              disabled={loading}
            />
          </div>
          
          <button type="submit" disabled={loading || !username.trim()}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <div className="login-info">
          <p><small>Demo: Use any username to login</small></p>
        </div>
      </div>
    </div>
  )
}

export default Login
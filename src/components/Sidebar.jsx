import React from 'react'
import PropTypes from 'prop-types'

function Sidebar({ searchQuery, onSearchChange, onRefresh, onLogout, onCreateAlert }) {
  const username = localStorage.getItem('username') || 'Officer'

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>Control Panel</h2>
        <p>Welcome, {username}</p>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section">
          <h3>Navigation</h3>
          <ul>
            <li><button className="nav-btn active">Dashboard</button></li>
            <li><button className="nav-btn">Alerts</button></li>
            <li><button className="nav-btn">Search/Lookup</button></li>
            <li><button className="nav-btn">Logs</button></li>
          </ul>
        </div>

        <div className="nav-section">
          <h3>Search Tourist</h3>
          <input
            type="text"
            placeholder="Name or passport..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="nav-section">
          <h3>Quick Actions</h3>
          <button onClick={onRefresh} className="action-btn">
            Refresh Data
          </button>
          <button onClick={onCreateAlert} className="action-btn warning">
            Simulate Alert
          </button>
        </div>

        <div className="nav-section">
          <h3>System Status</h3>
          <div className="status-item">
            <span className="status-dot green"></span>
            Map Services: Online
          </div>
          <div className="status-item">
            <span className="status-dot green"></span>
            IoT Network: Active
          </div>
          <div className="status-item">
            <span className="status-dot yellow"></span>
            Blockchain: Syncing
          </div>
        </div>
      </nav>

      <div className="sidebar-footer">
        <button onClick={onLogout} className="logout-btn">
          Logout
        </button>
      </div>
    </aside>
  )
}

Sidebar.propTypes = {
  searchQuery: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  onRefresh: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired,
  onCreateAlert: PropTypes.func.isRequired
}

export default Sidebar

import React from 'react'
import { findNearestPoliceUnit } from '../api'

function AlertsTable({ alerts, tourists, policeUnits, onAlertClick, onAlertAction }) {
  
  // Get tourist name by ID
  const getTouristName = (touristId) => {
    const tourist = tourists.find(t => t.id === touristId)
    return tourist ? tourist.name : 'Unknown'
  }

  // Handle dispatch action with nearest unit calculation
  const handleDispatch = (alert) => {
    const nearestUnit = findNearestPoliceUnit(alert.location, policeUnits)
    if (nearestUnit) {
      console.log(`Dispatching ${nearestUnit.name} to alert ${alert.id} (${nearestUnit.distance.toFixed(2)}km away)`)
      // In a real system, this would send dispatch orders
      onAlertAction(alert.id, 'dispatch')
    }
  }

  // Get status badge class
  const getStatusClass = (status) => {
    switch (status) {
      case 'new': return 'status-new'
      case 'in-progress': return 'status-progress'
      case 'dispatched': return 'status-dispatched'
      case 'resolved': return 'status-resolved'
      default: return 'status-unknown'
    }
  }

  // Sort alerts by timestamp (newest first)
  const sortedAlerts = [...alerts].sort((a, b) => 
    new Date(b.timestamp) - new Date(a.timestamp)
  )

  return (
    <div className="alerts-table-container">
      <div className="table-header">
        <h3>Active Alerts ({alerts.filter(a => a.status !== 'resolved').length})</h3>
        <div className="table-filters">
          {/* Add filter buttons here if needed */}
        </div>
      </div>

      <div className="table-wrapper">
        <table className="alerts-table">
          <thead>
            <tr>
              <th>Tourist</th>
              <th>Type</th>
              <th>Location</th>
              <th>Time</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedAlerts.map(alert => (
              <tr 
                key={alert.id} 
                className={`alert-row ${alert.status}`}
                onClick={() => onAlertClick(alert)}
              >
                <td>
                  <div className="tourist-cell">
                    <strong>{getTouristName(alert.touristId)}</strong>
                  </div>
                </td>
                <td>
                  <span className={`alert-type ${alert.type}`}>
                    {alert.type.charAt(0).toUpperCase() + alert.type.slice(1)}
                  </span>
                </td>
                <td>
                  <div className="location-cell">
                    <small>
                      {alert.location.lat.toFixed(3)}, {alert.location.lng.toFixed(3)}
                    </small>
                  </div>
                </td>
                <td>
                  <div className="time-cell">
                    <div>{new Date(alert.timestamp).toLocaleDateString()}</div>
                    <small>{new Date(alert.timestamp).toLocaleTimeString()}</small>
                  </div>
                </td>
                <td>
                  <span className={`status-badge ${getStatusClass(alert.status)}`}>
                    {alert.status.replace('-', ' ')}
                  </span>
                </td>
                <td>
                  <div className="action-buttons" onClick={(e) => e.stopPropagation()}>
                    {alert.status === 'new' && (
                      <>
                        <button
                          onClick={() => onAlertAction(alert.id, 'acknowledge')}
                          className="action-btn acknowledge"
                          title="Acknowledge alert"
                        >
                          ✓ Ack
                        </button>
                        <button
                          onClick={() => handleDispatch(alert)}
                          className="action-btn dispatch"
                          title="Dispatch nearest unit"
                        >
                          🚔 Dispatch
                        </button>
                      </>
                    )}
                    {(alert.status === 'in-progress' || alert.status === 'dispatched') && (
                      <button
                        onClick={() => onAlertAction(alert.id, 'resolve')}
                        className="action-btn resolve"
                        title="Mark as resolved"
                      >
                        ✓ Resolve
                      </button>
                    )}
                    {alert.status === 'resolved' && (
                      <span className="resolved-indicator">✅ Resolved</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {alerts.length === 0 && (
          <div className="no-alerts">
            <p>No alerts at this time</p>
          </div>
        )}
      </div>

      <div className="table-footer">
        <div className="legend">
          <span className="legend-item">
            <span className="status-badge status-new"></span> New
          </span>
          <span className="legend-item">
            <span className="status-badge status-progress"></span> In Progress
          </span>
          <span className="legend-item">
            <span className="status-badge status-dispatched"></span> Dispatched
          </span>
          <span className="legend-item">
            <span className="status-badge status-resolved"></span> Resolved
          </span>
        </div>
      </div>
    </div>
  )
}

export default AlertsTable
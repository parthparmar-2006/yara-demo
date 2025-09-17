import React, { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import MapView from '../components/MapView'
import AlertsTable from '../components/AlertsTable'
import TouristProfileModal from '../components/TouristProfileModal'
import { api } from '../api'

function Dashboard({ onLogout }) {
  // State management for dashboard data
  const [tourists, setTourists] = useState([])
  const [alerts, setAlerts] = useState([])
  const [policeUnits, setPoliceUnits] = useState([])
  const [selectedTourist, setSelectedTourist] = useState(null)
  const [selectedAlert, setSelectedAlert] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState(new Date())

  // Load initial data
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [touristsData, alertsData, unitsData] = await Promise.all([
        api.getTourists(),
        api.getAlerts(),
        api.getPoliceUnits()
      ])
      
      setTourists(touristsData)
      setAlerts(alertsData)
      setPoliceUnits(unitsData)
      setLastRefresh(new Date())
    } catch (error) {
      console.error('Error loading data:', error)
    }
    setLoading(false)
  }

  // Filter tourists based on search query
  const filteredTourists = tourists.filter(tourist =>
    tourist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tourist.passport.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Calculate summary statistics
  const activeTourists = tourists.length
  const activeAlerts = alerts.filter(alert => alert.status === 'new' || alert.status === 'in-progress').length
  const highRiskZones = 3 // Simulated count

  // Handle alert actions (acknowledge, dispatch, resolve)
  const handleAlertAction = (alertId, action) => {
    setAlerts(prevAlerts => 
      prevAlerts.map(alert => {
        if (alert.id === alertId) {
          let newStatus = alert.status
          switch (action) {
            case 'acknowledge':
              newStatus = 'in-progress'
              break
            case 'dispatch':
              newStatus = 'dispatched'
              break
            case 'resolve':
              newStatus = 'resolved'
              break
          }
          return { ...alert, status: newStatus }
        }
        return alert
      })
    )
  }

  // Create simulated alert (for demo purposes)
  const createSimulatedAlert = () => {
    const randomTourist = tourists[Math.floor(Math.random() * tourists.length)]
    if (!randomTourist) return

    const newAlert = {
      id: `a${Date.now()}`,
      touristId: randomTourist.id,
      type: 'simulated',
      location: randomTourist.lastLocation,
      timestamp: new Date().toISOString(),
      status: 'new',
      description: 'Simulated alert for demo purposes'
    }

    setAlerts(prev => [newAlert, ...prev])
  }

  if (loading) {
    return <div className="loading">Loading dashboard...</div>
  }

  return (
    <div className="dashboard">
      <Sidebar 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onRefresh={loadData}
        onLogout={onLogout}
        onCreateAlert={createSimulatedAlert}
      />
      
      <main className="main-content">
        <header className="dashboard-header">
          <h1>Tourist Safety Monitoring Dashboard</h1>
          <div className="header-info">
            <span>Last refreshed: {lastRefresh.toLocaleTimeString()}</span>
            <button onClick={loadData} className="refresh-btn">Refresh</button>
          </div>
        </header>

        {/* Summary Cards */}
        <div className="summary-cards">
          <div className="summary-card">
            <h3>Active Tourists</h3>
            <div className="card-value">{activeTourists}</div>
          </div>
          <div className="summary-card alert">
            <h3>Active Alerts</h3>
            <div className="card-value">{activeAlerts}</div>
          </div>
          <div className="summary-card warning">
            <h3>High-Risk Zones</h3>
            <div className="card-value">{highRiskZones}</div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="content-grid">
          <div className="map-section">
            <MapView
              tourists={filteredTourists}
              alerts={alerts}
              policeUnits={policeUnits}
              selectedAlert={selectedAlert}
              onTouristSelect={setSelectedTourist}
              onAlertSelect={setSelectedAlert}
            />
          </div>
          
          <div className="alerts-section">
            <AlertsTable
              alerts={alerts}
              tourists={tourists}
              policeUnits={policeUnits}
              onAlertClick={setSelectedAlert}
              onAlertAction={handleAlertAction}
            />
          </div>
        </div>
      </main>

      {/* Tourist Profile Modal */}
      {selectedTourist && (
        <TouristProfileModal
          tourist={selectedTourist}
          alerts={alerts.filter(alert => alert.touristId === selectedTourist.id)}
          onClose={() => setSelectedTourist(null)}
        />
      )}
    </div>
  )
}

export default Dashboard
import React, { useState, useEffect, useRef } from 'react'
import 'leaflet/dist/leaflet.css'
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap } from 'react-leaflet'
import L from 'leaflet'

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Custom marker icons based on safety score
const createTouristIcon = (safetyScore, hasAlert = false) => {
  let color = '#4CAF50' // Green for safe (>75)
  if (safetyScore <= 40) color = '#f44336' // Red for low risk
  else if (safetyScore <= 75) color = '#ff9800' // Orange for medium risk
  
  const pulseClass = hasAlert ? ' pulse' : ''
  
  return L.divIcon({
    html: `<div class="tourist-marker${pulseClass}" style="background-color: ${color}"></div>`,
    className: 'custom-div-icon',
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  })
}

const alertIcon = L.divIcon({
  html: '<div class="alert-marker">⚠️</div>',
  className: 'custom-div-icon',
  iconSize: [30, 30],
  iconAnchor: [15, 15]
})

const policeIcon = L.divIcon({
  html: '<div class="police-marker">🚔</div>',
  className: 'custom-div-icon',
  iconSize: [25, 25],
  iconAnchor: [12, 12]
})

// Component to center map on selected alert
function MapController({ selectedAlert }) {
  const map = useMap()
  
  useEffect(() => {
    if (selectedAlert) {
      map.setView([selectedAlert.location.lat, selectedAlert.location.lng], 15)
    }
  }, [selectedAlert, map])
  
  return null
}

function MapView({ tourists, alerts, policeUnits, selectedAlert, onTouristSelect, onAlertSelect }) {
  const [showRiskZones, setShowRiskZones] = useState(true)
  const [selectedTouristForPath, setSelectedTouristForPath] = useState(null)
  const [pathAnimationIndex, setPathAnimationIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const animationRef = useRef()

  // High-risk zones (simulated)
  const riskZones = [
    {
      id: 'rz1',
      name: 'River Gorge - Restricted',
      center: [26.575, 93.168],
      radius: 1000,
      color: 'red'
    },
    {
      id: 'rz2',
      name: 'Cliff Area - Dangerous',
      center: [25.300, 91.731],
      radius: 800,
      color: 'orange'
    },
    {
      id: 'rz3',
      name: 'Dense Forest - Limited Access',
      center: [27.086, 92.413],
      radius: 1200,
      color: 'yellow'
    }
  ]

  // Animate path playback
  const startPathAnimation = () => {
    if (!selectedTouristForPath?.track?.length) return
    
    setIsAnimating(true)
    setPathAnimationIndex(0)
    
    const animateNext = (index) => {
      if (index >= selectedTouristForPath.track.length) {
        setIsAnimating(false)
        return
      }
      
      setPathAnimationIndex(index)
      animationRef.current = setTimeout(() => {
        animateNext(index + 1)
      }, 1500) // 1.5 seconds per step
    }
    
    animateNext(0)
  }

  const stopPathAnimation = () => {
    if (animationRef.current) {
      clearTimeout(animationRef.current)
    }
    setIsAnimating(false)
  }

  const stepForward = () => {
    if (selectedTouristForPath?.track && pathAnimationIndex < selectedTouristForPath.track.length - 1) {
      setPathAnimationIndex(pathAnimationIndex + 1)
    }
  }

  const stepBackward = () => {
    if (pathAnimationIndex > 0) {
      setPathAnimationIndex(pathAnimationIndex - 1)
    }
  }

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current)
      }
    }
  }, [])

  // Get alerts for each tourist to show warning indicators
  const getTouristAlerts = (touristId) => {
    return alerts.filter(alert => alert.touristId === touristId && alert.status === 'new')
  }

  return (
    <div className="map-container">
      <div className="map-controls">
        <button 
          onClick={() => setShowRiskZones(!showRiskZones)}
          className={`control-btn ${showRiskZones ? 'active' : ''}`}
        >
          {showRiskZones ? 'Hide' : 'Show'} Risk Zones
        </button>
        
        {selectedTouristForPath && (
          <div className="path-controls">
            <h4>Path Playback: {selectedTouristForPath.name}</h4>
            <div className="playback-controls">
              <button onClick={stepBackward} disabled={pathAnimationIndex === 0}>⏮️</button>
              <button 
                onClick={isAnimating ? stopPathAnimation : startPathAnimation}
                className="play-pause-btn"
              >
                {isAnimating ? '⏸️' : '▶️'}
              </button>
              <button 
                onClick={stepForward} 
                disabled={pathAnimationIndex >= (selectedTouristForPath.track?.length - 1)}
              >
                ⏭️
              </button>
              <button onClick={() => setSelectedTouristForPath(null)}>✖️</button>
            </div>
            <div className="animation-progress">
              Step {pathAnimationIndex + 1} of {selectedTouristForPath.track?.length || 0}
            </div>
          </div>
        )}
      </div>

      <MapContainer
        center={[26.2006, 92.9376]} // Center of Assam
        zoom={8}
        scrollWheelZoom={true}
        className="leaflet-map"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapController selectedAlert={selectedAlert} />

        {/* Tourist Markers */}
        {tourists.map(tourist => {
          const touristAlerts = getTouristAlerts(tourist.id)
          const hasActiveAlert = touristAlerts.length > 0
          
          return (
            <Marker
              key={tourist.id}
              position={[tourist.lastLocation.lat, tourist.lastLocation.lng]}
              icon={createTouristIcon(tourist.safetyScore, hasActiveAlert)}
            >
              <Popup>
                <div className="tourist-popup">
                  <div className="popup-header">
                    <img src={tourist.photoUrl} alt={tourist.name} />
                    <div>
                      <h4>{tourist.name}</h4>
                      <p>Safety Score: {tourist.safetyScore}%</p>
                    </div>
                  </div>
                  <div className="popup-info">
                    <p><strong>Last Seen:</strong> {new Date(tourist.lastLocation.timestamp).toLocaleString()}</p>
                    <p><strong>Heart Rate:</strong> {tourist.iotBand?.heartRate || 'N/A'} BPM</p>
                    <p><strong>Battery:</strong> {tourist.iotBand?.battery || 'N/A'}%</p>
                    {hasActiveAlert && (
                      <p className="alert-indicator"><strong>⚠️ Active Alert!</strong></p>
                    )}
                  </div>
                  <div className="popup-actions">
                    <button 
                      onClick={() => onTouristSelect(tourist)}
                      className="btn-primary"
                    >
                      Open Profile
                    </button>
                    <button 
                      onClick={() => setSelectedTouristForPath(tourist)}
                      className="btn-secondary"
                    >
                      Show Path
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          )
        })}

        {/* Alert Markers */}
        {alerts.filter(alert => alert.status !== 'resolved').map(alert => (
          <Marker
            key={alert.id}
            position={[alert.location.lat, alert.location.lng]}
            icon={alertIcon}
          >
            <Popup>
              <div className="alert-popup">
                <h4>🚨 {alert.type.toUpperCase()} Alert</h4>
                <p><strong>Time:</strong> {new Date(alert.timestamp).toLocaleString()}</p>
                <p><strong>Status:</strong> {alert.status}</p>
                <p>{alert.description}</p>
                <button 
                  onClick={() => onAlertSelect(alert)}
                  className="btn-danger"
                >
                  View Details
                </button>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Police Unit Markers */}
        {policeUnits.map(unit => (
          <Marker
            key={unit.id}
            position={[unit.lat, unit.lng]}
            icon={policeIcon}
          >
            <Popup>
              <div className="police-popup">
                <h4>{unit.name}</h4>
                <p><strong>Officers:</strong> {unit.officers}</p>
                <p><strong>Vehicles:</strong></p>
                <ul>
                  {unit.vehicles.map((vehicle, idx) => (
                    <li key={idx}>{vehicle}</li>
                  ))}
                </ul>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* High-Risk Zones */}
        {showRiskZones && riskZones.map(zone => (
          <Circle
            key={zone.id}
            center={zone.center}
            radius={zone.radius}
            color={zone.color}
            fillColor={zone.color}
            fillOpacity={0.1}
          >
            <Popup>
              <div className="zone-popup">
                <h4>{zone.name}</h4>
                <p>Radius: {zone.radius}m</p>
                <p>Tourists should avoid this area</p>
              </div>
            </Popup>
          </Circle>
        ))}

        {/* Tourist Path Visualization */}
        {selectedTouristForPath?.track && (
          <>
            {/* Full path polyline */}
            <Polyline
              positions={selectedTouristForPath.track.map(point => [point.lat, point.lng])}
              color="#2196F3"
              weight={3}
              opacity={0.7}
            />
            
            {/* Path points with timestamps */}
            {selectedTouristForPath.track.map((point, index) => (
              <Marker
                key={`path-${index}`}
                position={[point.lat, point.lng]}
                icon={L.divIcon({
                  html: `<div class="path-marker ${index <= pathAnimationIndex ? 'visited' : 'unvisited'}">${index + 1}</div>`,
                  className: 'custom-div-icon',
                  iconSize: [25, 25],
                  iconAnchor: [12, 12]
                })}
              >
                <Popup>
                  <div className="path-popup">
                    <h4>Path Point {index + 1}</h4>
                    <p><strong>Time:</strong> {new Date(point.timestamp).toLocaleString()}</p>
                    <p><strong>Coordinates:</strong> {point.lat.toFixed(4)}, {point.lng.toFixed(4)}</p>
                  </div>
                </Popup>
              </Marker>
            ))}
            
            {/* Current animation position marker */}
            {isAnimating && selectedTouristForPath.track[pathAnimationIndex] && (
              <Marker
                position={[
                  selectedTouristForPath.track[pathAnimationIndex].lat,
                  selectedTouristForPath.track[pathAnimationIndex].lng
                ]}
                icon={L.divIcon({
                  html: '<div class="current-position-marker">📍</div>',
                  className: 'custom-div-icon',
                  iconSize: [30, 30],
                  iconAnchor: [15, 15]
                })}
              />
            )}
          </>
        )}
      </MapContainer>
    </div>
  )
}

export default MapView
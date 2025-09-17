// API wrapper functions for backend communication
import axios from 'axios'

const API_BASE = 'http://localhost:3001/api'

// Fallback data for when server is not running
const fallbackData = {
  tourists: [],
  alerts: [],
  policeUnits: []
}

// Generic API call with fallback to local data
const apiCall = async (endpoint, fallback = null) => {
  try {
    const response = await axios.get(`${API_BASE}${endpoint}`)
    return response.data
  } catch (error) {
    console.warn(`API call failed for ${endpoint}, using fallback data:`, error.message)
    return fallback || []
  }
}

export const api = {
  // Get all tourists
  getTourists: async () => {
    return await apiCall('/tourists', fallbackData.tourists)
  },

  // Get specific tourist by ID
  getTourist: async (id) => {
    return await apiCall(`/tourist/${id}`, null)
  },

  // Get all alerts
  getAlerts: async () => {
    return await apiCall('/alerts', fallbackData.alerts)
  },

  // Get all police units
  getPoliceUnits: async () => {
    return await apiCall('/police-units', fallbackData.policeUnits)
  }
}

// Utility function to calculate distance between two points (Haversine formula)
export const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371 // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Find nearest police unit to a location
export const findNearestPoliceUnit = (location, policeUnits) => {
  let nearest = null
  let minDistance = Infinity

  policeUnits.forEach(unit => {
    const distance = calculateDistance(
      location.lat, location.lng,
      unit.lat, unit.lng
    )
    if (distance < minDistance) {
      minDistance = distance
      nearest = { ...unit, distance }
    }
  })

  return nearest
}
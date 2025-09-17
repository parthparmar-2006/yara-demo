// src/api.js
// Robust API wrapper with environment-aware base URL + static JSON fallback.
// - In dev (localhost) it uses http://localhost:3001/api by default (if available).
// - In production it prefers a VITE_API_BASE env var, then relative /api, then /data/*.json fallback.
// - This prevents deployed frontend from trying to reach a developer's localhost.
//
// Usage:
//  - To point the frontend to a remote backend, set VITE_API_BASE in your hosting platform to e.g. "https://my-backend.example.com/api"
//  - For demo sites with no backend, put data JSON files in public/data/ (tourists.json, alerts.json, police_units.json).
//
// Note: ERR_BLOCKED_BY_CLIENT often comes from ad-blockers blocking requests to localhost or certain paths.
// If you still see ERR_BLOCKED_BY_CLIENT on deployed site disable ad-block while testing.

import axios from 'axios'

const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')

// Priority order for API base:
// 1. VITE_API_BASE (explicitly set in environment, e.g., Vercel env var) — should include trailing /api if you prefer
// 2. If running on local dev machine -> use local Express server at http://localhost:3001/api
// 3. Production/default -> use relative /api (useful if you add serverless functions under /api on the same host)
// If nothing else, we will fallback to static JSON under /data/
const VITE_API_BASE = import.meta.env.VITE_API_BASE || ''
let API_BASE = ''

if (VITE_API_BASE) {
  // allow user-specified base (useful when backend is hosted remotely)
  API_BASE = VITE_API_BASE.replace(/\/$/, '') // strip trailing slash
} else if (isLocalhost) {
  API_BASE = 'http://localhost:3001/api' // local dev server
} else {
  API_BASE = '' // relative paths, so requests go to same origin /api/...
}

// Fallback data (runtime empty arrays — but prefer static JSON files placed in public/data/)
const runtimeFallback = {
  tourists: [],
  alerts: [],
  policeUnits: []
}

// helper: attempt network fetch and fall back to /data/<name>.json
async function apiCall(endpoint, fallbackKey = null) {
  // endpoint should start with '/', e.g. '/tourists' or '/tourist/123'
  // fallbackKey is the basename of the static JSON file (e.g., 'tourists' -> /data/tourists.json)
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`

  // Construct the candidate URLs in preferred order
  const candidateUrls = []

  // If API_BASE defined, try that first
  if (API_BASE) {
    // If user passed a VITE_API_BASE that already ends with "/api", allow full path construction
    candidateUrls.push(`${API_BASE}${cleanEndpoint}`)
  } else {
    // Use relative /api endpoints (same origin), e.g. /api/tourists
    candidateUrls.push(`/api${cleanEndpoint}`)
  }

  // Also try a direct /data fallback path (static json)
  // Map endpoint->filename: "/tourists" -> "tourists.json", "/alerts"->"alerts.json"
  const fallbackName = fallbackKey || cleanEndpoint.replace(/^\//, '').split('/')[0] // take first segment
  const fallbackStatic = `/data/${fallbackName}.json`
  candidateUrls.push(fallbackStatic)

  let lastError = null
  for (const url of candidateUrls) {
    try {
      // We use axios to request JSON; adjust timeout to avoid long waits
      const res = await axios.get(url, { timeout: 7000 })
      // success
      // If we fetched the static fallback, ensure the content structure is expected
      return res.data
    } catch (err) {
      lastError = err
      // Continue to next candidate URL
      console.warn(`API fetch failed for ${url}:`, err.message || err)
    }
  }

  // If all attempts fail, return runtime fallback if available
  console.error(`All API fetch attempts failed for endpoint ${endpoint}. Returning runtime fallback for key '${fallbackName}'. Last error:`, lastError && lastError.message)
  if (fallbackName === 'police_units' || fallbackName === 'policeUnits') return runtimeFallback.policeUnits
  if (fallbackName === 'alerts') return runtimeFallback.alerts
  if (fallbackName === 'tourists') return runtimeFallback.tourists
  return []
}

// Exposed API functions
export const api = {
  // Get all tourists
  getTourists: async () => {
    // Try '/tourists' -> /api/tourists or /data/tourists.json
    return await apiCall('/tourists', 'tourists')
  },

  // Get specific tourist by ID (try dedicated endpoint; fallback: fetch all tourists and find)
  getTourist: async (id) => {
    // Try '/tourist/:id' first
    try {
      const res = await apiCall(`/tourist/${id}`, null)
      // some backends may return 404 -> empty array/object; ensure we return something useful
      if (res && (typeof res === 'object')) return res
    } catch (e) {
      // ignore and fallback
    }

    // Fallback: load tourists list and find the id
    try {
      const list = await apiCall('/tourists', 'tourists')
      if (Array.isArray(list)) {
        return list.find(t => String(t.id) === String(id)) || null
      }
    } catch (e) {
      console.warn('Fallback getTourist failed:', e)
    }
    return null
  },

  // Get all alerts
  getAlerts: async () => {
    return await apiCall('/alerts', 'alerts')
  },

  // Get all police units
  getPoliceUnits: async () => {
    // Some projects name the json police_units.json or police-units.json; try both if necessary
    const data = await apiCall('/police-units', 'police_units')
    // normalize keys if required
    return data
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

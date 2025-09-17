import React, { useState } from 'react'
import jsPDF from 'jspdf'

function TouristProfileModal({ tourist, alerts, onClose }) {
  const [isLocked, setIsLocked] = useState(false)
  const [showEFirForm, setShowEFirForm] = useState(false)
  const [efirData, setEFirData] = useState({
    incidentType: 'Missing Person',
    description: '',
    reportingOfficer: localStorage.getItem('username') || 'Officer'
  })

  // Simulate blockchain hash verification
  const verifyBlockchainHash = () => {
    // Simulate verification process
    const isValid = Math.random() > 0.3 // 70% success rate for demo
    
    alert(
      isValid 
        ? `✅ Blockchain Verification Successful!\n\nStored Hash: ${tourist.kycHash}\nComputed Hash: ${tourist.kycHash}\nStatus: VALID\n\n(This is a simulated verification)`
        : `❌ Blockchain Verification Failed!\n\nStored Hash: ${tourist.kycHash}\nComputed Hash: 0x${Math.random().toString(16).substr(2, 64)}\nStatus: INVALID\n\n(This is a simulated verification)`
    )
  }

  // Generate and download E-FIR PDF
  const generateEFIR = () => {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.width
    const margin = 20

    // Header
    doc.setFontSize(20)
    doc.text('ELECTRONIC FIRST INFORMATION REPORT (E-FIR)', pageWidth / 2, 30, { align: 'center' })
    
    doc.setFontSize(16)
    doc.text('Tourist Safety Monitoring System', pageWidth / 2, 45, { align: 'center' })
    
    // Line
    doc.line(margin, 55, pageWidth - margin, 55)

    // FIR Details
    doc.setFontSize(12)
    let yPos = 70

    doc.text(`FIR No.: FIR-${Date.now()}`, margin, yPos)
    doc.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth - 70, yPos)
    yPos += 15

    doc.text(`Time: ${new Date().toLocaleTimeString()}`, margin, yPos)
    doc.text(`Reporting Officer: ${efirData.reportingOfficer}`, pageWidth - 100, yPos)
    yPos += 20

    // Tourist Information
    doc.setFontSize(14)
    doc.text('TOURIST INFORMATION:', margin, yPos)
    yPos += 10

    doc.setFontSize(12)
    doc.text(`Name: ${tourist.name}`, margin, yPos)
    yPos += 8
    doc.text(`Passport: ${tourist.passport}`, margin, yPos)
    yPos += 8
    doc.text(`Last Known Location: ${tourist.lastLocation.lat.toFixed(4)}, ${tourist.lastLocation.lng.toFixed(4)}`, margin, yPos)
    yPos += 8
    doc.text(`Last Seen: ${new Date(tourist.lastLocation.timestamp).toLocaleString()}`, margin, yPos)
    yPos += 8
    doc.text(`Safety Score: ${tourist.safetyScore}%`, margin, yPos)
    yPos += 15

    // Emergency Contacts
    doc.setFontSize(14)
    doc.text('EMERGENCY CONTACTS:', margin, yPos)
    yPos += 10

    doc.setFontSize(12)
    tourist.emergencyContacts.forEach(contact => {
      doc.text(`${contact.name}: ${contact.phone}`, margin, yPos)
      yPos += 8
    })
    yPos += 10

    // Incident Details
    doc.setFontSize(14)
    doc.text('INCIDENT DETAILS:', margin, yPos)
    yPos += 10

    doc.setFontSize(12)
    doc.text(`Incident Type: ${efirData.incidentType}`, margin, yPos)
    yPos += 8
    
    // Split description into lines
    const splitDescription = doc.splitTextToSize(`Description: ${efirData.description || 'Tourist reported missing/in distress based on IoT monitoring data'}`, pageWidth - 40)
    doc.text(splitDescription, margin, yPos)
    yPos += splitDescription.length * 5 + 10

    // IoT Band Information
    if (tourist.iotBand) {
      doc.setFontSize(14)
      doc.text('IOT BAND DATA:', margin, yPos)
      yPos += 10

      doc.setFontSize(12)
      doc.text(`Last Signal: ${new Date(tourist.iotBand.lastSignal).toLocaleString()}`, margin, yPos)
      yPos += 8
      doc.text(`Battery Level: ${tourist.iotBand.battery}%`, margin, yPos)
      yPos += 8
      doc.text(`Heart Rate: ${tourist.iotBand.heartRate} BPM`, margin, yPos)
      yPos += 15
    }

    // Blockchain Verification
    doc.setFontSize(14)
    doc.text('BLOCKCHAIN VERIFICATION:', margin, yPos)
    yPos += 10

    doc.setFontSize(12)
    doc.text(`KYC Hash: ${tourist.kycHash}`, margin, yPos)
    yPos += 8
    doc.text(`Verification Status: VERIFIED`, margin, yPos)
    yPos += 20

    // Signature
    doc.text('Digital Signature: _________________________', margin, yPos)
    yPos += 8
    doc.text(`Officer: ${efirData.reportingOfficer}`, margin, yPos)
    yPos += 8
    doc.text(`Generated: ${new Date().toLocaleString()}`, margin, yPos)

    // Footer
    doc.setFontSize(10)
    doc.text('This is a computer generated document from the Smart Tourist Safety Monitoring System', 
             pageWidth / 2, doc.internal.pageSize.height - 20, { align: 'center' })

    // Save the PDF
    doc.save(`E-FIR_${tourist.name.replace(/\s+/g, '_')}_${Date.now()}.pdf`)
    
    setShowEFirForm(false)
  }

  // Get safety score color and description
  const getSafetyScoreColor = (score) => {
    if (score > 75) return { color: '#4CAF50', status: 'Safe' }
    if (score > 40) return { color: '#ff9800', status: 'Caution' }
    return { color: '#f44336', status: 'Risk' }
  }

  const safetyInfo = getSafetyScoreColor(tourist.safetyScore)

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content tourist-profile-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Tourist Profile</h2>
          <button onClick={onClose} className="close-btn">×</button>
        </div>

        <div className="modal-body">
          <div className="profile-grid">
            {/* Basic Information */}
            <div className="profile-section">
              <div className="profile-photo">
                <img src={tourist.photoUrl} alt={tourist.name} />
                {isLocked && <div className="lock-overlay">🔒</div>}
              </div>
              <div className="basic-info">
                <h3>{tourist.name}</h3>
                <p><strong>Passport:</strong> {tourist.passport}</p>
                <p><strong>Visit Period:</strong> {new Date(tourist.visitStart).toLocaleDateString()} - {new Date(tourist.visitEnd).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Safety Score */}
            <div className="profile-section">
              <h4>Safety Score</h4>
              <div className="safety-score">
                <div 
                  className="score-circle" 
                  style={{ backgroundColor: safetyInfo.color }}
                >
                  {tourist.safetyScore}%
                </div>
                <span className="score-status" style={{ color: safetyInfo.color }}>
                  {safetyInfo.status}
                </span>
              </div>
            </div>

            {/* Last Location */}
            <div className="profile-section">
              <h4>Last Known Location</h4>
              <p><strong>Coordinates:</strong> {tourist.lastLocation.lat.toFixed(4)}, {tourist.lastLocation.lng.toFixed(4)}</p>
              <p><strong>Last Seen:</strong> {new Date(tourist.lastLocation.timestamp).toLocaleString()}</p>
            </div>

            {/* IoT Band Status */}
            {tourist.iotBand && (
              <div className="profile-section">
                <h4>IoT Band Status</h4>
                <div className="iot-status">
                  <div className="status-item">
                    <span className="status-label">Battery:</span>
                    <div className="battery-indicator">
                      <div 
                        className="battery-level" 
                        style={{ 
                          width: `${tourist.iotBand.battery}%`,
                          backgroundColor: tourist.iotBand.battery > 30 ? '#4CAF50' : '#f44336'
                        }}
                      ></div>
                    </div>
                    <span>{tourist.iotBand.battery}%</span>
                  </div>
                  <div className="status-item">
                    <span className="status-label">Heart Rate:</span>
                    <span className="heart-rate">{tourist.iotBand.heartRate} BPM</span>
                  </div>
                  <div className="status-item">
                    <span className="status-label">Last Signal:</span>
                    <span>{new Date(tourist.iotBand.lastSignal).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Itinerary */}
            <div className="profile-section">
              <h4>Planned Itinerary</h4>
              <div className="itinerary-list">
                {tourist.itinerary.map((item, index) => (
                  <div key={index} className="itinerary-item">
                    <span className="date">{new Date(item.date).toLocaleDateString()}</span>
                    <span className="place">{item.place}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Emergency Contacts */}
            <div className="profile-section">
              <h4>Emergency Contacts</h4>
              <div className="contacts-list">
                {tourist.emergencyContacts.map((contact, index) => (
                  <div key={index} className="contact-item">
                    <strong>{contact.name}</strong>
                    <a href={`tel:${contact.phone}`} className="phone-link">
                      {contact.phone}
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Related Alerts */}
            <div className="profile-section">
              <h4>Related Alerts ({alerts.length})</h4>
              {alerts.length > 0 ? (
                <div className="alerts-list">
                  {alerts.map(alert => (
                    <div key={alert.id} className={`alert-item ${alert.status}`}>
                      <div className="alert-header">
                        <span className="alert-type">{alert.type.toUpperCase()}</span>
                        <span className="alert-time">{new Date(alert.timestamp).toLocaleString()}</span>
                      </div>
                      <p className="alert-description">{alert.description}</p>
                      <span className={`status-badge ${alert.status}`}>{alert.status}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-alerts">No alerts for this tourist</p>
              )}
            </div>

            {/* Blockchain Verification */}
            <div className="profile-section">
              <h4>Blockchain Verification</h4>
              <div className="blockchain-info">
                <p><strong>KYC Hash:</strong></p>
                <code className="hash-display">{tourist.kycHash}</code>
                <button 
                  onClick={verifyBlockchainHash}
                  className="verify-btn"
                >
                  🔍 Verify Hash
                </button>
                <p><small>⚠️ This is a simulated blockchain verification for demo purposes</small></p>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <div className="action-buttons">
            <button 
              onClick={() => {
                const contact = tourist.emergencyContacts[0]
                if (contact) window.open(`tel:${contact.phone}`)
              }}
              className="btn-emergency"
            >
              📞 Contact Emergency
            </button>
            
            <button 
              onClick={() => setIsLocked(!isLocked)}
              className={`btn-lock ${isLocked ? 'locked' : ''}`}
            >
              {isLocked ? '🔓 Unlock' : '🔒 Lock'} ID
            </button>
            
            <button 
              onClick={() => setShowEFirForm(true)}
              className="btn-efir"
            >
              📄 Generate E-FIR
            </button>
            
            <button 
              onClick={onClose}
              className="btn-secondary"
            >
              Close
            </button>
          </div>
        </div>

        {/* E-FIR Form Modal */}
        {showEFirForm && (
          <div className="efir-modal">
            <div className="efir-form">
              <h3>Generate E-FIR</h3>
              <div className="form-group">
                <label>Incident Type:</label>
                <select 
                  value={efirData.incidentType}
                  onChange={(e) => setEFirData({...efirData, incidentType: e.target.value})}
                >
                  <option value="Missing Person">Missing Person</option>
                  <option value="Emergency Alert">Emergency Alert</option>
                  <option value="Medical Emergency">Medical Emergency</option>
                  <option value="Safety Concern">Safety Concern</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Description:</label>
                <textarea 
                  value={efirData.description}
                  onChange={(e) => setEFirData({...efirData, description: e.target.value})}
                  placeholder="Describe the incident details..."
                  rows="4"
                />
              </div>
              
              <div className="form-group">
                <label>Reporting Officer:</label>
                <input 
                  type="text"
                  value={efirData.reportingOfficer}
                  onChange={(e) => setEFirData({...efirData, reportingOfficer: e.target.value})}
                />
              </div>
              
              <div className="efir-buttons">
                <button onClick={generateEFIR} className="btn-primary">
                  📥 Download PDF
                </button>
                <button 
                  onClick={() => setShowEFirForm(false)} 
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TouristProfileModal
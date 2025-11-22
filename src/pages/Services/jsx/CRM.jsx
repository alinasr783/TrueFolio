import React from 'react'
import '../css/CRM.css'

export default function CRM() {
  return (
    <div className='service-page crm-page'>
      <div className='service-hero'>
        <div className='service-hero-content'>
          <h1 className='service-title'>CRM Systems</h1>
          <p className='service-subtitle'>Custom CRM systems to improve sales team efficiency and customer service</p>
          <div className='service-cta'>
            <button 
              className='cta-button'
              onClick={() => window.open("https://wa.me/201158954215", "_blank")}
            >
-               <button className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">Order your service now</button>
+               Order your service now
            </button>
          </div>
        </div>
      </div>

      <div className='service-details'>
        <div className='details-container'>
          <div className='details-content'>
            <h2>CRM Features</h2>
            <div className='features-grid'>
              <div className='feature-card'>
                <div className='feature-icon'>
                  <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                </div>
                <h3>Customer Management</h3>
                <p>Record and track all customer interactions in one place</p>
              </div>

              <div className='feature-card'>
                <div className='feature-icon'>
                  <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16h-6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2z"/>
                    <path d="M16 12h2a2 2 0 0 1 2 2v2"/>
                    <path d="M8 12h2a2 2 0 0 1 2 2v2"/>
                    <path d="M8 4h2a2 2 0 0 1 2 2v2"/>
                    <path d="M16 4h2a2 2 0 0 1 2 2v2"/>
                  </svg>
                </div>
                <h3>Sales Automation</h3>
                <p>Automate the sales process from start to close</p>
              </div>

              <div className='feature-card'>
                <div className='feature-icon'>
                  <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 16V8a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h4"/>
                    <polyline points="16,12 12,16 16,20"/>
                    <line x1="12" y1="16" x2="21" y2="16"/>
                  </svg>
                </div>
                <h3>Advanced Reports</h3>
                <p>Detailed analytics and reports on sales and team performance</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
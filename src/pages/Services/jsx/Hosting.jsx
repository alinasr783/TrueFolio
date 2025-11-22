import React from 'react'
import '../css/Hosting.css'

export default function Hosting() {
  return (
    <div className='service-page hosting-page'>
      <div className='service-hero'>
        <div className='service-hero-content'>
          <h1 className='service-title'>Web Hosting</h1>
          <p className='service-subtitle'>Ultra-fast, reliable web hosting solutions with 24/7 support</p>
          <div className='service-cta'>
            <button className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">Order your service now</button>
            <button 
              className='cta-button'
              onClick={() => window.open("https://wa.me/201158954215", "_blank")}
            >
            // ... existing code ...
            </button>
          </div>
        </div>
      </div>

      <div className='service-details'>
        <div className='details-container'>
          <div className='details-content'>
            <h2>Hosting Plans</h2>
            <div className='hosting-plans'>
              <div className='plan-card'>
                <div className='plan-header'>
                  <h3>Shared Hosting</h3>
                  <div className='plan-price'>$9.99<span>/month</span></div>
                </div>
                <ul className='plan-features'>
                  <li>10GB Storage</li>
                  <li>Free Domain</li>
                  <li>Unlimited Email</li>
                  <li>Free SSL Certificate</li>
                </ul>
              </div>

              <div className='plan-card featured'>
                <div className='plan-header'>
                  <h3>VPS</h3>
                  <div className='plan-price'>$29.99<span>/month</span></div>
                </div>
                <ul className='plan-features'>
                  <li>2 vCPU Core</li>
                  <li>4GB RAM</li>
                  <li>80GB SSD Storage</li>
                  <li>Unlimited Domains</li>
                </ul>
              </div>

              <div className='plan-card'>
                <div className='plan-header'>
                  <h3>Cloud Hosting</h3>
                  <div className='plan-price'>$49.99<span>/month</span></div>
                </div>
                <ul className='plan-features'>
                  <li>Scalable Resources</li>
                  <li>Automatic Backup</li>
                  <li>Free CDN</li>
                  <li>Premium Support</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
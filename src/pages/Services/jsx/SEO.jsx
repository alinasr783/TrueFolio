import React from 'react'
import Silk from '../../../components/bits/jsx/Silk';
import ElectricBorder from '../../../components/bits/jsx/ElectricBorder'
import Header from '../../../components/landing/jsx/Header'
import CTA from '../../../components/landing/jsx/CTAbtns'
import '../css/WebDesign.css'

export default function SEO() {
  return (
    <>
      <Header />
      <CTA />
    <div className='service-page web-design-page'>
      <div className='service-hero-WebDesign'>
        <div className='service-hero-content-WebDesign'>
          <div className='service-hero-background'>
            <Silk
              speed={5}
              scale={1}
              color="#6333ff"
              noiseIntensity={1.5}
              rotation={0}
            />
          </div>
          <h1 className='service-title'>SEO Optimization</h1>
          <p className='service-subtitle'>Search Engine Optimization to increase your site's visibility in the top results and increase organic visits</p>

          <div className='service-cta-WebDesign'>

              <button 
                className='cta-button-WebDesign'
                onClick={() => window.open("https://wa.me/201158954215", "_blank")}
              >
                <ElectricBorder
                  color="#6333ff"
                  speed={1}
                  chaos={0.5}
                  thickness={2}
                  style={{ borderRadius: 999 }}
                >
                  <div className='cta-button-text'>
                    Request a Price
                  </div>

                  </ElectricBorder>
              </button>

          </div>
        </div>
      </div>

      <div className='service-details'>
        <div className='details-container'>
          <div className='details-content'>
            <h2>SEO Strategies</h2>
            <div className='features-grid'>
              <div className='feature-card'>
                <div className='feature-icon'>
                  <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                </div>
                <h3>Technical SEO</h3>
                <p>Optimize the technical structure of the site to improve its indexing in search engines</p>
                <ul className='strategy-features'>
                  <li>Improve site speed</li>
                  <li>Structured data markup</li>
                  <li>Improve mobile experience</li>
                </ul>
              </div>
              <div className='feature-card'>
                <div className='strategy-icon'>
                  <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M2 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H2"/>
                    <path d="M22 3h-6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6"/>
                  </svg>
                </div>
                <h3>Competitor Analysis</h3>
                <p>Study competitor strategies and develop plans to outperform them</p>
                <ul className='strategy-features'>
                  <li>Keyword analysis</li>
                  <li>Backlink study</li>
                  <li>Content performance comparison</li>
                </ul>
              </div>
              <div className='feature-card'>
                <div className='feature-icon'>
                  <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2h-4z"/>
                    <path d="M6 18h12"/>
                  </svg>
                </div>
                <h3>Link Building</h3>
                <p>High-quality backlink building strategies to improve authority</p>
                <ul className='strategy-features'>
                  <li>Links from trusted sites</li>
                  <li>Shareable content</li>
                  <li>Organic attraction strategies</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
      </>
  )
}
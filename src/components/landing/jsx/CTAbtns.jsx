import React from 'react'
import { useNavigate } from 'react-router-dom'
import GlassSurface from '../../bits/jsx/GlassSurface'
import '../css/CTAbtns.css'

export default function CTAbtns(){
  const navigate = useNavigate();
  const prefersReduced = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  return(
    <div className='CTAbtns'>
      {prefersReduced ? (
        <div className='CTAbtns-content'>
          <div 
            className="getbtn cursor-pointer"
            aria-label="Message us on WhatsApp"
            onClick={() => window.open("https://wa.me/201158954215", "_blank")}
          >
            Message Us
          </div>
          <div className='connectbtn'
            onClick={()=> navigate("/signup")}
            >
            Get Started
          </div>
        </div>
      ) : (
        <GlassSurface
          displace={0.5}
          distortionScale={-150}
          redOffset={0}
          greenOffset={10}
          blueOffset={20}
          brightness={50}
          opacity={0.93}
          mixBlendMode="screen"
        >
          <div className='CTAbtns-content'>
            <div 
              className="getbtn cursor-pointer"
              aria-label="Message us on WhatsApp"
              onClick={() => window.open("https://wa.me/201158954215", "_blank")}
            >
              Message Us
            </div>
            <div className='connectbtn'
              onClick={()=> navigate("/signup")}
              >
              Get Started
            </div>
          </div>
        </GlassSurface>
      )}
    </div>
  )
}

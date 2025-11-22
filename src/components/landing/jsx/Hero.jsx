import React, { useEffect, useState } from 'react'
import Hyperspeed from '../../bits/jsx/Hyperspeed'
import TextPressure from '../../bits/jsx/TextPressure';
import '../css/Hero.css'

export default function Hero(){
  const [enableEffects, setEnableEffects] = useState(true);

  useEffect(() => {
    const prefersReduced = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const cores = typeof navigator !== 'undefined' && navigator.hardwareConcurrency ? navigator.hardwareConcurrency : 4;
    const mem = typeof navigator !== 'undefined' && navigator.deviceMemory ? navigator.deviceMemory : 4;
    if (prefersReduced || cores <= 2 || mem <= 2) {
      setEnableEffects(false);
    }
  }, []);

  return(
    <div className='Hero'>
      <div className='Hero-content'>
        <div className='Hero-text'>
          <div className='Hero-title'>
            <h1 style={{fontSize: '2rem', marginBottom: '1rem'}}>Create a professional website for your business</h1>
            <div style={{position: 'relative', height: '300px'}}>
              <TextPressure
                text="TrueFolio"
                flex={true}
                alpha={false}
                stroke={false}
                width={true}
                weight={true}
                italic={true}
                textColor="#ffffff"
                strokeColor="#ff0000"
                minFontSize={36}
              />
            </div>
          </div>
          <div className='Hero-subtitle'>
            <p style={{color:'#b0b0b0', marginBottom:'1rem'}}>Create Your Professional Website with TrueFolio</p>
            <div style={{position: 'relative', height: '300px'}}>
              <TextPressure
                text="Tailored - Websites, Timeless - Style"
                flex={true}
                alpha={false}
                stroke={false}
                width={true}
                weight={true}
                italic={true}
                textColor="#ffffff"
                strokeColor="#ff0000"
                minFontSize={30}
              />
            </div>
          </div>
        </div>
        <div className='Hero-button'>
          
        </div>
      </div>
      <div className='Hero-background'>
      {enableEffects ? (
      <Hyperspeed
        effectOptions={{
          onSpeedUp: () => { },
          onSlowDown: () => { },
          distortion: 'turbulentDistortion',
          length: 400,
          roadWidth: 10,
          islandWidth: 2,
          lanesPerRoad: 4,
          fov: 90,
          fovSpeedUp: 150,
          speedUp: 2,
          carLightsFade: 0.4,
          totalSideLightSticks: 20,
          lightPairsPerRoadWay: 40,
          shoulderLinesWidthPercentage: 0.05,
          brokenLinesWidthPercentage: 0.1,
          brokenLinesLengthPercentage: 0.5,
          lightStickWidth: [0.12, 0.5],
          lightStickHeight: [1.3, 1.7],
          movingAwaySpeed: [60, 80],
          movingCloserSpeed: [-120, -160],
          carLightsLength: [400 * 0.03, 400 * 0.2],
          carLightsRadius: [0.05, 0.14],
          carWidthPercentage: [0.3, 0.5],
          carShiftX: [-0.8, 0.8],
          carFloorSeparation: [0, 5],
          colors: {
            roadColor: 0x080808,
            islandColor: 0x0a0a0a,
            background: 0x000000,
            shoulderLines: 0xFFFFFF,
            brokenLines: 0xFFFFFF,
            leftCars: [0xD856BF, 0x6750A2, 0xC247AC],
            rightCars: [0x03B3C3, 0x0E5EA5, 0x324555],
            sticks: 0x03B3C3,
          }
        }}
      />
      ) : (
        <div style={{position:'absolute', inset:0, background:'radial-gradient(1200px circle at 20% 10%, rgba(120,119,198,0.15), transparent), linear-gradient(135deg, #0b0b0b, #111)'}} />
      )}
      </div>
    </div>
  )
}

import './App.css';
import GameSelector from './GameSelector';
import React, { useEffect, useRef, useState, useMemo } from 'react';

function Starfield() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    const stars = Array.from({ length: 120 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.2 + 0.2,
      o: Math.random() * 0.5 + 0.5,
    }));
    function draw() {
      ctx.clearRect(0, 0, width, height);
      for (const star of stars) {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r, 0, 2 * Math.PI);
        ctx.fillStyle = `rgba(255,255,255,${star.o})`;
        ctx.shadowColor = '#fff';
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }
    draw();
    function handleResize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      draw();
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return <canvas ref={canvasRef} className="starfield" />;
}

function StarCluster({ count = 6, radius = 36 }) {
  // Generate random positions for dots in a cluster only once
  const dots = useMemo(() => Array.from({ length: count }, (_, i) => {
    const angle = Math.random() * 2 * Math.PI;
    const r = Math.random() * radius;
    return {
      left: 50 + r * Math.cos(angle),
      top: 50 + r * Math.sin(angle),
      key: i,
    };
  }), [count, radius]);
  return (
    <div className="galaxy-cluster">
      {dots.map(dot => (
        <div
          key={dot.key}
          className="galaxy-cluster-dot"
          style={{ left: `${dot.left}%`, top: `${dot.top}%` }}
        />
      ))}
    </div>
  );
}

const sections = [
  {
    key: 'about',
    label: 'About',
    content: (
      <div>
        <h2>About</h2>
        <p>
          Hi! I'm prototyping a website. This is a working environment where I can share my progress.
        </p>
      </div>
    ),
  },
  {
    key: 'games',
    label: 'Games',
    content: (
      <div>
        <h2>Arcade Games</h2>
        <GameSelector />
      </div>
    ),
  },
  {
    key: 'contact',
    label: 'Contact',
    content: (
      <div>
        <h2>Contact</h2>
        <p>
          Want to get in touch? Email me at <a href="mailto:hondrakma@gmail.com">hondrakma@gmail.com</a>
        </p>
      </div>
    ),
  },
];

function GalaxyMenu() {
  const [openSection, setOpenSection] = useState(null);
  const [hovered, setHovered] = useState(null);
  const [focused, setFocused] = useState(null);
  // Hardcoded visually pleasing positions for 3 clusters
  const positions = [
    { left: '70%', top: '10%' },    // top right - About
    { left: '15%', top: '35%' },    // middle left - Snake
    { left: '15%', top: '65%' },    // middle left - Pong
    { left: '65%', top: '75%' },    // bottom right - Contact
  ];
  const tooltips = [
    'Learn more about this site',
    'Play the Snake Game!',
    'Play the Pong Game!',
    'Contact me',
  ];
  function handleKeyDown(e, sectionKey) {
    if (e.key === 'Enter' || e.key === ' ') {
      setOpenSection(sectionKey);
    }
  }
  return (
    <div className="galaxy-orbit-menu" style={{ width: '100%', height: '60vh', minHeight: 320, position: 'relative' }}>
      {sections.map((section, i) => {
        const pos = positions[i];
        const angle = 0; // not used for label/line now
        const isActive = hovered === section.key || focused === section.key;
        return (
          <div
            key={section.key}
            className={
              'galaxy-orbit-star' +
              (openSection === section.key ? ' active' : '')
            }
            style={{ left: pos.left, top: pos.top, position: 'absolute' }}
            onMouseEnter={() => setHovered(section.key)}
            onMouseLeave={() => setHovered(null)}
            onFocus={() => setFocused(section.key)}
            onBlur={() => setFocused(null)}
            onClick={() => setOpenSection(section.key)}
            onKeyDown={e => handleKeyDown(e, section.key)}
            tabIndex={0}
            role="button"
            aria-label={tooltips[i]}
            aria-pressed={openSection === section.key}
          >
            <StarCluster />
            <div className="galaxy-orbit-ring" />
            <div
              className={
                'galaxy-orbit-line' + (isActive ? ' visible' : '')
              }
              style={{ width: 40, left: '100%', top: '50%', transform: 'translateY(-50%)' }}
            />
            <span
              className={
                'galaxy-orbit-label' + (isActive ? ' visible' : '')
              }
              style={{ left: 'calc(100% + 24px)', top: '50%', transform: 'translateY(-50%)' }}
            >
              {section.label}
            </span>
          </div>
        );
      })}
      {openSection && (
        <div className="galaxy-modal" onClick={() => setOpenSection(null)}>
          <div className="galaxy-modal-content" onClick={e => e.stopPropagation()}>
            <button className="galaxy-modal-close" onClick={() => setOpenSection(null)}>&times;</button>
            {sections.find(s => s.key === openSection).content}
          </div>
        </div>
      )}
    </div>
  );
}

function ShootingStars() {
  const [stars, setStars] = useState([]);
  const visibleRef = useRef(document.visibilityState === 'visible');
  useEffect(() => {
    function handleVisibility() {
      visibleRef.current = document.visibilityState === 'visible';
      if (visibleRef.current) {
        setStars([]); // Clear out old stars when tab becomes visible
      }
    }
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);
  useEffect(() => {
    let timeout;
    function spawnStar() {
      if (visibleRef.current) {
        const angle = Math.random() * Math.PI / 3 - Math.PI / 6; // -30deg to +30deg
        const startY = Math.random() * window.innerHeight * 0.7;
        setStars(s => [
          ...s,
          {
            id: Math.random(),
            x: -100,
            y: startY,
            angle,
          },
        ]);
      }
      timeout = setTimeout(spawnStar, 2000 + Math.random() * 4000);
    }
    spawnStar();
    return () => clearTimeout(timeout);
  }, []);
  useEffect(() => {
    if (!stars.length) return;
    const interval = setInterval(() => {
      setStars(s => s
        .map(star => ({
          ...star,
          x: star.x + 18,
          y: star.y + 18 * Math.tan(star.angle),
        }))
        .filter(star => star.x < window.innerWidth + 100 && star.y < window.innerHeight + 100)
      );
    }, 32);
    return () => clearInterval(interval);
  }, [stars]);
  return (
    <>
      {stars.map(star => (
        <div
          key={star.id}
          className="shooting-star"
          style={{
            left: star.x,
            top: star.y,
            transform: `rotate(${star.angle * 180 / Math.PI}deg)`
          }}
        >
          <div className="shooting-star-head" />
        </div>
      ))}
    </>
  );
}

function App() {
  return (
    <>
      <Starfield />
      <ShootingStars />
      <GalaxyMenu />
      <footer className="footer">
        &copy; 2024 Your Name. All rights reserved.
      </footer>
    </>
  );
}

export default App;

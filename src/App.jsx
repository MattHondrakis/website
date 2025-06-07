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
    key: 'projects',
    label: 'Projects',
    content: (
      <div>
        <h2>Featured Projects</h2>
        <div className="projects-grid">
          <a 
            href="https://github.com/MattHondrakis/DataAnalysis/blob/main/NYC%20House%20Prices/NYCHousePrices.md"
            target="_blank"
            rel="noopener noreferrer"
            className="project-card"
          >
            <h3>NYC House Prices</h3>
            <div className="project-tags">
              <span className="tag">Data Analysis</span>
              <span className="tag">Machine Learning</span>
            </div>
            <p>
              Built GAM, Random Forest and Linear Regression models predicting NYC real estate prices. 
              Extracted property types from home_details for enhanced modeling accuracy.
            </p>
          </a>
          <a 
            href="https://github.com/MattHondrakis/DataAnalysis/blob/main/Masters%20Project%20Job%20Placement/Masters-Project-Fall-Placement.md"
            target="_blank"
            rel="noopener noreferrer"
            className="project-card"
          >
            <h3>Job Placement Analysis</h3>
            <div className="project-tags">
              <span className="tag">Data Science</span>
              <span className="tag">Machine Learning</span>
            </div>
            <p>
              Created Random Forest and Logistic Regression models achieving 85.3% accuracy and 0.932 AUC 
              for job placement prediction.
            </p>
          </a>
          <a 
            href="https://github.com/MattHondrakis/DataAnalysis/blob/main/Coursera%20Case%20Study/Bikes.md"
            target="_blank"
            rel="noopener noreferrer"
            className="project-card"
          >
            <h3>Coursera Case Study: Bikes</h3>
            <div className="project-tags">
              <span className="tag">Data Analysis</span>
              <span className="tag">R</span>
            </div>
            <p>
              Analyzed 6M+ rows of bike-sharing data to develop membership conversion strategies.
              Used R for comprehensive exploratory data analysis.
            </p>
          </a>
        </div>
        <div className="github-cta">
          <a href="https://github.com/MattHondrakis" target="_blank" rel="noopener noreferrer" className="github-link">
            View More on GitHub
          </a>
        </div>
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
      <div className="content-container">
        {sections.map(section => (
          <section key={section.key} className={`section ${section.key}-section`}>
            {section.content}
          </section>
        ))}
      </div>
      <footer className="footer">
        &copy; 2025 Matthew Hondrakis.
      </footer>
    </>
  );
}

export default App;

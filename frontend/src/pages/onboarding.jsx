import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SLIDES = [
  {
    title: 'Welcome to NIKO ON!!!😎',
    text: 'Discover events, hackathons, art jams and connect with students around you.',
    image: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Join the Energy',
    text: 'From late-night coding sprints to sunset acoustic sessions — everything lives here.',
    image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Create & Share',
    text: 'Post your own events, react, comment and grow your campus community.',
    image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Ready to Start?',
    text: 'Create an account or log in to enter the Quantum Logic terminal.',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
  },
];

const Onboarding = () => {
  const [current, setCurrent] = useState(0);
  const [muted, setMuted] = useState(false);
  const audioRef = useRef(null);
  const navigate = useNavigate();

  // Try to play the song when the component mounts
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = 0.4; // keep it soft
      audio.play().catch(() => {
        // Browsers block autoplay until user interacts — that's normal
      });
    }
  }, []);

  const finishOnboarding = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    if (audioRef.current) {
      audioRef.current.pause();
    }
    const token = localStorage.getItem('token');
    navigate(token ? '/dashboard' : '/login');
  };

  const nextSlide = () => {
    if (current < SLIDES.length - 1) {
      setCurrent(current + 1);
    } else {
      finishOnboarding();
    }
  };

  const skip = () => {
    finishOnboarding();
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !muted;
      setMuted(!muted);
    }
  };

  const slide = SLIDES[current];

  return (
    <div style={styles.container}>
      {/* Background song – put your .mp3 in public/audio/ */}
      <audio
        ref={audioRef}
        src="/audio/onboarding-song.mp3"
        loop
        preload="auto"
      />

      {/* Background image */}
      <div
        style={{
          ...styles.bgImage,
          backgroundImage: `url(${slide.image})`,
        }}
      />
      <div style={styles.overlay} />

      {/* Content */}
      <div style={styles.content}>
        {/* Mute button */}
        <button onClick={toggleMute} style={styles.muteBtn}>
          {muted ? '🔇' : '🔊'}
        </button>

        {/* Skip */}
        <button onClick={skip} style={styles.skipBtn}>
          Skip
        </button>

        <div style={styles.bottom}>
          <h1 style={styles.title}>{slide.title}</h1>
          <p style={styles.text}>{slide.text}</p>

          {/* Dots */}
          <div style={styles.dots}>
            {SLIDES.map((_, i) => (
              <span
                key={i}
                style={{
                  ...styles.dot,
                  backgroundColor: i === current ? '#38bdf8' : 'rgba(255,255,255,0.3)',
                }}
              />
            ))}
          </div>

          <button onClick={nextSlide} style={styles.nextBtn}>
            {current === SLIDES.length - 1 ? 'Get Started' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    position: 'relative',
    minHeight: '100vh',
    maxWidth: '480px',
    margin: '0 auto',
    overflow: 'hidden',
    backgroundColor: '#050b14',
    color: '#fff',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  bgImage: {
    position: 'absolute',
    inset: 0,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    transition: 'background-image 0.6s ease',
  },
  overlay: {
    position: 'absolute',
    inset: 0,
    background:
      'linear-gradient(to top, rgba(5,11,20,0.95) 0%, rgba(5,11,20,0.5) 50%, rgba(5,11,20,0.3) 100%)',
  },
  content: {
    position: 'relative',
    zIndex: 10,
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    padding: '24px',
  },
  muteBtn: {
    position: 'absolute',
    top: '20px',
    left: '20px',
    background: 'rgba(0,0,0,0.4)',
    border: '1px solid rgba(255,255,255,0.2)',
    color: '#fff',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    fontSize: '18px',
    cursor: 'pointer',
  },
  skipBtn: {
    position: 'absolute',
    top: '24px',
    right: '24px',
    background: 'transparent',
    border: 'none',
    color: 'rgba(255,255,255,0.7)',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  bottom: {
    textAlign: 'center',
    paddingBottom: '20px',
  },
  title: {
    fontSize: '26px',
    fontWeight: '800',
    margin: '0 0 12px 0',
    letterSpacing: '-0.5px',
  },
  text: {
    fontSize: '15px',
    color: 'rgba(255,255,255,0.75)',
    lineHeight: '1.5',
    margin: '0 0 28px 0',
    maxWidth: '320px',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  dots: {
    display: 'flex',
    justifyContent: 'center',
    gap: '8px',
    marginBottom: '24px',
  },
  dot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    transition: 'background-color 0.3s',
  },
  nextBtn: {
    width: '100%',
    maxWidth: '280px',
    backgroundColor: '#0284c7',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    padding: '14px',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 4px 20px rgba(2, 132, 199, 0.4)',
  },
};

export default Onboarding;

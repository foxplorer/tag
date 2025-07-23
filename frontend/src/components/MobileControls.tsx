import React, { useState, useRef, useEffect } from 'react';
import './MobileControls.css';

interface MobileControlsProps {
  onJoystickMove: (x: number, y: number) => void;
  onJoystickEnd: () => void;
  onZoomChange: (scale: number) => void;
  onShoot: () => void;
  isChaser: boolean;
  showJoystick?: boolean;
  showShootButton?: boolean;
  showZoomControls?: boolean;
  onFullscreenToggle?: () => void;
  isFullscreen?: boolean;
}

export const MobileControls: React.FC<MobileControlsProps> = ({
  onJoystickMove,
  onJoystickEnd,
  onZoomChange,
  onShoot,
  isChaser,
  showJoystick = true,
  showShootButton = true,
  showZoomControls = true,
  onFullscreenToggle,
  isFullscreen = false
}) => {
  const [joystickActive, setJoystickActive] = useState(false);
  const [joystickPosition, setJoystickPosition] = useState({ x: 0, y: 0 });
  const joystickRef = useRef<HTMLDivElement>(null);
  const [currentZoom, setCurrentZoom] = useState(0.5);
  const [isBoostActive, setIsBoostActive] = useState(false);

  // Add global event listeners for joystick
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (joystickActive) {
        updateJoystickPosition(e as any);
      }
    };

    const handleGlobalMouseUp = (e: MouseEvent) => {
      if (joystickActive) {
        handleJoystickEnd(e as any);
      }
    };

    const handleGlobalTouchMove = (e: TouchEvent) => {
      if (joystickActive) {
        e.preventDefault();
        updateJoystickPosition(e as any);
      }
    };

    const handleGlobalTouchEnd = (e: TouchEvent) => {
      if (joystickActive) {
        e.preventDefault();
        handleJoystickEnd(e as any);
      }
    };

    // Add global listeners
    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);
    document.addEventListener('touchmove', handleGlobalTouchMove, { passive: false });
    document.addEventListener('touchend', handleGlobalTouchEnd, { passive: false });

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('touchmove', handleGlobalTouchMove);
      document.removeEventListener('touchend', handleGlobalTouchEnd);
    };
  }, [joystickActive]);

  const handleJoystickStart = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    setJoystickActive(true);
    updateJoystickPosition(e);
  };

  const handleJoystickMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (joystickActive) {
      e.preventDefault();
      updateJoystickPosition(e);
    }
  };

  const handleJoystickEnd = (e?: React.TouchEvent | React.MouseEvent) => {
    if (e) e.preventDefault();
    setJoystickActive(false);
    setJoystickPosition({ x: 0, y: 0 });
    setIsBoostActive(false);
    onJoystickEnd();
  };

  const updateJoystickPosition = (e: React.TouchEvent | React.MouseEvent) => {
    if (!joystickRef.current) return;

    const rect = joystickRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const deltaX = clientX - centerX;
    const deltaY = clientY - centerY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const maxDistance = rect.width / 2;

    let normalizedX = deltaX / maxDistance;
    let normalizedY = deltaY / maxDistance;

    // Always allow movement even when dragging outside the joystick
    // Clamp the visual position but keep the actual input
    const clampedX = Math.max(-1, Math.min(1, normalizedX));
    const clampedY = Math.max(-1, Math.min(1, normalizedY));

    setJoystickPosition({ x: clampedX, y: clampedY });
    
    // Check for boost activation (distance > 1.2)
    const boostDistance = Math.sqrt(normalizedX * normalizedX + normalizedY * normalizedY);
    const boostActive = boostDistance > 1.2;
    setIsBoostActive(boostActive);
    
    // Pass the actual input values (not clamped) to the game
    onJoystickMove(normalizedX, normalizedY);
  };

  const handleZoomIn = () => {
    const newZoom = Math.min(currentZoom + 0.2, 3);
    setCurrentZoom(newZoom);
    onZoomChange(newZoom);
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(currentZoom - 0.2, 0.25);
    setCurrentZoom(newZoom);
    onZoomChange(newZoom);
  };

  return (
    <>
      {/* Joystick - Centered at bottom (mobile only) */}
      {showJoystick && (
        <div className="mobile-controls">
          <div 
            className="joystick-container"
            onTouchStart={handleJoystickStart}
            onMouseDown={handleJoystickStart}
          >
            <div
              ref={joystickRef}
              className={`joystick-base ${isBoostActive ? 'boost-active' : ''}`}
            >
              <div
                className={`joystick-thumb ${isBoostActive ? 'boost-active' : ''}`}
                style={{
                  transform: `translate(${joystickPosition.x * 30}px, ${joystickPosition.y * 30}px)`
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Zoom Controls - Bottom right (always shown) */}
      {showZoomControls && (
        <div className="zoom-controls">
          <button className="zoom-btn" onClick={handleZoomIn}>
            +
          </button>
          <button className="zoom-btn" onClick={handleZoomOut}>
            -
          </button>
          {onFullscreenToggle && (
            <button className="zoom-btn fullscreen-btn" onClick={onFullscreenToggle} aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}>
              {isFullscreen ? (
                // Exit fullscreen SVG (inward arrows)
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 15 12 12 15 15" />
                  <line x1="12" y1="12" x2="12" y2="21" />
                  <polyline points="15 9 12 12 9 9" />
                  <line x1="12" y1="12" x2="12" y2="3" />
                </svg>
              ) : (
                // Enter fullscreen SVG (open corners, flipped vertically)
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {/* Top left */}
                  <polyline points="4 9 4 4 9 4" />
                  {/* Top right */}
                  <polyline points="15 4 20 4 20 9" />
                  {/* Bottom left */}
                  <polyline points="4 15 4 20 9 20" />
                  {/* Bottom right */}
                  <polyline points="20 15 20 20 15 20" />
                </svg>
              )}
            </button>
          )}
        </div>
      )}

      {/* Shoot Button - Bottom left (mobile only) */}
      {showShootButton && isChaser && (
        <div className="shoot-button">
          <button 
            className="action-btn shoot-btn" 
            onClick={() => {
            //  console.log('MobileControls: Shoot button clicked!');
              onShoot();
            }}
          >
            SHOOT
          </button>
        </div>
      )}
    </>
  );
}; 
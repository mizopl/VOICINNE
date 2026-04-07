import React from 'react';

interface PhoneFrameProps {
  children: React.ReactNode;
}

export function PhoneFrame({ children }: PhoneFrameProps) {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#050505',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <div
        style={{
          width: '390px',
          height: '844px',
          backgroundColor: '#0a0a0a',
          borderRadius: '52px',
          border: '2px solid #2a2a2a',
          boxShadow: '0 0 0 1px #111, 0 30px 80px rgba(0,0,0,0.8), inset 0 0 0 2px #333',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Notch */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '126px',
            height: '34px',
            backgroundColor: '#050505',
            borderBottomLeftRadius: '20px',
            borderBottomRightRadius: '20px',
            zIndex: 100,
          }}
        />

        {/* Inner screen area */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            position: 'relative',
            paddingTop: '44px',
            paddingBottom: '24px',
            scrollbarWidth: 'none',
          }}
          className="phone-inner"
        >
          {children}
        </div>

        {/* Home indicator */}
        <div
          style={{
            position: 'absolute',
            bottom: '8px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '134px',
            height: '5px',
            backgroundColor: '#444',
            borderRadius: '3px',
          }}
        />
      </div>
    </div>
  );
}

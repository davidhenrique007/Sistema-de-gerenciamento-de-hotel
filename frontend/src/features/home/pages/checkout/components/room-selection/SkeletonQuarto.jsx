import React from 'react';

const SkeletonQuarto = () => {
  const skeletonRowStyle = {
    display: 'grid',
    gridTemplateColumns: '80px 100px 100px 80px 120px',
    gap: '16px',
    padding: '12px 16px',
    borderBottom: '1px solid #eaeaea',
    alignItems: 'center'
  };

  const skeletonItemStyle = {
    height: '20px',
    background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
    borderRadius: '4px'
  };

  return (
    <div>
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
      {[...Array(5)].map((_, index) => (
        <div key={index} style={skeletonRowStyle}>
          <div style={skeletonItemStyle}></div>
          <div style={skeletonItemStyle}></div>
          <div style={skeletonItemStyle}></div>
          <div style={skeletonItemStyle}></div>
          <div style={skeletonItemStyle}></div>
        </div>
      ))}
    </div>
  );
};

export default SkeletonQuarto;
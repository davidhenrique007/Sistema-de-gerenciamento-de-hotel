import React from 'react';

const SkeletonQuarto = () => {
  const skeletonStyle = {
    height: '20px',
    background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
    borderRadius: '4px'
  };

  return (
    <div style={{ padding: '8px 0' }}>
      {[...Array(5)].map((_, index) => (
        <div key={index} style={{ display: 'grid', gridTemplateColumns: '60px 100px 120px 120px', gap: '16px', padding: '12px 8px', borderBottom: '1px solid #eaeaea' }}>
          <div style={skeletonStyle}></div>
          <div style={skeletonStyle}></div>
          <div style={skeletonStyle}></div>
          <div style={skeletonStyle}></div>
        </div>
      ))}
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
};

export default SkeletonQuarto;

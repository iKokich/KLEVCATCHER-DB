import React from 'react';
import Lottie from 'lottie-react';
import animationData from '../assets/Game_asset.json';

function AnimatedText() {
  return (
    <div className="main-content">
      <Lottie
        animationData={animationData}
        loop
        autoplay
        rendererSettings={{
          preserveAspectRatio: 'xMidYMid meet',
        }}
        style={{ 
          width: 550, 
          height: 550,
        }}
      />
    </div>
  );
}

export default AnimatedText;

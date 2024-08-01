
import React, { useEffect, useRef } from 'react';

const ConfettiCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    let W = window.innerWidth;
    let H = window.innerHeight;
    const maxConfettis = 150;
    const particles = [];

    const possibleColors = [
      "DodgerBlue", "OliveDrab", "Gold", "Pink", "SlateBlue",
      "LightBlue", "Gold", "Violet", "PaleGreen", "SteelBlue",
      "SandyBrown", "Chocolate", "Crimson"
    ];

    function randomFromTo(from, to) {
      return Math.floor(Math.random() * (to - from + 1) + from);
    }

    function ConfettiParticle() {
      this.x = 0; // Start from the bottom left corner
      this.y = H;
      this.r = randomFromTo(5, 15); // Smaller radius for a more natural effect
      this.d = Math.random() * maxConfettis + 11;
      this.color = possibleColors[Math.floor(Math.random() * possibleColors.length)];
      this.tilt = Math.floor(Math.random() * 33) - 11;
      this.tiltAngleIncremental = Math.random() * 0.07 + 0.05;
      this.tiltAngle = 0;
      // Random velocities to simulate the spread
      this.velocityX = Math.random() * 6 - 3; // Random X velocity
      this.velocityY = Math.random() * 10 - 5; // Random Y velocity

      this.draw = function() {
        context.beginPath();
        context.lineWidth = this.r / 2;
        context.strokeStyle = this.color;
        context.moveTo(this.x + this.tilt + this.r / 3, this.y);
        context.lineTo(this.x + this.tilt, this.y + this.tilt + this.r / 5);
        return context.stroke();
      };
    }

    function draw() {
      context.clearRect(0, 0, W, H);
      let remainingFlakes = 0;

      particles.forEach(particle => {
        particle.draw();
        // Update particle position and properties
        particle.tiltAngle += particle.tiltAngleIncremental;
        particle.x += particle.velocityX; // Apply X velocity
        particle.y += particle.velocityY; // Apply Y velocity
        particle.tilt = Math.sin(particle.tiltAngle - particle.d / 3) * 15;

        // Check if particles are still in view
        if (particle.y <= H) remainingFlakes++;

        if (particle.x > W || particle.x < 0 || particle.y > H) {
          // Reset particles to start again
          particle.x = 0;
          particle.y = H;
          particle.velocityX = Math.random() * 6 - 3;
          particle.velocityY = Math.random() * 10 - 5;
        }
      });

      requestAnimationFrame(draw);
    }

    function handleResize() {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W;
      canvas.height = H;
    }

    window.addEventListener('resize', handleResize);
    handleResize(); // Set canvas size initially

    // Initialize particles
    for (let i = 0; i < maxConfettis; i++) {
      particles.push(new ConfettiParticle());
    }

    draw(); // Start the animation

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        bottom: 10, // Align canvas to the bottom
        left: 10, // Align canvas to the left
        width: '100vw',
        height: '40vh',
        pointerEvents: 'none',
        zIndex: 1000,
      }}
    />
  );
};

export default ConfettiCanvas;

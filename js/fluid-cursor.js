/**
 * Fluid Cursor Effect
 * Simple but effective fluid-like cursor trail
 */

(function() {
  'use strict';
  
  console.log('Loading fluid cursor effect...');
  
  // Wait for DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
  function init() {
    console.log('Initializing fluid cursor effect...');
    
    // Create canvas
    const canvas = document.createElement('canvas');
    canvas.id = 'fluid-cursor-canvas';
    canvas.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      z-index: 9999;
      pointer-events: none;
      background: transparent;
    `;
    document.body.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;
    
    // Particle system
    const particles = [];
    const maxParticles = 100;
    let mouse = { x: width / 2, y: height / 2, prevX: width / 2, prevY: height / 2 };
    let hue = 0;
    
    class Particle {
      constructor(x, y, vx = 0, vy = 0) {
        this.x = x;
        this.y = y;
        this.vx = vx + (Math.random() - 0.5) * 4;
        this.vy = vy + (Math.random() - 0.5) * 4;
        this.size = Math.random() * 6 + 2;
        this.color = `hsl(${hue + Math.random() * 60}, 100%, 60%)`;
        this.life = 1;
        this.decay = 0.02;
        this.gravity = 0.05;
        this.friction = 0.99;
      }
      
      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += this.gravity;
        this.vx *= this.friction;
        this.vy *= this.friction;
        this.size *= 0.98;
        this.life -= this.decay;
      }
      
      draw() {
        if (this.life <= 0) return;
        
        ctx.save();
        ctx.globalAlpha = this.life;
        
        // Glow effect
        const gradient = ctx.createRadialGradient(
          this.x, this.y, 0,
          this.x, this.y, this.size * 3
        );
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(0.5, this.color + '80');
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Core particle
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 0.5, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
      }
    }
    
    function createParticles(x, y, vx, vy) {
      const count = 3 + Math.random() * 3;
      for (let i = 0; i < count; i++) {
        particles.push(new Particle(x, y, vx, vy));
      }
    }
    
    function animate() {
      // Fade effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, width, height);
      
      // Update hue
      hue += 1;
      if (hue > 360) hue = 0;
      
      // Create particles at mouse position
      if (Math.random() < 0.4) {
        createParticles(mouse.x, mouse.y, 0, 0);
      }
      
      // Limit particles
      if (particles.length > maxParticles) {
        particles.splice(0, particles.length - maxParticles);
      }
      
      // Update and draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];
        particle.update();
        particle.draw();
        
        // Remove dead particles
        if (particle.life <= 0 || particle.size <= 0.1) {
          particles.splice(i, 1);
        }
      }
      
      requestAnimationFrame(animate);
    }
    
    // Mouse move handler
    document.addEventListener('mousemove', (e) => {
      mouse.prevX = mouse.x;
      mouse.prevY = mouse.y;
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      
      // Create particles based on movement
      const dx = mouse.x - mouse.prevX;
      const dy = mouse.y - mouse.prevY;
      const speed = Math.sqrt(dx * dx + dy * dy);
      
      if (speed > 2) {
        createParticles(mouse.x, mouse.y, dx * 0.2, dy * 0.2);
      }
    });
    
    // Mouse down handler
    document.addEventListener('mousedown', (e) => {
      createParticles(e.clientX, e.clientY, 0, 0);
    });
    
    // Touch support
    document.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      createParticles(touch.clientX, touch.clientY, 0, 0);
    }, { passive: false });
    
    document.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      mouse.prevX = mouse.x;
      mouse.prevY = mouse.y;
      mouse.x = touch.clientX;
      mouse.y = touch.clientY;
      
      const dx = mouse.x - mouse.prevX;
      const dy = mouse.y - mouse.prevY;
      const speed = Math.sqrt(dx * dx + dy * dy);
      
      if (speed > 2) {
        createParticles(mouse.x, mouse.y, dx * 0.2, dy * 0.2);
      }
    }, { passive: false });
    
    // Resize handler
    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });
    
    // Start animation
    animate();
    
    console.log('Fluid cursor effect activated successfully!');
  }
})();

class RussianRoulette {
  constructor() {
    this.chambers = new Array(6).fill(false);
    this.currentChamber = 0;
    this.bulletPosition = -1;
    this.roundsSurvived = 0;
    this.totalShots = 0;
    this.gameActive = false;
    
    this.initializeElements();
    this.bindEvents();
    this.updateDisplay();
  }
  
  initializeElements() {
    this.cylinder = document.getElementById('cylinder');
    this.chambers_elements = document.querySelectorAll('.chamber');
    this.spinBtn = document.getElementById('spin-btn');
    this.triggerBtn = document.getElementById('trigger-btn');
    this.resetBtn = document.getElementById('reset-btn');
    this.gameMessage = document.getElementById('game-message');
    this.roundsSurvivedEl = document.getElementById('rounds-survived');
    this.totalShotsEl = document.getElementById('total-shots');
    this.currentChamberDisplay = document.getElementById('current-chamber-display');
    this.revolver = document.querySelector('.revolver');
  }
  
  bindEvents() {
    this.spinBtn.addEventListener('click', () => this.spinChamber());
    this.triggerBtn.addEventListener('click', () => this.pullTrigger());
    this.resetBtn.addEventListener('click', () => this.resetGame());
  }
  
  spinChamber() {
    if (this.gameActive) return;
    
    // Reset chambers
    this.chambers = new Array(6).fill(false);
    
    // Place bullet randomly
    this.bulletPosition = Math.floor(Math.random() * 6);
    this.chambers[this.bulletPosition] = true;
    
    // Random starting position
    this.currentChamber = Math.floor(Math.random() * 6);
    
    // Visual spinning effect
    this.cylinder.classList.add('spinning');
    this.spinBtn.disabled = true;
    
    // Play spinning sound effect (simulated)
    this.playSound('spin');
    
    setTimeout(() => {
      this.cylinder.classList.remove('spinning');
      this.gameActive = true;
      this.triggerBtn.disabled = false;
      this.spinBtn.disabled = true;
      
      this.updateChamberDisplay();
      this.updateMessage('Chamber loaded! Pull the trigger if you dare...', 'danger');
    }, 2000);
  }
  
  pullTrigger() {
    if (!this.gameActive) return;
    
    this.totalShots++;
    this.updateStats();
    
    // Visual feedback
    this.triggerBtn.style.transform = 'scale(0.95)';
    setTimeout(() => {
      this.triggerBtn.style.transform = '';
    }, 150);
    
    // Play click sound
    this.playSound('click');
    
    // Check if current chamber has bullet
    if (this.chambers[this.currentChamber]) {
      // Game Over - Bullet fired
      this.gameOver();
    } else {
      // Safe - Empty chamber
      this.safePull();
    }
  }
  
  safePull() {
    this.roundsSurvived++;
    this.updateStats();
    
    // Move to next chamber
    this.currentChamber = (this.currentChamber + 1) % 6;
    this.updateChamberDisplay();
    
    // Check if all chambers used
    if (this.currentChamber === this.bulletPosition) {
      this.updateMessage(`Lucky! You survived ${this.roundsSurvived} rounds. Next shot will be the bullet!`, 'danger');
    } else {
      this.updateMessage(`Click! Empty chamber. You survived ${this.roundsSurvived} rounds. Continue?`, 'success');
    }
    
    // Play safe sound
    this.playSound('safe');
  }
  
  gameOver() {
    this.gameActive = false;
    this.triggerBtn.disabled = true;
    this.spinBtn.disabled = false;
    
    // Visual feedback for game over
    this.revolver.classList.add('shake');
    this.chambers_elements[this.currentChamber].classList.add('bullet');
    
    setTimeout(() => {
      this.revolver.classList.remove('shake');
    }, 500);
    
    this.updateMessage(`BANG! Game Over! You survived ${this.roundsSurvived} rounds.`, 'danger');
    
    // Play bang sound
    this.playSound('bang');
    
    // Auto reset after 3 seconds
    setTimeout(() => {
      this.resetGame();
    }, 3000);
  }
  
  resetGame() {
    this.chambers = new Array(6).fill(false);
    this.currentChamber = 0;
    this.bulletPosition = -1;
    this.roundsSurvived = 0;
    this.totalShots = 0;
    this.gameActive = false;
    
    // Reset UI
    this.triggerBtn.disabled = true;
    this.spinBtn.disabled = false;
    this.chambers_elements.forEach(chamber => {
      chamber.classList.remove('bullet', 'current');
    });
    
    this.updateStats();
    this.updateChamberDisplay();
    this.updateMessage('Click "SPIN CHAMBER" to load a bullet and start the game!', '');
  }
  
  updateChamberDisplay() {
    // Remove current indicators
    this.chambers_elements.forEach(chamber => {
      chamber.classList.remove('current', 'bullet');
    });
    
    // Show current chamber
    if (this.gameActive) {
      this.chambers_elements[this.currentChamber].classList.add('current');
      this.currentChamberDisplay.textContent = this.currentChamber + 1;
    } else {
      this.currentChamberDisplay.textContent = '-';
    }
    
    // Show bullet position (for debugging - remove in production)
    if (this.bulletPosition >= 0) {
      // Only show bullet after game over
      if (!this.gameActive && this.chambers[this.currentChamber]) {
        this.chambers_elements[this.bulletPosition].classList.add('bullet');
      }
    }
  }
  
  updateStats() {
    this.roundsSurvivedEl.textContent = this.roundsSurvived;
    this.totalShotsEl.textContent = this.totalShots;
  }
  
  updateMessage(message, type) {
    this.gameMessage.className = 'game-message';
    if (type) {
      this.gameMessage.classList.add(type);
    }
    this.gameMessage.innerHTML = `<p>${message}</p>`;
  }
  
  updateDisplay() {
    this.updateStats();
    this.updateChamberDisplay();
  }
  
  // Simulate sound effects (in real app, use Web Audio API or audio files)
  playSound(type) {
    console.log(`Playing sound: ${type}`);
    
    // Create audio context for simple beeps (optional enhancement)
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      switch(type) {
        case 'click':
          oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
          gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.1);
          break;
        case 'spin':
          oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
          oscillator.frequency.linearRampToValueAtTime(600, audioContext.currentTime + 1);
          gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 1);
          break;
        case 'safe':
          oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
          gainNode.gain.setValueAtTime(0.08, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.2);
          break;
        case 'bang':
          oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 0.5);
          gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.5);
          break;
      }
    } catch (error) {
      console.log('Audio not supported');
    }
  }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new RussianRoulette();
});

// Add some interactive enhancements
document.addEventListener('DOMContentLoaded', () => {
  // Add keyboard support
  document.addEventListener('keydown', (e) => {
    switch(e.code) {
      case 'Space':
        e.preventDefault();
        document.getElementById('trigger-btn').click();
        break;
      case 'KeyS':
        e.preventDefault();
        document.getElementById('spin-btn').click();
        break;
      case 'KeyR':
        e.preventDefault();
        document.getElementById('reset-btn').click();
        break;
    }
  });
  
  // Add visual effects
  const createParticle = (x, y) => {
    const particle = document.createElement('div');
    particle.style.position = 'fixed';
    particle.style.left = x + 'px';
    particle.style.top = y + 'px';
    particle.style.width = '4px';
    particle.style.height = '4px';
    particle.style.backgroundColor = '#dc2626';
    particle.style.borderRadius = '50%';
    particle.style.pointerEvents = 'none';
    particle.style.zIndex = '1000';
    particle.style.animation = 'particle-fade 1s ease-out forwards';
    
    document.body.appendChild(particle);
    
    setTimeout(() => {
      document.body.removeChild(particle);
    }, 1000);
  };
  
  // Add particle animation CSS
  const style = document.createElement('style');
  style.textContent = `
    @keyframes particle-fade {
      0% {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
      100% {
        opacity: 0;
        transform: translateY(-50px) scale(0);
      }
    }
  `;
  document.head.appendChild(style);
});
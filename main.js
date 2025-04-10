// Three.js background animation
document.addEventListener("DOMContentLoaded", () => {
  // Initialize Three.js animation
  initThreeAnimation();
  
  // Animate elements on page load
  animateElements();
  
  // Mobile menu toggle
  const menuBtn = document.querySelector('.mobile-menu-btn');
  const navMenu = document.querySelector('.material-nav ul');
  
  if (menuBtn && navMenu) {
    menuBtn.addEventListener('click', () => {
      navMenu.classList.toggle('active');
    });
  }
  
  // Fetch event data
  fetchEvents();
});

// Animate elements on scroll
window.addEventListener('scroll', () => {
  animateElements();
});

function animateElements() {
  const elements = document.querySelectorAll('.animate-in');
  
  elements.forEach(element => {
    const elementTop = element.getBoundingClientRect().top;
    const windowHeight = window.innerHeight;
    const delay = element.getAttribute('data-delay') || 0;
    
    if (elementTop < windowHeight - 100) {
      setTimeout(() => {
        element.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
      }, delay);
    }
  });
}

function fetchEvents() {
  const list = document.getElementById("event-list");
  if (!list) return;
  
  // Show loading state
  list.innerHTML = `
    <div class="event-loading">
      <span class="material-symbols-outlined loading-icon">event</span>
      <p>Loading events...</p>
    </div>
  `;
  
  // Google colors for cards
  const googleColors = ["blue", "red", "yellow", "green"];
  
  fetch("data/events.json")
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      // Clear loading state
      list.innerHTML = '';
      
      // Get upcoming events
      const upcomingEvents = data.upcoming || [];
      
      if (upcomingEvents.length === 0) {
        list.innerHTML = `
          <div class="no-events">
            <p>No upcoming events at the moment.</p>
          </div>
        `;
        return;
      }
      
      // Show top 3 events only
      upcomingEvents.slice(0, 3).forEach((event, index) => {
        // Format date
        const eventDate = new Date(event.date);
        const formattedDate = eventDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        
        // Assign a Google color
        const colorClass = googleColors[index % googleColors.length];
        
        // Create event tag
        const eventType = event.type ? `<span class="event-tag">${event.type}</span>` : '';
        
        // Create card
        const card = document.createElement("div");
        card.className = `event-card ${colorClass}`;
        
        // Add image if available
        let eventImage = '';
        if (event.banner) {
          eventImage = `
            <div class="event-image">
              <img src="${event.banner}" alt="${event.title}" loading="lazy">
            </div>
          `;
        }
        
        card.innerHTML = `
          ${eventImage}
          <div class="event-content">
            <div class="event-meta">
              ${eventType}
              <div class="event-date">${formattedDate}</div>
            </div>
            <div class="event-title">${event.title}</div>
            <div class="event-location">
              <span class="material-symbols-outlined">location_on</span>
              ${event.location}
            </div>
            <a href="${event.details || '#'}" class="event-details-link">
              View Details
              <span class="material-symbols-outlined">arrow_forward</span>
            </a>
          </div>
        `;
        list.appendChild(card);
        
        // Add error handling for images
        const img = card.querySelector('img');
        if (img) {
          img.onerror = function() {
            this.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="150" viewBox="0 0 300 150"><rect fill="%23f1f3f4" width="300" height="150"/><text fill="%235f6368" font-family="sans-serif" font-size="14" dy=".3em" text-anchor="middle" x="150" y="75">Event image</text></svg>';
            this.classList.add('broken-image');
          };
        }
      });
    })
    .catch(error => {
      console.error('Error fetching events:', error);
      list.innerHTML = `
        <div class="error-message">
          <span class="material-symbols-outlined" style="color: var(--google-red); font-size: 2rem;">error</span>
          <p>Failed to load events. Please try again later.</p>
        </div>
      `;
    });
}

function initThreeAnimation() {
  const container = document.getElementById('animation-container');
  if (!container) return;
  
  // Set up scene
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ alpha: true });
  
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);
  
  // Create particles
  const particlesGeometry = new THREE.BufferGeometry();
  const particlesCount = 1000;
  
  // Create positions for particles (xyz coordinates)
  const positions = new Float32Array(particlesCount * 3);
  const colors = new Float32Array(particlesCount * 3);
  
  // Google colors
  const googleColors = [
    {r: 66/255, g: 133/255, b: 244/255},   // Blue
    {r: 234/255, g: 67/255, b: 53/255},    // Red
    {r: 251/255, g: 188/255, b: 5/255},    // Yellow
    {r: 52/255, g: 168/255, b: 83/255}     // Green
  ];
  
  // Assign random positions and colors
  for (let i = 0; i < particlesCount * 3; i += 3) {
    // Position
    positions[i] = (Math.random() - 0.5) * 10;      // x
    positions[i+1] = (Math.random() - 0.5) * 10;    // y
    positions[i+2] = (Math.random() - 0.5) * 10;    // z
    
    // Color - pick a random Google color
    const colorIndex = Math.floor(Math.random() * googleColors.length);
    const color = googleColors[colorIndex];
    colors[i] = color.r;
    colors[i+1] = color.g;
    colors[i+2] = color.b;
  }
  
  particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  
  // Material
  const particlesMaterial = new THREE.PointsMaterial({
    size: 0.02,
    transparent: true,
    opacity: 0.8,
    vertexColors: true,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true
  });
  
  // Create particles mesh
  const particles = new THREE.Points(particlesGeometry, particlesMaterial);
  scene.add(particles);
  
  // Add connecting lines - creating a network effect
  const linesMaterial = new THREE.LineBasicMaterial({
    color: 0x4285f4,
    transparent: true,
    opacity: 0.2,
  });
  
  // Create a network of lines
  const linesGeometry = new THREE.BufferGeometry();
  const linePositions = [];
  
  // Connect particles that are near each other
  for (let i = 0; i < particlesCount; i++) {
    for (let j = i + 1; j < particlesCount; j++) {
      const distance = Math.sqrt(
        Math.pow(positions[i*3] - positions[j*3], 2) + 
        Math.pow(positions[i*3+1] - positions[j*3+1], 2) + 
        Math.pow(positions[i*3+2] - positions[j*3+2], 2)
      );
      
      if (distance < 1) {
        linePositions.push(
          positions[i*3], positions[i*3+1], positions[i*3+2],
          positions[j*3], positions[j*3+1], positions[j*3+2]
        );
      }
    }
  }
  
  linesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
  const lines = new THREE.LineSegments(linesGeometry, linesMaterial);
  scene.add(lines);
  
  // Position camera
  camera.position.z = 5;
  
  // Animation loop
  function animate() {
    requestAnimationFrame(animate);
    
    // Rotate particles
    particles.rotation.x += 0.0005;
    particles.rotation.y += 0.001;
    lines.rotation.x += 0.0005;
    lines.rotation.y += 0.001;
    
    // Mouse movement effect
    const mouseX = (window.mouseX || 0) - window.innerWidth / 2;
    const mouseY = (window.mouseY || 0) - window.innerHeight / 2;
    particles.rotation.y += mouseX * 0.0000005;
    particles.rotation.x += mouseY * 0.0000005;
    
    renderer.render(scene, camera);
  }
  
  // Track mouse movement
  window.addEventListener('mousemove', (event) => {
    window.mouseX = event.clientX;
    window.mouseY = event.clientY;
  });
  
  // Handle window resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
  
  animate();
}
document.addEventListener("DOMContentLoaded", () => {
  // Mobile menu toggle
  const menuBtn = document.querySelector('.mobile-menu-btn');
  const navMenu = document.querySelector('.material-nav ul');
  
  if (menuBtn && navMenu) {
    menuBtn.addEventListener('click', () => {
      navMenu.classList.toggle('active');
    });
  }
  
  // Initialize gallery
  initializeGallery();
});

function initializeGallery() {
  const gallery = document.getElementById('photo-gallery');
  const lightbox = document.getElementById('lightbox');
  const lightboxImage = document.getElementById('lightbox-image');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const filterButtons = document.querySelectorAll('.filter-btn');
  
  let photos = [];
  let currentPhotoIndex = 0;
  
  // Fetch photos
  fetch("../data/photos.json")
    .then(res => res.json())
    .then(data => {
      photos = data.photos || [];
      
      // Remove loading placeholder
      const loadingElement = gallery.querySelector('.gallery-loading');
      if (loadingElement) {
        loadingElement.remove();
      }
      
      // Render photos
      renderGallery(photos);
      
      // Initialize lightbox functionality
      initLightbox();
      
      // Initialize filter functionality
      initFilters();
    })
    .catch(err => {
      console.error("Failed to load photo gallery:", err);
      const loadingElement = gallery.querySelector('.gallery-loading');
      if (loadingElement) {
        loadingElement.innerHTML = `
          <span class="material-symbols-outlined" style="font-size: 3rem; color: #ea4335;">error</span>
          <p>Failed to load images. Please try again later.</p>
        `;
      }
    });
  
  function renderGallery(photosToRender) {
    // Clear gallery
    gallery.innerHTML = '';
    
    if (photosToRender.length === 0) {
      gallery.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 1rem;">
          <span class="material-symbols-outlined" style="font-size: 3rem; color: var(--text-secondary);">
            photo_library_off
          </span>
          <p style="margin-top: 1rem; color: var(--text-secondary);">No photos found</p>
        </div>
      `;
      return;
    }
    
    // Google colors for variety
    const googleColors = ["blue", "red", "yellow", "green"];
    
    // Add images to gallery
    photosToRender.forEach((photo, index) => {
      const photoCard = document.createElement('div');
      photoCard.className = 'gallery-item';
      photoCard.dataset.category = photo.category || 'events';
      photoCard.style.animationDelay = `${index * 50}ms`;
      
      // Create image with proper error handling
      const img = document.createElement('img');
      img.src = photo.url;
      img.alt = photo.caption || 'Event photo';
      img.loading = 'lazy';
      img.dataset.index = index;
      
      // Add error handling
      img.onerror = function() {
        this.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect fill="%23f1f3f4" width="300" height="200"/><text fill="%235f6368" font-family="sans-serif" font-size="16" dy=".3em" text-anchor="middle" x="150" y="100">Image not available</text></svg>';
        this.classList.add('broken-image');
      };
      
      // Create caption
      let captionHTML = '';
      if (photo.caption) {
        captionHTML = `<div class="gallery-caption">${photo.caption}</div>`;
      }
      
      // Create event tag if category exists
      let tagHTML = '';
      if (photo.category) {
        const categoryName = photo.category.charAt(0).toUpperCase() + photo.category.slice(1);
        tagHTML = `<div class="gallery-event-tag">${categoryName}</div>`;
      }
      
      photoCard.appendChild(img);
      photoCard.innerHTML += captionHTML + tagHTML;
      gallery.appendChild(photoCard);
      
      // Add click event to open lightbox
      photoCard.addEventListener('click', () => {
        openLightbox(index);
      });
    });
  }
  
  function initLightbox() {
    // Lightbox controls
    const closeBtn = lightbox.querySelector('.lightbox-close');
    const prevBtn = lightbox.querySelector('.lightbox-nav.prev');
    const nextBtn = lightbox.querySelector('.lightbox-nav.next');
    
    closeBtn.addEventListener('click', closeLightbox);
    prevBtn.addEventListener('click', showPreviousPhoto);
    nextBtn.addEventListener('click', showNextPhoto);
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('active')) return;
      
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') showNextPhoto();
      if (e.key === 'ArrowLeft') showPreviousPhoto();
    });
    
    // Close lightbox when clicking outside the image
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) {
        closeLightbox();
      }
    });
  }
  
  function openLightbox(index) {
    currentPhotoIndex = index;
    const photo = photos[index];
    
    lightboxImage.src = photo.url;
    lightboxCaption.textContent = photo.caption || '';
    
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent scrolling
  }
  
  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = 'auto'; // Restore scrolling
  }
  
  function showNextPhoto() {
    currentPhotoIndex = (currentPhotoIndex + 1) % photos.length;
    updateLightboxContent();
  }
  
  function showPreviousPhoto() {
    currentPhotoIndex = (currentPhotoIndex - 1 + photos.length) % photos.length;
    updateLightboxContent();
  }
  
  function updateLightboxContent() {
    const photo = photos[currentPhotoIndex];
    lightboxImage.src = photo.url;
    lightboxCaption.textContent = photo.caption || '';
  }
  
  function initFilters() {
    // Add filter functionality
    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        // Update active state
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const filter = btn.dataset.filter;
        
        if (filter === 'all') {
          renderGallery(photos);
        } else {
          const filteredPhotos = photos.filter(photo => photo.category === filter);
          renderGallery(filteredPhotos);
        }
      });
    });
  }
}
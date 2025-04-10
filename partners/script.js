document.addEventListener("DOMContentLoaded", () => {
  // Mobile menu toggle
  const menuBtn = document.querySelector('.mobile-menu-btn');
  const navMenu = document.querySelector('.material-nav ul');
  
  if (menuBtn && navMenu) {
    menuBtn.addEventListener('click', () => {
      navMenu.classList.toggle('active');
    });
  }
  
  // Load partners
  loadPartners();
});

function loadPartners() {
  const container = document.getElementById("partners-container");
  
  // Create a placeholder while loading
  const loadingPlaceholder = document.querySelector('.partners-grid-placeholder');
  
  fetch("../data/partners.json")
    .then(res => res.json())
    .then(data => {
      // Clear loading placeholder
      if (loadingPlaceholder) {
        loadingPlaceholder.remove();
      }
      
      // Google colors for the card accent
      const googleColors = ["blue", "red", "yellow", "green"];
      
      // Process each partner
      data.partners.forEach((partner, index) => {
        // Assign a Google color to each card
        const colorClass = googleColors[index % googleColors.length];
        
        // Determine category class if available
        let categoryHtml = '';
        if (partner.category) {
          const categoryClass = `category-${partner.category.toLowerCase()}`;
          categoryHtml = `<span class="partner-category ${categoryClass}">${partner.category}</span>`;
        }
        
        // Create description if available
        let descriptionHtml = '';
        if (partner.description) {
          descriptionHtml = `<div class="partner-description">${partner.description}</div>`;
        }
        
        const card = document.createElement("div");
        card.className = `partner-card ${colorClass}`;
        card.style.animationDelay = `${index * 75}ms`;
        
        card.innerHTML = `
          ${categoryHtml}
          <div class="logo-container">
            <img src="${partner.logo}" alt="${partner.name} logo" loading="lazy" />
          </div>
          <div class="partner-info">
            <div class="partner-name">${partner.name}</div>
            ${descriptionHtml}
            ${partner.website ? `
              <a href="${partner.website}" class="partner-link" target="_blank">
                Visit Website
                <span class="material-symbols-outlined">open_in_new</span>
              </a>` : ""}
          </div>
        `;
        
        // Add error handling for images
        const img = card.querySelector('img');
        img.onerror = function() {
          this.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="100" viewBox="0 0 200 100"><rect fill="%23f1f3f4" width="200" height="100"/><text fill="%235f6368" font-family="sans-serif" font-size="14" dy=".3em" text-anchor="middle" x="100" y="50">Logo Not Available</text></svg>';
          this.classList.add('broken-image');
        };
        
        container.appendChild(card);
      });
    })
    .catch(err => {
      console.error("Failed to load partners:", err);
      
      if (loadingPlaceholder) {
        loadingPlaceholder.innerHTML = `
          <div style="text-align: center;">
            <span class="material-symbols-outlined" style="font-size: 3rem; color: #ea4335;">error</span>
            <p style="margin-top: 1rem;">Failed to load partner data. Please try again later.</p>
          </div>
        `;
      }
    });
}
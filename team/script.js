document.addEventListener("DOMContentLoaded", () => {
  // Mobile menu toggle
  const menuBtn = document.querySelector('.mobile-menu-btn');
  const navMenu = document.querySelector('.material-nav ul');
  
  if (menuBtn && navMenu) {
    menuBtn.addEventListener('click', () => {
      navMenu.classList.toggle('active');
    });
  }
  
  // Load team members
  loadTeamMembers();
});

function loadTeamMembers() {
  const container = document.getElementById("team-container");
  
  // Create a placeholder while loading
  const loadingPlaceholder = document.querySelector('.team-grid-placeholder');
  
  fetch("../data/team.json")
    .then(res => res.json())
    .then(data => {
      // Clear loading placeholder
      if (loadingPlaceholder) {
        loadingPlaceholder.remove();
      }
      
      // Google colors for the card accent
      const googleColors = ["blue", "red", "yellow", "green"];
      
      // Process each team member
      data.members.forEach((member, index) => {
        // Assign a Google color to each card
        const colorClass = googleColors[index % googleColors.length];
        
        // Get role from team field if role is not present
        const role = member.team || "Member";
        
        // Determine role tag class based on team field
        let tagClass = "tag-volunteer";
        if (role.includes("Organizer") || role.includes("Lead") || role.includes("Coordinator")) {
          tagClass = "tag-lead";
        } else if (role.includes("Core")) {
          tagClass = "tag-core";
        } else if (role.includes("Advisor") || role.includes("Faculty")) {
          tagClass = "tag-advisor";
        }
        
        // Create social media links if available
        let socialLinks = '';
        if (member.social) {
          socialLinks = '<div class="member-social">';
          
          if (member.social.linkedin) {
            socialLinks += `<a href="${member.social.linkedin}" class="social-btn" target="_blank" title="LinkedIn">
              <span class="material-symbols-outlined">link</span>
            </a>`;
          }
          
          if (member.social.github) {
            socialLinks += `<a href="${member.social.github}" class="social-btn" target="_blank" title="GitHub">
              <span class="material-symbols-outlined">code</span>
            </a>`;
          }
          
          if (member.social.twitter) {
            socialLinks += `<a href="${member.social.twitter}" class="social-btn" target="_blank" title="Twitter">
              <span class="material-symbols-outlined">chat</span>
            </a>`;
          }
          
          socialLinks += '</div>';
        }
        
        const card = document.createElement("div");
        card.className = `member-card ${colorClass}`;
        card.style.animationDelay = `${index * 75}ms`;
        
        card.innerHTML = `
          <div class="member-photo-container">
            <img src="${member.photo}" alt="${member.name}" loading="lazy" />
          </div>
          <div class="member-info">
            <div class="member-name">${member.name}</div>
            <div class="member-role">${role}</div>
          </div>
        `;
        
        // Add error handling for images
        const img = card.querySelector('img');
        img.onerror = function() {
          this.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect fill="%23f1f3f4" width="100" height="100"/><text fill="%235f6368" font-family="sans-serif" font-size="14" dy=".3em" text-anchor="middle" x="50" y="50">No Photo</text></svg>';
          this.classList.add('broken-image');
        };
        
        container.appendChild(card);
      });
    })
    .catch(err => {
      console.error("Failed to load team data:", err);
      
      if (loadingPlaceholder) {
        loadingPlaceholder.innerHTML = `
          <div style="text-align: center;">
            <span class="material-symbols-outlined" style="font-size: 3rem; color: #ea4335;">error</span>
            <p style="margin-top: 1rem;">Failed to load team data. Please try again later.</p>
          </div>
        `;
      }
    });
}
document.addEventListener("DOMContentLoaded", () => {
  // Mobile menu toggle
  const menuBtn = document.querySelector('.mobile-menu-btn');
  const navMenu = document.querySelector('.material-nav ul');
  
  if (menuBtn && navMenu) {
    menuBtn.addEventListener('click', () => {
      navMenu.classList.toggle('active');
    });
  }
  
  // Animate elements on page load
  animateElements();

  // Load events
  loadEvents();
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

function loadEvents() {
  const upcomingContainer = document.getElementById("upcoming-events-container");
  const pastContainer = document.getElementById("past-events-container");
  
  fetch("../data/events.json")
    .then((response) => response.json())
    .then((data) => {
      // Clear loading placeholders
      upcomingContainer.innerHTML = '';
      pastContainer.innerHTML = '';
      
      // Current date for determining registration status
      const currentDate = new Date("2025-04-10");
      
      if (data.upcoming && data.upcoming.length > 0) {
        data.upcoming.forEach((event, index) => {
          const eventCard = createEventCard(event, index, true, currentDate);
          upcomingContainer.appendChild(eventCard);
        });
      } else {
        upcomingContainer.innerHTML = createEmptyState("No upcoming events scheduled at the moment.", "calendar_month");
      }

      if (data.past && data.past.length > 0) {
        data.past.forEach((event, index) => {
          const eventCard = createEventCard(event, index, false, currentDate);
          pastContainer.appendChild(eventCard);
        });
      } else {
        pastContainer.innerHTML = createEmptyState("No past events to display.", "history");
      }
    })
    .catch(error => {
      console.error("Failed to fetch events:", error);
      upcomingContainer.innerHTML = createErrorState("Failed to load upcoming events.");
      pastContainer.innerHTML = createErrorState("Failed to load past events.");
    });
}

function createEventCard(event, index, isUpcoming, currentDate) {
  // Event colors based on type
  const eventTypes = {
    workshop: { tag: "tag-workshop", icon: "code" },
    "tech talk": { tag: "tag-tech-talk", icon: "record_voice_over" },
    hackathon: { tag: "tag-hackathon", icon: "timer" },
    social: { tag: "tag-social", icon: "groups" },
  };

  // Determine event type and corresponding tag class
  const eventType = event.type ? event.type.toLowerCase() : "workshop";
  const typeInfo = eventTypes[eventType] || { tag: "tag-workshop", icon: "code" };

  // Create tags HTML if event has tags
  const tagsHtml = event.tags ? createTagsHtml(event.tags) : '';

  // Event location info
  const locationInfo = event.location ? `
    <div class="event-detail">
      <span class="material-symbols-outlined">location_on</span>
      <span>${event.location}</span>
    </div>
  ` : '';

  // Create default banner if not provided
  const bannerImage = event.banner || getDefaultBanner(eventType);

  // Check if event date is in the future and if registration is available
  const eventDate = new Date(event.date);
  const isRegistrationOpen = isUpcoming && eventDate > currentDate;
  
  // Handle registration and details links
  const registerLink = event.register || '#';
  const detailsLink = event.details || '#';

  // Create actions based on event status
  let actionsHtml = '';
  if (isRegistrationOpen && event.register) {
    // For upcoming events with registration links
    actionsHtml = `
      <div class="event-actions">
        <a href="${registerLink}" class="event-btn btn-register" target="_blank">
          <span>Register</span>
          <span class="material-symbols-outlined">how_to_reg</span>
        </a>
        <a href="${detailsLink}" class="event-btn btn-details" target="_blank">
          <span>Details</span>
          <span class="material-symbols-outlined">info</span>
        </a>
      </div>
    `;
  } else if (isUpcoming) {
    // For upcoming events without registration links
    actionsHtml = `
      <div class="event-actions">
        <a href="${detailsLink}" class="event-btn btn-register" target="_blank">
          <span>Remind me</span>
          <span class="material-symbols-outlined">notifications</span>
        </a>
      </div>
    `;
  } else {
    // For past events
    actionsHtml = `
      <div class="event-actions">
        <a href="${detailsLink}" class="event-btn btn-details" target="_blank">
          <span>View Details</span>
          <span class="material-symbols-outlined">visibility</span>
        </a>
      </div>
    `;
  }

  // Create card element
  const card = document.createElement("div");
  card.className = "event-card";
  card.style.animationDelay = `${index * 100}ms`;

  card.innerHTML = `
    <div class="event-banner">
      <img src="${bannerImage}" alt="${event.title}" loading="lazy">
      <div class="event-date-badge">
        <span class="material-symbols-outlined">${isUpcoming ? 'event_upcoming' : 'event_busy'}</span>
        ${formatDate(event.date)}
      </div>
    </div>
    <div class="event-content">
      <div class="event-title">${event.title}</div>
      <div class="event-description">${event.description}</div>
      
      ${tagsHtml}
      
      <div class="event-meta">
        <div class="event-details">
          <div class="event-detail">
            <span class="material-symbols-outlined">${typeInfo.icon}</span>
            <span>${capitalizeFirstLetter(eventType)}</span>
          </div>
          ${locationInfo}
        </div>
        
        ${actionsHtml}
      </div>
    </div>
  `;

  // Add error handling for images
  const img = card.querySelector('img');
  img.onerror = function() {
    this.src = getDefaultBanner(eventType);
    this.classList.add('broken-image');
  };

  return card;
}

function createTagsHtml(tags) {
  if (!tags || !Array.isArray(tags) || tags.length === 0) return '';
  
  const tagClassMap = {
    'android': 'tag-workshop',
    'web': 'tag-workshop',
    'cloud': 'tag-tech-talk', 
    'firebase': 'tag-tech-talk',
    'flutter': 'tag-hackathon',
    'kotlin': 'tag-workshop',
    'ml': 'tag-tech-talk',
    'networking': 'tag-social',
    'open source': 'tag-tech-talk',
    'gsoc': 'tag-tech-talk',
    'hackathon': 'tag-hackathon',
    'innovation': 'tag-hackathon',
    'coding': 'tag-workshop',
    'mobile': 'tag-workshop',
    'solutions challenge': 'tag-tech-talk',
    'sdgs': 'tag-tech-talk',
    'html': 'tag-workshop',
    'javascript': 'tag-workshop'
  };
  
  const tagElements = tags.map(tag => {
    const lowerTag = tag.toLowerCase();
    const tagClass = tagClassMap[lowerTag] || 'tag-workshop';
    return `<span class="event-tag ${tagClass}">${tag}</span>`;
  }).join('');
  
  return `<div class="event-tags">${tagElements}</div>`;
}

function createEmptyState(message, icon = "event_busy") {
  return `
    <div class="events-empty">
      <span class="material-symbols-outlined">${icon}</span>
      <p>${message}</p>
    </div>
  `;
}

function createErrorState(message) {
  return `
    <div class="events-empty">
      <span class="material-symbols-outlined">error</span>
      <p>${message}</p>
      <button class="event-btn btn-register" onclick="loadEvents()">
        <span>Try Again</span>
        <span class="material-symbols-outlined">refresh</span>
      </button>
    </div>
  `;
}

function formatDate(dateString) {
  const options = { month: 'short', day: 'numeric', year: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function getDefaultBanner(eventType) {
  const banners = {
    workshop: "https://developers.google.com/static/community/gdg/images/gdg-share-template.jpg",
    "tech talk": "https://developers.google.com/static/community/gdg/images/gdg-event-image.jpg",
    hackathon: "https://developers.google.com/static/community/images/io-extended-2023-social.jpg",
    social: "https://developers.google.com/static/community/gdg/images/password-header.svg"
  };
  return banners[eventType] || banners.workshop;
}
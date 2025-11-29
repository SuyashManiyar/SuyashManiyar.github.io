// Portfolio Interactive Features
// Author: Suyash Maniyar

// ===== Utility Functions =====
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// ===== Initialize on DOM Load =====
document.addEventListener('DOMContentLoaded', function() {
  initNavigation();
  initProjectCards();
  initFilters();
  initScrollAnimations();
  initSkillsSection();
  initAccessibility();
});

// ===== Navigation Functionality =====
function initNavigation() {
  const navLinks = document.querySelectorAll('.nav-link');
  const backToTopBtn = document.getElementById('back-to-top');
  const sections = document.querySelectorAll('section[id]');

  // Smooth scroll navigation
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href').substring(1);
      const targetSection = document.getElementById(targetId);
      
      if (targetSection) {
        // Check for smooth scroll support
        if ('scrollBehavior' in document.documentElement.style) {
          targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          // Fallback for browsers without smooth scroll
          targetSection.scrollIntoView();
        }
      }
    });
  });

  // Active section highlighting and back-to-top button
  const handleScroll = debounce(function() {
    const scrollPosition = window.scrollY + 100;

    // Update active navigation link
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');

      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });
      }
    });

    // Show/hide back-to-top button
    if (window.scrollY > 300) {
      backToTopBtn.classList.remove('hidden');
    } else {
      backToTopBtn.classList.add('hidden');
    }
  }, 100);

  window.addEventListener('scroll', handleScroll);

  // Back to top button functionality
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', function() {
      if ('scrollBehavior' in document.documentElement.style) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        window.scrollTo(0, 0);
      }
    });
  }

  // Initial call to set active state
  handleScroll();
}

// ===== Project Card Expansion =====
function initProjectCards() {
  const projectCards = document.querySelectorAll('.project-card');

  projectCards.forEach(card => {
    const expandBtn = card.querySelector('.expand-btn');
    const details = card.querySelector('.project-details');

    if (expandBtn && details) {
      expandBtn.addEventListener('click', function() {
        const isExpanded = details.classList.contains('expanded');

        if (isExpanded) {
          // Collapse
          details.classList.remove('expanded');
          details.classList.add('hidden');
          expandBtn.textContent = 'Read More';
        } else {
          // Expand
          details.classList.remove('hidden');
          details.classList.add('expanded');
          expandBtn.textContent = 'Show Less';
        }
      });
    }
  });
}

// ===== Project Filtering System =====
function initFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const filterValue = this.getAttribute('data-filter');

      // Update active button
      filterBtns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');

      // Filter projects with animation
      projectCards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');

        if (filterValue === 'all' || cardCategory === filterValue) {
          // Show card
          card.classList.remove('filtered-out');
          setTimeout(() => {
            card.style.display = 'block';
          }, 10);
        } else {
          // Hide card
          card.classList.add('filtered-out');
          setTimeout(() => {
            if (card.classList.contains('filtered-out')) {
              card.style.display = 'none';
            }
          }, 400);
        }
      });
    });
  });
}

// ===== Scroll Animations =====
function initScrollAnimations() {
  const animatedElements = document.querySelectorAll('.animate-on-scroll');

  // Check for Intersection Observer support
  if ('IntersectionObserver' in window) {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };

    const observer = new IntersectionObserver(function(entries) {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animated');
          // Optionally unobserve after animation
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    animatedElements.forEach(element => {
      observer.observe(element);
    });
  } else {
    // Fallback: show all elements immediately
    animatedElements.forEach(element => {
      element.classList.add('animated');
    });
  }
}

// ===== Skills Section Interactivity =====
function initSkillsSection() {
  const skillCategories = document.querySelectorAll('.skill-category');

  skillCategories.forEach(category => {
    const toggle = category.querySelector('.category-toggle');
    
    if (toggle) {
      toggle.addEventListener('click', function() {
        category.classList.toggle('collapsed');
        
        // Update toggle icon
        const icon = toggle.querySelector('.toggle-icon');
        if (icon) {
          icon.textContent = category.classList.contains('collapsed') ? '▶' : '▼';
        }
      });
    }
  });
}

// ===== Accessibility Features =====
function initAccessibility() {
  // Add keyboard navigation support for interactive elements
  const interactiveElements = document.querySelectorAll('.expand-btn, .filter-btn, .category-toggle');

  interactiveElements.forEach(element => {
    element.addEventListener('keydown', function(e) {
      // Trigger click on Enter or Space
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.click();
      }
    });

    // Make elements keyboard focusable
    if (!element.hasAttribute('tabindex')) {
      element.setAttribute('tabindex', '0');
    }
  });

  // Add skip to content link
  const skipLink = document.createElement('a');
  skipLink.href = '#about';
  skipLink.className = 'skip-to-content';
  skipLink.textContent = 'Skip to content';
  document.body.insertBefore(skipLink, document.body.firstChild);
}

// ===== Performance Monitoring (Optional) =====
if (window.performance && window.performance.timing) {
  window.addEventListener('load', function() {
    const loadTime = window.performance.timing.domContentLoadedEventEnd - 
                     window.performance.timing.navigationStart;
    console.log('Page load time:', loadTime + 'ms');
  });
}

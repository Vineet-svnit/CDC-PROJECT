// --- Sidebar and View Switching Logic ---
document.addEventListener('DOMContentLoaded', () => {
  const sidebar = document.getElementById('adminSidebar');
  const sidebarToggle = document.getElementById('sidebarToggle');
  const navLinks = document.querySelectorAll('#adminSidebar .nav-link');
  const viewSections = document.querySelectorAll('.dashboard-view-section');

  // Sidebar Toggle
  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', () => {
      sidebar.classList.toggle('collapsed');
      // For mobile
      if (window.innerWidth <= 768) {
        sidebar.classList.toggle('show');
      }
    });
  }

  // View Switching
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      const targetViewId = link.getAttribute('data-view');
      if (!targetViewId) return;

      if (viewSections.length > 0) {
        // We are on the dashboard where views exist
        // Update Active Link
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');

        // Update Active Section
        viewSections.forEach(section => {
          section.classList.remove('active');
          if (section.id === targetViewId) {
            section.classList.add('active');
          }
        });

        // Close sidebar on mobile after selection
        if (window.innerWidth <= 768 && sidebar) {
          sidebar.classList.remove('show');
        }
      } else {
        // We are on a different page (e.g., test creation), navigate to dashboard
        window.location.href = `/dashboard?view=${targetViewId}`;
      }
    });
  });

  // If on dashboard, check URL parameters for 'view' to open a specific section
  if (viewSections.length > 0) {
    const urlParams = new URLSearchParams(window.location.search);
    const view = urlParams.get('view');
    if (view) {
      const targetLink = Array.from(navLinks).find(l => l.getAttribute('data-view') === view);
      if (targetLink) {
        targetLink.click();
      }
    }
  }
});

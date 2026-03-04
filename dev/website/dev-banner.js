// dev/website/dev-banner.js
// Injects the admin banner and navbar link on ANY page when admin is signed in.
// Add to every page with: <script src="dev-banner.js"></script>
// This uses vanilla JS with no imports, so it works even without module support.

(function() {
  const role = localStorage.getItem('dev_auth_role');
  if (role !== 'admin') return;

  // ── Amber admin top banner ────────────────────────────────────────
  const banner = document.createElement('div');
  banner.id = 'devAdminBanner';
  banner.style.cssText = [
    'position:fixed', 'top:0', 'left:0', 'right:0', 'z-index:9999',
    'background:#92400e', 'color:#fef3c7',
    'text-align:center', 'padding:7px 16px',
    'font-size:0.78rem', 'font-weight:700', 'letter-spacing:0.04em',
    'display:flex', 'align-items:center', 'justify-content:center', 'gap:16px'
  ].join(';');
  banner.innerHTML = `
    <span>⚙️ ADMIN VIEW — <strong>admin@taxsaver.dev</strong></span>
    <a href="admin.html" style="color:#fde68a;text-decoration:underline;font-weight:800;">↗ Admin Panel</a>
    <span style="color:rgba(254,243,199,0.4)">|</span>
    <a href="login.html" style="color:#fde68a;text-decoration:underline;" onclick="localStorage.removeItem('dev_auth_role')">Switch User</a>
  `;
  document.body.prepend(banner);

  // ── Push content down to avoid banner overlap ─────────────────────
  // Wait for DOM so navbar/body are ready
  document.addEventListener('DOMContentLoaded', function() {
    const nav = document.querySelector('.navbar');
    if (nav) nav.style.top = '35px';
    document.body.style.paddingTop = '35px';
  });

  // ── Inject "Admin" link into navbar ──────────────────────────────
  document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelector('.navbar-links');
    if (navLinks && !document.getElementById('navAdminInjected')) {
      const li = document.createElement('li');
      li.id = 'navAdminInjected';
      li.innerHTML = `<a href="admin.html" style="color:#f59e0b;font-weight:800;">⚙️ Admin</a>`;
      navLinks.appendChild(li);
    }
  });
})();

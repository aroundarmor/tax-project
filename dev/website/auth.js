// dev/website/auth.js
// MOCK auth.js — supports both regular and admin test users.
// On admin sign-in, automatically redirects to admin.html after auth.

import { auth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from './firebase.js';

const API_BASE = 'http://localhost:3001';

export async function signInWithGoogle(role) {
  const provider = new GoogleAuthProvider();
  if (role) localStorage.setItem('dev_signin_role', role);
  const result = await signInWithPopup(auth, provider, role);
  return result.user;
}

export async function signOutUser() {
  await signOut(auth);
}

export async function getIdToken() {
  const user = auth.currentUser;
  if (!user) throw new Error('Not signed in');
  return user.getIdToken();
}

export async function getPremiumStatus() {
  try {
    const token = await getIdToken();
    const res = await fetch(`${API_BASE}/api/user/status`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return { isPremium: false, isAdmin: false };
    return await res.json();
  } catch {
    return { isPremium: false, isAdmin: false };
  }
}

// Update navbar across all pages
function updateNavbar(user, isPremium, isAdmin) {
  const authBtn   = document.getElementById('navAuthBtn');
  const navAvatar = document.getElementById('navAvatar');
  const premBadge = document.getElementById('navPremiumBadge');
  const adminLink = document.getElementById('navAdminLink');

  if (!user) {
    if (authBtn)   { authBtn.textContent = 'Sign In'; authBtn.href = 'login.html'; authBtn.onclick = null; }
    if (navAvatar) navAvatar.style.display = 'none';
    if (premBadge) premBadge.style.display = 'none';
    if (adminLink) adminLink.style.display = 'none';
  } else {
    if (authBtn) {
      authBtn.textContent = 'Sign Out';
      authBtn.href = '#';
      authBtn.onclick = (e) => { e.preventDefault(); signOutUser(); };
    }
    if (navAvatar) {
      navAvatar.style.display = 'flex';
      navAvatar.title = user.email;
      const img = navAvatar.querySelector('img');
      if (img && user.photoURL) { img.src = user.photoURL; img.style.display = 'block'; }
      const initials = navAvatar.querySelector('.initials');
      if (initials) initials.textContent = (user.displayName||user.email).split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2);
    }
    if (premBadge) premBadge.style.display = (isPremium && !isAdmin) ? 'inline-flex' : 'none';

    // Admin badge & link
    if (adminLink) {
      adminLink.style.display = isAdmin ? 'inline-flex' : 'none';
    } else if (isAdmin) {
      // Inject admin link into navbar if element doesn't exist yet
      const navLinks = document.querySelector('.navbar-links');
      if (navLinks && !document.getElementById('navAdminLink')) {
        const li = document.createElement('li');
        li.innerHTML = `<a href="admin.html" id="navAdminLink" style="color:#f59e0b; font-weight:700;">⚙️ Admin</a>`;
        navLinks.appendChild(li);
      }
    }

    // Admin banner at top of page
    if (isAdmin && !document.getElementById('adminTopBanner')) {
      const banner = document.createElement('div');
      banner.id = 'adminTopBanner';
      banner.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:9999;background:#92400e;color:#fef3c7;text-align:center;padding:6px;font-size:0.78rem;font-weight:700;letter-spacing:0.05em;';
      banner.innerHTML = '⚙️ You are viewing as ADMIN — <a href="admin.html" style="color:#fde68a;text-decoration:underline;">Open Admin Panel</a> · <a href="login.html" style="color:#fde68a;text-decoration:underline;">Switch user</a>';
      document.body.prepend(banner);
      // Push navbar down to avoid overlap
      const nav = document.querySelector('.navbar');
      if (nav) nav.style.top = '32px';
    }
  }
}

export function initAuthState({ onSignedIn, onSignedOut, requireAuth = false, requirePremium = false, requireAdmin = false } = {}) {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const status = await getPremiumStatus();
      const isPremium = status.isPremium === true;
      const isAdmin   = status.isAdmin === true;
      updateNavbar(user, isPremium, isAdmin);

      if (requireAdmin && !isAdmin) {
        window.location.href = 'index.html';
        return;
      }
      if (requirePremium && !isPremium && !isAdmin) {
        window.location.href = `pricing.html?reason=premium_required`;
        return;
      }
      if (onSignedIn) onSignedIn(user, isPremium, isAdmin);
    } else {
      updateNavbar(null, false, false);
      if (requireAuth) {
        const returnTo = encodeURIComponent(window.location.pathname + window.location.search);
        window.location.href = `login.html?returnTo=${returnTo}`;
        return;
      }
      if (onSignedOut) onSignedOut();
    }
  });
}

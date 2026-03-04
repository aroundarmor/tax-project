// new-website/auth.js
// Shared client-side auth helpers used across all pages.
// Handles: auth state listener, navbar UI updates, sign-out, ID token fetching.

import { auth } from './firebase.js';
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from 'https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js';

const API_BASE = 'http://localhost:3001'; // Change to your production server URL

// ── Sign in with Google popup ─────────────────────────────────────────
export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  provider.addScope('email');
  provider.addScope('profile');
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (err) {
    if (err.code === 'auth/popup-closed-by-user') return null;
    console.error('[Auth] Google sign-in error:', err);
    throw err;
  }
}

// ── Sign out ──────────────────────────────────────────────────────────
export async function signOutUser() {
  await signOut(auth);
}

// ── Get fresh Firebase ID token (for API requests) ────────────────────
export async function getIdToken() {
  const user = auth.currentUser;
  if (!user) throw new Error('Not signed in');
  return user.getIdToken(/* forceRefresh */ true);
}

// ── Get current user's premium status from backend ───────────────────
export async function getPremiumStatus() {
  try {
    const token = await getIdToken();
    const res = await fetch(`${API_BASE}/api/user/status`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return { isPremium: false };
    return await res.json();
  } catch {
    return { isPremium: false };
  }
}

// ── Update all navbar elements across pages ───────────────────────────
function updateNavbar(user, isPremium) {
  // Auth button in navbar (expects element id="navAuthBtn")
  const authBtn = document.getElementById('navAuthBtn');
  const navAvatar = document.getElementById('navAvatar');
  const premiumBadge = document.getElementById('navPremiumBadge');

  if (!user) {
    if (authBtn) { authBtn.textContent = 'Sign In'; authBtn.href = 'login.html'; }
    if (navAvatar) navAvatar.style.display = 'none';
    if (premiumBadge) premiumBadge.style.display = 'none';
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
      if (initials) {
        const name = user.displayName || user.email || '';
        initials.textContent = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
      }
    }
    if (premiumBadge) premiumBadge.style.display = isPremium ? 'inline-flex' : 'none';
  }
}

// ── Main auth state listener — call this on every page ────────────────
export function initAuthState({ onSignedIn, onSignedOut, requireAuth = false, requirePremium = false } = {}) {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const status = await getPremiumStatus();
      const isPremium = status.isPremium === true;
      updateNavbar(user, isPremium);

      if (requirePremium && !isPremium) {
        // Redirect to pricing if premium is required but user is free
        window.location.href = `pricing.html?reason=premium_required`;
        return;
      }

      if (onSignedIn) onSignedIn(user, isPremium);
    } else {
      updateNavbar(null, false);

      if (requireAuth) {
        // Redirect to login page, return to current page after
        const returnTo = encodeURIComponent(window.location.pathname + window.location.search);
        window.location.href = `login.html?returnTo=${returnTo}`;
        return;
      }

      if (onSignedOut) onSignedOut();
    }
  });
}

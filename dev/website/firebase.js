// dev/website/firebase.js
// MOCK Firebase — no real Firebase project or credentials needed.
// Supports two dev users selectable via localStorage key "dev_auth_role".
//
// Users:
//   regular → test@taxsaver.dev      token: dev-test-token-12345
//   premium → premium@taxsaver.dev   token: dev-premium-token-77777
//   admin   → admin@taxsaver.dev     token: dev-admin-token-99999

const MOCK_USERS = {
  regular: {
    uid: 'test-user-001',
    email: 'test@taxsaver.dev',
    displayName: 'Test User',
    photoURL: 'https://ui-avatars.com/api/?name=Test+User&background=7c3aed&color=fff&size=64',
    isAdmin: false,
    getIdToken: async () => 'dev-test-token-12345',
  },
  premium: {
    uid: 'premium-user-001',
    email: 'premium@taxsaver.dev',
    displayName: 'Premium User',
    photoURL: 'https://ui-avatars.com/api/?name=Premium+User&background=059669&color=fff&size=64',
    isAdmin: false,
    getIdToken: async () => 'dev-premium-token-77777',
  },
  admin: {
    uid: 'admin-user-001',
    email: 'admin@taxsaver.dev',
    displayName: 'Admin User',
    photoURL: 'https://ui-avatars.com/api/?name=Admin+User&background=dc2626&color=fff&size=64',
    isAdmin: true,
    getIdToken: async () => 'dev-admin-token-99999',
  }
};

let _currentUser = null;
const _authListeners = [];

export const auth = {
  get currentUser() { return _currentUser; },
  onAuthStateChanged(callback) {
    _authListeners.push(callback);
    const saved = localStorage.getItem('dev_auth_role');
    if (saved && MOCK_USERS[saved]) {
      _currentUser = MOCK_USERS[saved];
      setTimeout(() => callback(_currentUser), 50);
    } else {
      setTimeout(() => callback(null), 50);
    }
    return () => {};
  }
};

export class GoogleAuthProvider {
  addScope() { return this; }
}

// role: 'regular' | 'admin'
export async function signInWithPopup(authInstance, provider, role = null) {
  await new Promise(r => setTimeout(r, 500));
  const selectedRole = role || localStorage.getItem('dev_signin_role') || 'regular';
  _currentUser = MOCK_USERS[selectedRole];
  localStorage.setItem('dev_auth_role', selectedRole);
  localStorage.removeItem('dev_signin_role');
  _authListeners.forEach(cb => cb(_currentUser));
  console.log('[Mock Firebase] Signed in as:', _currentUser.email, '| isAdmin:', _currentUser.isAdmin);
  return { user: _currentUser };
}

export async function signOut(authInstance) {
  _currentUser = null;
  localStorage.removeItem('dev_auth_role');
  _authListeners.forEach(cb => cb(null));
  console.log('[Mock Firebase] Signed out');
}

export function onAuthStateChanged(authInstance, callback) {
  return auth.onAuthStateChanged(callback);
}

export const db = {};

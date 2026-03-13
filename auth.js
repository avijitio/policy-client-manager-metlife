// ================================================================
// auth.js — Authentication Logic
// ================================================================

// Login Function
function loginUser(email, password) {
  const btn = document.getElementById('loginBtn');
  const errMsg = document.getElementById('errorMsg');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> লগইন হচ্ছে...';
  errMsg.textContent = '';

  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      window.location.href = 'dashboard.html';
    })
    .catch((error) => {
      btn.disabled = false;
      btn.innerHTML = 'লগইন করুন';
      switch (error.code) {
        case 'auth/user-not-found':
          errMsg.textContent = '❌ এই ইমেইল দিয়ে কোনো অ্যাকাউন্ট নেই।';
          break;
        case 'auth/wrong-password':
          errMsg.textContent = '❌ পাসওয়ার্ড ভুল হয়েছে।';
          break;
        case 'auth/invalid-email':
          errMsg.textContent = '❌ ইমেইল সঠিক নয়।';
          break;
        default:
          errMsg.textContent = '❌ লগইন ব্যর্থ: ' + error.message;
      }
    });
}

// Logout Function
function logoutUser() {
  auth.signOut().then(() => {
    window.location.href = 'login.html';
  });
}

// Check Auth State on Dashboard
function requireAuth() {
  auth.onAuthStateChanged((user) => {
    if (!user) {
      window.location.href = 'login.html';
    } else {
      document.getElementById('userEmail').textContent = user.email;
    }
  });
}

// Check Auth State on Login Page (redirect if already logged in)
function checkLoginRedirect() {
  auth.onAuthStateChanged((user) => {
    if (user) {
      window.location.href = 'dashboard.html';
    }
  });
}

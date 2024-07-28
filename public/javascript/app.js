import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged 
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDwNC4QWaBQYqvayl98oMArcGdYV0JuqSk",
  authDomain: "elearning-568mbq.firebaseapp.com",
  projectId: "elearning-568mbq",
  storageBucket: "elearning-568mbq.appspot.com",
  messagingSenderId: "956581108104",
  appId: "1:956581108104:web:2be9a9b0c5978cd4b3823d",
  measurementId: "G-WLB4FBXE9R"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// State variables
let currentUser = null;
let isLoading = true;

// Function to update UI based on auth state
function updateUI(user) {
  const loader = document.getElementById('loader');
  const mainContent = document.getElementById('main-content');
  const loginForm = document.getElementById('login-form');

  if (isLoading) {
    loader.style.display = 'block';
    mainContent.style.display = 'none';
    loginForm.style.display = 'none';
  } else if (user) {
    loader.style.display = 'none';
    mainContent.style.display = 'block';
    loginForm.style.display = 'none';
    // Here you can populate the main content with user-specific data
  } else {
    loader.style.display = 'none';
    mainContent.style.display = 'none';
    loginForm.style.display = 'block';
  }
}

// Authentication state observer
onAuthStateChanged(auth, (user) => {
  isLoading = false;
  currentUser = user;
  updateUI(user);
  if (user) {
    console.log('User is signed in:', user.uid);
    // Here you can start loading user-specific data
  } else {
    console.log('No user is signed in.');
  }
});

// Login function
async function login(email, password) {
  try {
    isLoading = true;
    updateUI(null);
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error('Error logging in:', error);
    isLoading = false;
    updateUI(null);
    // Here you should show an error message to the user
  }
}

// Logout function
async function logout() {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error logging out:', error);
    // Here you should show an error message to the user
  }
}

// Event listeners
document.getElementById('login-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  login(email, password);
});

document.getElementById('logout-button').addEventListener('click', logout);

// Initial UI update
updateUI(null);

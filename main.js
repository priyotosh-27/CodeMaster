/* ===============================
   Firebase Setup
================================ */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
    getFirestore,
    doc,
    setDoc,
    getDoc,
    onSnapshot,
    serverTimestamp,
    updateDoc,
    arrayUnion,
    increment,
    collection,
    addDoc,
    query,
    orderBy
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// 🔹 Your Firebase Config
const firebaseConfig = {
    apiKey: "AIzaSyCtwyVv3cCc8udicg09akTJvGpr5LgmXF4",
    authDomain: "codemaster-102b4.firebaseapp.com",
    projectId: "codemaster-102b4",
    storageBucket: "codemaster-102b4.appspot.com",
    messagingSenderId: "932558907143",
    appId: "1:932558907143:web:d6e3e034be1f2f955b87a2",
    measurementId: "G-E5M37X3LMH"
};

// 🔹 Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


/* ===============================
   Authentication System
================================ */
class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.initializeEventListeners();
        this.listenToAuthChanges();
    }

    initializeEventListeners() {
        // Modal controls
        document.getElementById('loginBtn')?.addEventListener('click', () => this.openAuthModal('login'));
        document.getElementById('registerBtn')?.addEventListener('click', () => this.openAuthModal('register'));
        document.getElementById('closeAuth')?.addEventListener('click', () => this.closeAuthModal());
        document.getElementById('switchAuth')?.addEventListener('click', () => this.switchAuthMode());

        // Form submission
        document.getElementById('authForm')?.addEventListener('submit', (e) => this.handleAuth(e));

        // User menu
        document.getElementById('userMenuBtn')?.addEventListener('click', () => this.toggleUserMenu());
        document.getElementById('logoutBtn')?.addEventListener('click', () => this.logout());

        // Content access
        document.querySelectorAll('.test-card, .challenge-card').forEach(card => {
            card.addEventListener('click', (e) => this.handleProtectedContent(e, card));
        });

        document.querySelectorAll('.notes-card').forEach(card => {
            card.addEventListener('click', (e) => this.handleNotesContent(e, card));
        });

        // Access denied modal
        document.getElementById('closeAccessDenied')?.addEventListener('click', () => this.closeAccessDeniedModal());
        document.getElementById('loginFromModal')?.addEventListener('click', () => {
            this.closeAccessDeniedModal();
            this.openAuthModal('login');
        });
        document.getElementById('registerFromModal')?.addEventListener('click', () => {
            this.closeAccessDeniedModal();
            this.openAuthModal('register');
        });

        // Close modals on background click
        document.getElementById('authModal')?.addEventListener('click', (e) => {
            if (e.target === document.getElementById('authModal')) this.closeAuthModal();
        });
        document.getElementById('accessDeniedModal')?.addEventListener('click', (e) => {
            if (e.target === document.getElementById('accessDeniedModal')) this.closeAccessDeniedModal();
        });

        // Escape key closes modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAuthModal();
                this.closeAccessDeniedModal();
            }
        });

        // Close user menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('#userMenu')) this.closeUserMenu();
        });
    }

    /* ===============================
       Firebase Authentication
    ================================ */
    async handleAuth(e) {
        e.preventDefault();

        const mode = document.getElementById('authMode').value;
        const email = document.getElementById('authEmail').value.trim().toLowerCase();
        const password = document.getElementById('authPassword').value;
        const name = document.getElementById('authName').value.trim();

        this.setLoading(true);

        try {
            if (mode === 'register') {
                if (!name || name.length < 2) throw new Error("Please enter a valid name");

                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;

                // 🔹 Create Firestore profile
                await setDoc(doc(db, "users", user.uid), {
                    uid: user.uid,
                    name,
                    email: user.email,
                    streak: 0,
                    solvedChallenges: [],
                    savedNotes: [],
                    profile: { theme: "light", bio: "" },
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                    lastLogin: serverTimestamp()
                });

                this.currentUser = { uid: user.uid, name, email: user.email };
                this.updateUI();
                this.closeAuthModal();
                this.showNotification(`Welcome, ${name}! 🎉`, 'success');

            } else {
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;

                // 🔹 Fetch Firestore data
                const ref = doc(db, "users", user.uid);
                const snap = await getDoc(ref);

                if (snap.exists()) {
                    const userData = snap.data();

                    // update login timestamp
                    await setDoc(ref, {
                        ...userData,
                        lastLogin: serverTimestamp(),
                        updatedAt: serverTimestamp()
                    }, { merge: true });

                    this.currentUser = { uid: user.uid, ...userData };
                } else {
                    // create profile if not exist
                    await setDoc(ref, {
                        uid: user.uid,
                        name: user.displayName || "User",
                        email: user.email,
                        streak: 0,
                        solvedChallenges: [],
                        savedNotes: [],
                        profile: { theme: "light" },
                        createdAt: serverTimestamp(),
                        updatedAt: serverTimestamp(),
                        lastLogin: serverTimestamp()
                    });
                    this.currentUser = { uid: user.uid, name: user.displayName || "User", email: user.email };
                }

                this.updateUI();
                this.closeAuthModal();
                this.showNotification(`Welcome back, ${this.currentUser.name}!`, 'success');
            }
        } catch (error) {
            this.showNotification(error.message, 'error');
        } finally {
            this.setLoading(false);
        }
    }

    async logout() {
        try {
            await signOut(auth);
            this.currentUser = null;
            this.updateUI();
            this.closeUserMenu();
            this.showNotification("You have been logged out", "info");
        } catch (error) {
            this.showNotification(error.message, "error");
        }
    }

    listenToAuthChanges() {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                const ref = doc(db, "users", user.uid);
                onSnapshot(ref, (snap) => {
                    if (snap.exists()) {
                        this.currentUser = { uid: user.uid, ...snap.data() };
                    } else {
                        this.currentUser = { uid: user.uid, name: user.displayName || "User", email: user.email };
                    }
                    this.updateUI();
                });
            } else {
                this.currentUser = null;
                this.updateUI();
            }
        });
    }

    /* ===============================
       Progress Tracking Methods
    ================================ */
    async saveSolvedChallenge(challengeId) {
        if (!auth.currentUser) return;
        const ref = doc(db, "users", auth.currentUser.uid);
        await updateDoc(ref, {
            solvedChallenges: arrayUnion(challengeId),
            updatedAt: serverTimestamp()
        });
        this.showNotification(`Challenge ${challengeId} solved ✅`, "success");
    }

    async saveNoteAccess(noteId) {
        if (!auth.currentUser) return;
        const ref = doc(db, "users", auth.currentUser.uid);
        await updateDoc(ref, {
            savedNotes: arrayUnion(noteId),
            updatedAt: serverTimestamp()
        });
        this.showNotification(`Note ${noteId} saved 📖`, "info");
    }

    async increaseStreak() {
        if (!auth.currentUser) return;
        const ref = doc(db, "users", auth.currentUser.uid);
        await updateDoc(ref, {
            streak: increment(1),
            updatedAt: serverTimestamp()
        });
        this.showNotification("🔥 Streak increased!", "success");
    }

    async saveTestResult(testId, score) {
        if (!auth.currentUser) return;
        const historyRef = collection(db, "users", auth.currentUser.uid, "history");
        await addDoc(historyRef, {
            testId,
            score,
            date: serverTimestamp()
        });
        this.showNotification(`Test ${testId} saved with score ${score}`, "success");
    }

    listenToHistory() {
        if (!auth.currentUser) return;
        const historyRef = collection(db, "users", auth.currentUser.uid, "history");
        const q = query(historyRef, orderBy("date", "desc"));

        onSnapshot(q, (snapshot) => {
            const results = [];
            snapshot.forEach(doc => results.push(doc.data()));
            console.log("📊 Test History:", results);
        });
    }

    /* ===============================
       UI Helpers
    ================================ */
    openAuthModal(mode) { document.getElementById('authModal')?.classList.remove('hidden'); this.setAuthMode(mode); }
    closeAuthModal() { document.getElementById('authModal')?.classList.add('hidden'); this.resetForm(); }
    closeAccessDeniedModal() { document.getElementById('accessDeniedModal')?.classList.add('hidden'); }
    setAuthMode(mode) {
        const authMode = document.getElementById('authMode');
        const authTitle = document.getElementById('authTitle');
        const submitText = document.getElementById('submitText');
        const switchAuth = document.getElementById('switchAuth');
        const nameField = document.getElementById('nameField');

        authMode.value = mode;
        if (mode === 'login') {
            authTitle.textContent = 'Welcome Back';
            submitText.textContent = 'Sign In';
            switchAuth.textContent = "Don't have an account? Join CodeMaster";
            nameField.classList.add('hidden');
        } else {
            authTitle.textContent = 'Join CodeMaster';
            submitText.textContent = 'Create Account';
            switchAuth.textContent = 'Already have an account? Sign In';
            nameField.classList.remove('hidden');
        }
    }
    switchAuthMode() {
        const currentMode = document.getElementById('authMode').value;
        this.setAuthMode(currentMode === 'login' ? 'register' : 'login');
    }
    updateUI() {
        const authButtons = document.getElementById('authButtons');
        const userMenu = document.getElementById('userMenu');
        const userNameDisplay = document.getElementById('userNameDisplay');
        const userEmailDisplay = document.getElementById('userEmailDisplay');

        if (this.currentUser) {
            authButtons?.classList.add('hidden');
            userMenu?.classList.remove('hidden');
            if (userNameDisplay) userNameDisplay.textContent = `Hi, ${this.currentUser.name}`;
            if (userEmailDisplay) userEmailDisplay.textContent = this.currentUser.email;
        } else {
            authButtons?.classList.remove('hidden');
            userMenu?.classList.add('hidden');
        }
    }
    toggleUserMenu() { document.getElementById('userDropdown')?.classList.toggle('show'); }
    closeUserMenu() { document.getElementById('userDropdown')?.classList.remove('show'); }

    /* ===============================
       Navigation / Access Control
    ================================ */
    handleProtectedContent(e, card) {
        e.preventDefault();
        if (!this.currentUser) {
            document.getElementById('accessDeniedModal')?.classList.remove('hidden');
            return;
        }
        const testType = card.dataset.test || card.dataset.challenge;
        if (card.dataset.challenge) this.saveSolvedChallenge(testType); // auto save progress
        this.navigateToTestPage(testType, card.dataset.test ? 'test' : 'challenge');
    }

    handleNotesContent(e, card) {
        e.preventDefault();
        if (!this.currentUser) {
            document.getElementById('accessDeniedModal')?.classList.remove('hidden');
            return;
        }
        const notesType = card.dataset.notes;
        this.saveNoteAccess(notesType); // auto save notes progress
        this.navigateToNotesPage(notesType);
    }

    navigateToTestPage(testType, category) {
        const testPages = {
            'programming': 'programming-test.html',
            'java': 'java-test.html',
            'dsa': 'dsa-test.html',
            'general': 'general-test.html',
            'basic': 'basic.html',
            'interview': 'interview.html',
            'company': 'company.html'
        };
        const targetPage = testPages[testType];
        if (targetPage) {
            setTimeout(() => { window.location.href = targetPage; }, 500);
        } else {
            this.showNotification(`Page not found: ${testType}`, 'error');
        }
    }

    navigateToNotesPage(notesType) {
        const notesPages = {
            'python': 'python-tutorial.html',
            'java': 'java-tutorial.html',
            'dsa': 'dsa-tutorial.html',
            'general': 'general-tutorial.html'
        };
        const targetPage = notesPages[notesType];
        if (targetPage) {
            setTimeout(() => { window.location.href = targetPage; }, 500);
        } else {
            this.showNotification(`Notes not found: ${notesType}`, 'error');
        }
    }

    /* ===============================
       Helpers
    ================================ */
    setLoading(isLoading) {
        const submitBtn = document.querySelector('#authForm button[type="submit"]');
        const loadingSpinner = document.getElementById('loadingSpinner');
        const submitText = document.getElementById('submitText');

        if (isLoading) {
            submitBtn.disabled = true;
            loadingSpinner.classList.remove('hidden');
            const mode = document.getElementById('authMode').value;
            submitText.textContent = mode === 'login' ? 'Signing In...' : 'Creating Account...';
        } else {
            submitBtn.disabled = false;
            loadingSpinner.classList.add('hidden');
            const mode = document.getElementById('authMode').value;
            submitText.textContent = mode === 'login' ? 'Sign In' : 'Create Account';
        }
    }

    resetForm() {
        document.getElementById('authForm')?.reset();
        this.setLoading(false);
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transform translate-x-full transition-transform duration-300 max-w-sm ${type === 'success' ? 'bg-green-500 text-white' :
            type === 'error' ? 'bg-red-500 text-white' :
                type === 'info' ? 'bg-blue-500 text-white' :
                    'bg-gray-500 text-white'
            }`;
        notification.innerHTML = `
          <div class="flex items-center space-x-2">
            <i class="fas ${type === 'success' ? 'fa-check-circle' :
                type === 'error' ? 'fa-exclamation-circle' :
                    type === 'info' ? 'fa-info-circle' :
                        'fa-bell'}"></i>
            <span>${message}</span>
          </div>
        `;
        document.body.appendChild(notification);
        setTimeout(() => { notification.style.transform = 'translateX(0)'; }, 100);
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => { notification.remove(); }, 300);
        }, 4000);
    }
}

// Initialize
const authSystem = new AuthSystem();

/* ===============================
   Theme Toggle
================================ */
const themeToggle = document.getElementById('themeToggle');
const body = document.body;
const currentTheme = localStorage.getItem('theme');
if (currentTheme === 'dark') body.classList.add('dark');

themeToggle.addEventListener('click', () => {
    body.classList.toggle('dark');
    localStorage.setItem('theme', body.classList.contains('dark') ? 'dark' : 'light');
});

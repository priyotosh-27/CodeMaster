
// Authentication System - FIXED VERSION
class AuthSystem {
    constructor() {
        this.registeredUsers = JSON.parse(localStorage.getItem('codemaster_registered_users')) || [];
        this.currentUser = JSON.parse(localStorage.getItem('codemaster_current_user')) || null;
        this.initializeEventListeners();
        this.updateUI();
    }

    initializeEventListeners() {
        // Modal controls
        document.getElementById('loginBtn').addEventListener('click', () => this.openAuthModal('login'));
        document.getElementById('registerBtn').addEventListener('click', () => this.openAuthModal('register'));
        document.getElementById('closeAuth').addEventListener('click', () => this.closeAuthModal());
        document.getElementById('switchAuth').addEventListener('click', () => this.switchAuthMode());

        // Form submission
        document.getElementById('authForm').addEventListener('submit', (e) => this.handleAuth(e));

        // Social auth
        document.getElementById('googleAuth').addEventListener('click', () => this.handleGoogleAuth());
        document.getElementById('githubAuth').addEventListener('click', () => this.handleGithubAuth());

        // User menu
        document.getElementById('userMenuBtn').addEventListener('click', () => this.toggleUserMenu());
        document.getElementById('logoutBtn').addEventListener('click', () => this.logout());

        // Access control - Test Cards and Challenge Cards (require login)
        document.querySelectorAll('.test-card, .challenge-card').forEach(card => {
            card.addEventListener('click', (e) => this.handleProtectedContent(e, card));
        });

        // Study Notes (no login required)
        document.querySelectorAll('.notes-card').forEach(card => {
            card.addEventListener('click', (e) => this.handleNotesContent(e, card));
        });

        // Access denied modal
        document.getElementById('closeAccessDenied').addEventListener('click', () => this.closeAccessDeniedModal());
        document.getElementById('loginFromModal').addEventListener('click', () => {
            this.closeAccessDeniedModal();
            this.openAuthModal('login');
        });
        document.getElementById('registerFromModal').addEventListener('click', () => {
            this.closeAccessDeniedModal();
            this.openAuthModal('register');
        });

        // Close modals on background click
        document.getElementById('authModal').addEventListener('click', (e) => {
            if (e.target === document.getElementById('authModal')) {
                this.closeAuthModal();
            }
        });

        document.getElementById('accessDeniedModal').addEventListener('click', (e) => {
            if (e.target === document.getElementById('accessDeniedModal')) {
                this.closeAccessDeniedModal();
            }
        });

        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAuthModal();
                this.closeAccessDeniedModal();
            }
        });

        // Close user menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('#userMenu')) {
                this.closeUserMenu();
            }
        });
    }

    openAuthModal(mode) {
        document.getElementById('authModal').classList.remove('hidden');
        this.setAuthMode(mode);
        // Focus on first input
        setTimeout(() => {
            const firstInput = document.querySelector('#authModal input[type="email"]');
            if (firstInput) firstInput.focus();
        }, 100);
    }

    closeAuthModal() {
        document.getElementById('authModal').classList.add('hidden');
        this.resetForm();
    }

    closeAccessDeniedModal() {
        document.getElementById('accessDeniedModal').classList.add('hidden');
    }

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

    async handleAuth(e) {
        e.preventDefault();

        const mode = document.getElementById('authMode').value;
        const email = document.getElementById('authEmail').value.trim().toLowerCase();
        const password = document.getElementById('authPassword').value;
        const name = document.getElementById('authName').value.trim();

        // Show loading
        this.setLoading(true);

        try {
            if (mode === 'register') {
                await this.register(email, password, name);
            } else {
                await this.login(email, password);
            }
        } catch (error) {
            this.showNotification(error.message, 'error');
        } finally {
            this.setLoading(false);
        }
    }

    async register(email, password, name) {
        // Validation
        if (!name || name.length < 2) {
            throw new Error('Please enter a valid name (at least 2 characters)');
        }

        if (!this.isValidEmail(email)) {
            throw new Error('Please enter a valid email address');
        }

        if (password.length < 6) {
            throw new Error('Password must be at least 6 characters long');
        }

        // Check if user already exists
        const existingUser = this.registeredUsers.find(user => user.email === email);
        if (existingUser) {
            throw new Error('An account with this email already exists. Please login instead.');
        }

        // Simulate API call
        await this.simulateAPICall();

        // Create new user account
        const newUser = {
            name: name,
            email: email,
            password: password,
            provider: 'email',
            createdAt: new Date().toISOString()
        };

        // Add to registered users
        this.registeredUsers.push(newUser);
        localStorage.setItem('codemaster_registered_users', JSON.stringify(this.registeredUsers));

        // Auto login after registration
        this.currentUser = {
            name: newUser.name,
            email: newUser.email,
            provider: newUser.provider
        };

        localStorage.setItem('codemaster_current_user', JSON.stringify(this.currentUser));

        this.closeAuthModal();
        this.updateUI();
        this.showNotification(`Welcome back, ${this.currentUser.name}!`, 'success');
    }

    async handleGoogleAuth() {
        this.setLoading(true, 'google');

        try {
            // Simulate Google OAuth
            await this.simulateAPICall(2000);

            // Mock successful Google auth
            const mockGoogleUser = {
                name: 'Google User',
                email: 'user@gmail.com',
                provider: 'google'
            };

            this.currentUser = mockGoogleUser;
            localStorage.setItem('codemaster_current_user', JSON.stringify(this.currentUser));

            this.closeAuthModal();
            this.updateUI();
            this.showNotification(`Welcome, ${this.currentUser.name}! Signed in with Google.`, 'success');

        } catch (error) {
            this.showNotification('Google sign-in failed. Please try again.', 'error');
        } finally {
            this.setLoading(false, 'google');
        }
    }

    async handleGithubAuth() {
        this.setLoading(true, 'github');

        try {
            // Simulate GitHub OAuth
            await this.simulateAPICall(2000);

            // Mock successful GitHub auth
            const mockGithubUser = {
                name: 'GitHub User',
                email: 'user@github.com',
                provider: 'github'
            };

            this.currentUser = mockGithubUser;
            localStorage.setItem('codemaster_current_user', JSON.stringify(this.currentUser));

            this.closeAuthModal();
            this.updateUI();
            this.showNotification(`Welcome, ${this.currentUser.name}! Signed in with GitHub.`, 'success');

        } catch (error) {
            this.showNotification('GitHub sign-in failed. Please try again.', 'error');
        } finally {
            this.setLoading(false, 'github');
        }
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('codemaster_current_user');
        this.updateUI();
        this.closeUserMenu();
        this.showNotification('You have been logged out successfully.', 'info');
    }

    updateUI() {
        const authButtons = document.getElementById('authButtons');
        const userMenu = document.getElementById('userMenu');
        const userNameDisplay = document.getElementById('userNameDisplay');
        const userEmailDisplay = document.getElementById('userEmailDisplay');

        if (this.currentUser) {
            // User is logged in
            authButtons.classList.add('hidden');
            userMenu.classList.remove('hidden');
            userNameDisplay.textContent = `Hi, ${this.currentUser.name}`;
            userEmailDisplay.textContent = this.currentUser.email;
        } else {
            // User is not logged in
            authButtons.classList.remove('hidden');
            userMenu.classList.add('hidden');
        }
    }

    toggleUserMenu() {
        const dropdown = document.getElementById('userDropdown');
        dropdown.classList.toggle('show');
    }

    closeUserMenu() {
        const dropdown = document.getElementById('userDropdown');
        dropdown.classList.remove('show');
    }

    // FIXED: Navigation handling method
    handleProtectedContent(e, card) {
        e.preventDefault();

        if (!this.currentUser) {
            document.getElementById('accessDeniedModal').classList.remove('hidden');
            return;
        }

        // User is logged in, navigate to appropriate page
        const testType = card.dataset.test || card.dataset.challenge;
        this.navigateToTestPage(testType, card.dataset.test ? 'test' : 'challenge');
    }

    handleNotesContent(e, card) {
        e.preventDefault();

        // Study notes are accessible without login
        const notesType = card.dataset.notes;
        this.navigateToNotesPage(notesType);
    }

    // FIXED: Direct navigation to test pages
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
            // Set logged in user in localStorage for the test page
            localStorage.setItem('loggedInUser', JSON.stringify({
                email: this.currentUser.email,
                name: this.currentUser.name
            }));

            this.showNotification(`Opening ${testType} ${category}...`, 'info');

            // Navigate directly
            setTimeout(() => {
                window.location.href = targetPage;
            }, 500);
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
            this.showNotification(`Opening ${notesType} notes...`, 'info');
            setTimeout(() => {
                window.location.href = targetPage;
            }, 500);
        } else {
            this.showNotification(`Notes not found: ${notesType}`, 'error');
        }
    }

    setLoading(isLoading, provider = null) {
        const submitBtn = document.querySelector('#authForm button[type="submit"]');
        const loadingSpinner = document.getElementById('loadingSpinner');
        const submitText = document.getElementById('submitText');
        const googleBtn = document.getElementById('googleAuth');
        const githubBtn = document.getElementById('githubAuth');

        if (isLoading) {
            if (provider === 'google') {
                googleBtn.disabled = true;
                googleBtn.innerHTML = '<div class="loading-spinner mr-2"></div>Connecting...';
            } else if (provider === 'github') {
                githubBtn.disabled = true;
                githubBtn.innerHTML = '<div class="loading-spinner mr-2"></div>Connecting...';
            } else {
                submitBtn.disabled = true;
                loadingSpinner.classList.remove('hidden');
                const mode = document.getElementById('authMode').value;
                submitText.textContent = mode === 'login' ? 'Signing In...' : 'Creating Account...';
            }
        } else {
            // Reset all buttons
            submitBtn.disabled = false;
            loadingSpinner.classList.add('hidden');

            const mode = document.getElementById('authMode').value;
            submitText.textContent = mode === 'login' ? 'Sign In' : 'Create Account';

            googleBtn.disabled = false;
            googleBtn.innerHTML = '<i class="fab fa-google text-red-500 mr-2"></i><span class="text-sm font-medium text-gray-700 dark:text-gray-300">Google</span>';

            githubBtn.disabled = false;
            githubBtn.innerHTML = '<i class="fab fa-github text-gray-800 dark:text-gray-300 mr-2"></i><span class="text-sm font-medium text-gray-700 dark:text-gray-300">GitHub</span>';
        }
    }

    resetForm() {
        document.getElementById('authForm').reset();
        this.setLoading(false);
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    simulateAPICall(duration = 1500) {
        return new Promise(resolve => setTimeout(resolve, duration));
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
                        'fa-bell'
            }"></i>
            <span>${message}</span>
          </div>
        `;

        document.body.appendChild(notification);

        // Slide in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Slide out and remove
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }
}

// Initialize authentication system
const auth = new AuthSystem();

// Theme Toggle Functionality
const themeToggle = document.getElementById('themeToggle');
const body = document.body;

// Check for saved theme preference or default to light mode
const currentTheme = localStorage.getItem('theme');
if (currentTheme === 'dark') {
    body.classList.add('dark');
}

themeToggle.addEventListener('click', () => {
    body.classList.toggle('dark');

    // Save theme preference
    if (body.classList.contains('dark')) {
        localStorage.setItem('theme', 'dark');
    } else {
        localStorage.setItem('theme', 'light');
    }
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add loading animation to test cards on hover
document.querySelectorAll('.category-card, .rainbow-border').forEach(card => {
    card.addEventListener('mouseenter', function () {
        if (!this.dataset.test && !this.dataset.challenge && !this.dataset.notes) {
            this.style.transform = 'translateY(-8px) scale(1.02)';
        }
    });

    card.addEventListener('mouseleave', function () {
        if (!this.dataset.test && !this.dataset.challenge && !this.dataset.notes) {
            this.style.transform = 'translateY(0) scale(1)';
        }
    });
});

// Add parallax effect to hero section
let ticking = false;
function updateParallax() {
    const scrolled = window.pageYOffset;
    const parallax = document.querySelector('#home');
    const speed = scrolled * 0.1;
    if (parallax) {
        parallax.style.transform = `translateY(${speed}px)`;
    }
    ticking = false;
}

window.addEventListener('scroll', () => {
    if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
    }
});

// Add intersection observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('bounce-in');
        }
    });
}, observerOptions);

// Observe all cards
document.querySelectorAll('.category-card, .rainbow-border').forEach(card => {
    observer.observe(card);
});

// Hero text animation controller
const textItems = document.querySelectorAll('.hero-text-item');

// Initialize with first text visible
if (textItems.length > 0) {
    textItems[0].style.opacity = '1';
    textItems[0].style.transform = 'translateY(0)';
}

// Add scroll-triggered animations
let scrollTimeout;
window.addEventListener('scroll', () => {
    if (scrollTimeout) {
        clearTimeout(scrollTimeout);
    }

    scrollTimeout = setTimeout(() => {
        const scrollY = window.scrollY;
        const windowHeight = window.innerHeight;

        // Animate elements on scroll
        document.querySelectorAll('.category-card').forEach((card, index) => {
            const cardTop = card.offsetTop;
            if (scrollY + windowHeight > cardTop + 100) {
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, index * 50);
            }
        });
    }, 10);
});

// Performance optimization - debounce resize events
let resizeTimeout;
window.addEventListener('resize', () => {
    if (resizeTimeout) {
        clearTimeout(resizeTimeout);
    }

    resizeTimeout = setTimeout(() => {
        // Handle responsive adjustments if needed
    }, 100);
});

// Add error handling for images
document.querySelectorAll('img').forEach(img => {
    img.addEventListener('error', function () {
        this.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&h=400&fit=crop';
    });
});

// Welcome message for first-time visitors
if (!localStorage.getItem('visited_before')) {
    setTimeout(() => {
        auth.showNotification('Welcome to CodeMaster! Sign up to start your coding journey.', 'info');
        localStorage.setItem('visited_before', 'true');
    }, 2000);
}

// Handle navigation menu clicks
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href && href.startsWith('#')) {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
});

// Add keyboard navigation support
document.addEventListener('keydown', function (e) {
    if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
            case 'l':
                e.preventDefault();
                if (!auth.currentUser) {
                    auth.openAuthModal('login');
                }
                break;
            case 'r':
                e.preventDefault();
                if (!auth.currentUser) {
                    auth.openAuthModal('register');
                }
                break;
        }
    }
});

console.log('✅ CodeMaster Platform Initialized Successfully');
console.log('🔐 Authentication system ready');
console.log('🎯 Navigation links fixed and working');
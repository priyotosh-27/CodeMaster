document.addEventListener("DOMContentLoaded", function () {
    const authModal = document.getElementById("authModal");
    const authTitle = document.getElementById("authTitle");
    const authForm = document.getElementById("authForm");
    const authMode = document.getElementById("authMode");
    const nameField = document.getElementById("nameField");
    const switchAuth = document.getElementById("switchAuth");
    const loginBtn = document.getElementById("loginBtn");
    const registerBtn = document.getElementById("registerBtn");
    const closeAuth = document.getElementById("closeAuth");

    const navContainer = loginBtn?.parentElement;

    function isLoggedIn() {
        return !!localStorage.getItem("loggedInUser");
    }

    function openAuth(mode) {
        authMode.value = mode;
        if (mode === "login") {
            authTitle.textContent = "Login";
            nameField.classList.add("hidden");
            switchAuth.textContent = "Don't have an account? Register";
        } else {
            authTitle.textContent = "Register";
            nameField.classList.remove("hidden");
            switchAuth.textContent = "Already have an account? Login";
        }
        authModal.classList.remove("hidden");
    }

    function closeAuthModal() {
        authModal.classList.add("hidden");
        authForm.reset();
    }

    loginBtn?.addEventListener("click", () => openAuth("login"));
    registerBtn?.addEventListener("click", () => openAuth("register"));
    switchAuth.addEventListener("click", () => {
        openAuth(authMode.value === "login" ? "register" : "login");
    });
    closeAuth.addEventListener("click", closeAuthModal);

    authForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const email = document.getElementById("authEmail").value.trim().toLowerCase();
        const password = document.getElementById("authPassword").value.trim();
        const fullName = document.getElementById("authName").value.trim();
        let users = JSON.parse(localStorage.getItem("users") || "{}");

        if (!email || !password || (authMode.value === "register" && !fullName)) {
            alert("Please fill in all required fields.");
            return;
        }

        if (authMode.value === "register") {
            if (users[email]) {
                alert("User already exists!");
                return;
            }
            users[email] = { password, name: fullName };
            localStorage.setItem("users", JSON.stringify(users));
            alert("Registration successful! Please login.");
            openAuth("login");
        } else {
            if (!users[email] || users[email].password !== password) {
                alert("Invalid email or password!");
                return;
            }
            localStorage.setItem(
                "loggedInUser",
                JSON.stringify({ email, name: users[email].name })
            );
            updateNavbar();
            closeAuthModal();
        }
    });

    function updateNavbar() {
        const user = JSON.parse(localStorage.getItem("loggedInUser"));
        if (user) {
            navContainer.innerHTML = `
        <span class="px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold shadow-sm">Hi, ${user.name}</span>
        <button id="logoutBtn" class="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700">Logout</button>
      `;
            document.getElementById("logoutBtn").addEventListener("click", function () {
                localStorage.removeItem("loggedInUser");
                location.reload();
            });
        } else {
            navContainer.innerHTML = `
  <span class="px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold shadow-sm">Hi, ${username}</span>
  <button id="logoutBtn" class="px-4 py-2 rounded-lg bg-white text-indigo-700 font-medium hover:bg-gray-100">Logout</button>
`;
            document.getElementById("loginBtn").addEventListener("click", () => openAuth("login"));
            document.getElementById("registerBtn").addEventListener("click", () => openAuth("register"));
        }
    }

    updateNavbar();

    function attachTestCardListeners() {
        const testPageMap = {
            programming: "programming-test.html",
            java: "java-test.html",
            dsa: "dsa-test.html",
            general: "general-test.html"
        };

        document.querySelectorAll(".cat-card[data-cat]:not([data-cat$='-notes'])").forEach(card => {
            card.addEventListener("click", () => {
                const cat = card.getAttribute("data-cat");
                if (!isLoggedIn()) {
                    authModal.classList.remove("hidden");
                    return;
                }
                if (testPageMap[cat]) {
                    window.location.href = testPageMap[cat];
                } else {
                    alert("Test page not found for category: " + cat);
                }
            });
        });
    }

    attachTestCardListeners();

    function attachNoteCardListeners() {
        const pageMap = {
            "python-notes": "python-tutorial.html",
            "java-notes": "java-tutorial.html",
            "dsa-notes": "dsa-tutorial.html",
            "general-notes": "general-tutorial.html"
        };

        document.querySelectorAll('[data-cat$="-notes"]').forEach(card => {
            card.addEventListener("click", () => {
                const cat = card.getAttribute("data-cat");
                if (pageMap[cat]) {
                    window.location.href = pageMap[cat];
                }
            });
        });
    }

    attachNoteCardListeners();

    // ✅ Auto logout after 30 minutes of inactivity
    let logoutTimer;
    function resetLogoutTimer() {
        clearTimeout(logoutTimer);
        logoutTimer = setTimeout(() => {
            localStorage.removeItem("loggedInUser");
            alert("Session expired. Please log in again.");
            location.reload();
        }, 30 * 60 * 1000); // 30 minutes
    }
    ["click", "mousemove", "keydown"].forEach(evt =>
        document.addEventListener(evt, resetLogoutTimer)
    );
    resetLogoutTimer();
});
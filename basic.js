const challenges = {
    Basic: [
        {
            title: "Hello World",
            description: "Print 'Hello World'",
            difficulty: "Easy",
            link: "https://www.geeksforgeeks.org/c-program-to-print-hello-world/"
        },
        {
            title: "Reverse String",
            description: "Reverse a string manually",
            difficulty: "Easy",
            link: "https://leetcode.com/problems/reverse-string/"
        }
    ],
    DSA: [
        {
            title: "Two Sum",
            description: "Find two numbers that add to target",
            difficulty: "Medium",
            link: "https://leetcode.com/problems/two-sum/"
        },
        {
            title: "LRU Cache",
            description: "Implement LRU cache",
            difficulty: "Hard",
            link: "https://leetcode.com/problems/lru-cache/"
        }
    ]
};

let currentCategory = "Basic";
let solvedChallenges = JSON.parse(localStorage.getItem("solvedChallenges") || "[]");

function renderChallenges() {
    const grid = document.getElementById("challengeGrid");
    const filter = document.getElementById("difficultyFilter").value;
    grid.innerHTML = "";

    challenges[currentCategory].forEach(ch => {
        if (filter && ch.difficulty !== filter) return;

        const card = document.createElement("div");
        card.className = "card";

        const isSolved = solvedChallenges.includes(ch.title);

        card.innerHTML = `
      <h3>${ch.title}</h3>
      <p>${ch.description}</p>
      <span class="badge ${ch.difficulty.toLowerCase()}">${ch.difficulty}</span>
      <div class="actions">
        <label>
          <input type="checkbox" ${isSolved ? "checked" : ""} onchange="toggleSolved('${ch.title}', this.checked)" />
          <span class="checkbox-label">Mark as Solved</span>
        </label>
        <a href="${ch.link}" target="_blank" class="external-btn">Solve on Platform</a>
      </div>
    `;
        grid.appendChild(card);
    });
}

function toggleSolved(title, checked) {
    if (checked && !solvedChallenges.includes(title)) {
        solvedChallenges.push(title);
    } else {
        solvedChallenges = solvedChallenges.filter(t => t !== title);
    }
    localStorage.setItem("solvedChallenges", JSON.stringify(solvedChallenges));
    renderChallenges();
}

document.getElementById("difficultyFilter").onchange = renderChallenges;

document.querySelectorAll(".tab").forEach(tab => {
    tab.onclick = () => {
        document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
        tab.classList.add("active");
        currentCategory = tab.dataset.category;
        renderChallenges();
    };
});

document.getElementById("themeToggle").onclick = () => {
    document.body.classList.toggle("dark");
};

renderChallenges();
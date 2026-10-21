import { fetchAllPlayerData } from './api.js';

const loadingState = document.getElementById("loading-state");
const errorState = document.getElementById("error-state");
const emptyState = document.getElementById("empty-state");
const dashboard = document.getElementById("dashboard-content");

const playerName = document.getElementById("player-name");
const statsContainer = document.getElementById("stats-cards");
const matchesContainer = document.getElementById("matches-list");
const matchesEmpty = document.getElementById("matches-empty");

const searchForm = document.getElementById("search-form");
const nicknameInput = document.getElementById("nickname");

// Funcția universală pentru căutare
async function cautaJucator(nickname) {
    showState("loading");
    try {
        const data = await fetchAllPlayerData(nickname);
        renderDashboard(data);
    } catch (err) {
        showState("error", "Jucătorul nu a fost găsit. Verifică nickname-ul!");
    }
}

// Căutare la trimiterea formularului
searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const nickname = nicknameInput.value.trim();
    if (!nickname) return;
    cautaJucator(nickname);
});

function showState(state, message = "") {
    loadingState.hidden = true;
    errorState.hidden = true;
    emptyState.hidden = true;
    dashboard.hidden = true;

    if (state === "loading") {
        loadingState.hidden = false;
    } else if (state === "error") {
        errorState.querySelector("p").textContent = message || "A apărut o eroare.";
        errorState.hidden = false;
    } else if (state === "empty") {
        emptyState.hidden = false;
    } else if (state === "dashboard") {
        dashboard.hidden = false;
    }
}

function formatNumber(value, decimals = 0) {
    if (value === null || value === undefined || value === "") return "—";
    const number = Number(value);
    if (!Number.isFinite(number)) return "—";
    return number.toLocaleString("ro-RO", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function createStatCard(title, value, description) {
    const card = document.createElement("div");
    card.className = "stat-card";
    const heading = document.createElement("h3");
    heading.textContent = title;
    const valueElement = document.createElement("p");
    valueElement.className = "stat-value";
    valueElement.textContent = value;
    const detail = document.createElement("span");
    detail.className = "stat-description";
    detail.textContent = description;
    card.append(heading, valueElement, detail);
    return card;
}

function renderStats(stats) {
    statsContainer.replaceChildren();
    
    const winRate = stats.winRate ? `${formatNumber(stats.winRate, 1)}%` : "—";
    const hsPercent = stats.headshotPercent ? `${formatNumber(stats.headshotPercent, 0)}%` : "—";

    const cards = [
        createStatCard("Elo", formatNumber(stats.elo), "Punctaj FACEIT"),
        createStatCard("Meciuri", formatNumber(stats.totalMatches), "Total meciuri jucate"),
        createStatCard("Win Rate", winRate, "Procentul meciurilor câștigate"),
        createStatCard("Win Streak", formatNumber(stats.winStreak), "Victorii consecutive"),
        createStatCard("K/D Ratio", formatNumber(stats.kdRatio, 2), "Media eliminări/decese"),
        createStatCard("Headshot %", hsPercent, "Procentaj mediu headshots")
    ];
    
    statsContainer.append(...cards);
}

// Modificarea principală: Transformăm corect timpul pentru a afișa Data și Ora
function formatMatchDate(timestamp) {
    if (!timestamp) return "Dată indisponibilă";
    
    // FACEIT trimite timpul în secunde (10 cifre). JavaScript folosește milisecunde.
    const validTimestamp = String(timestamp).length === 10 ? timestamp * 1000 : timestamp;
    
    const date = new Date(validTimestamp);
    return date.toLocaleString("ro-RO", { 
        day: "2-digit", 
        month: "2-digit", 
        year: "numeric", 
        hour: "2-digit", 
        minute: "2-digit" 
    });
}

function renderMatches(matches) {
    matchesContainer.replaceChildren();

    if (!matches.length) {
        matchesEmpty.hidden = false;
        return;
    }

    matchesEmpty.hidden = true;

    matches.forEach((match) => {
        const card = document.createElement("article");
        card.className = "match-card";

        const mapName = document.createElement("h3");
        mapName.textContent = match.map || "Hartă necunoscută";

        const result = document.createElement("span");
        if (match.result === "win") {
            result.textContent = "Victorie";
            result.className = "match-result win";
        } else {
            result.textContent = "Înfrângere";
            result.className = "match-result loss";
        }

        const date = document.createElement("p");
        // Aici afișăm data și ora procesate
        date.textContent = `Jucat la: ${formatMatchDate(match.date)}`;

        const score = document.createElement("p");
        score.textContent = `Scor: ${match.score || "Indisponibil"}`;

        const kd = document.createElement("p");
        kd.textContent = `K/D/A: ${match.kills ?? "—"} / ${match.deaths ?? "—"} / ${match.assists ?? "—"}`;

        card.append(mapName, result, date, score, kd);
        matchesContainer.appendChild(card);
    });
}

function renderDashboard(data) {
    if (!data || !data.player) {
        showState("error", "Datele primite nu sunt valide.");
        return;
    }

    playerName.textContent = data.player.nickname || "Jucător FACEIT";
    renderStats(data.stats);
    renderMatches(data.matches);
    showState("dashboard");
}

showState("empty");
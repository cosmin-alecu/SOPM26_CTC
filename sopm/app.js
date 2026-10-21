import { fetchAllPlayerData } from './api.js';

const loadingState = document.getElementById("loading-state");
const errorState = document.getElementById("error-state");
const emptyState = document.getElementById("empty-state");
const dashboard = document.getElementById("dashboard-content");

const playerName = document.getElementById("player-name");
const playerAvatar = document.getElementById("player-avatar"); 
const statsContainer = document.getElementById("stats-cards");
const matchesContainer = document.getElementById("matches-list");
const matchesEmpty = document.getElementById("matches-empty");

const searchForm = document.getElementById("search-form");
const nicknameInput = document.getElementById("nickname");

async function cautaJucator(nickname) {
    showState("loading");
    try {
        const data = await fetchAllPlayerData(nickname);
        renderDashboard(data);
    } catch (err) {
        showState("error", "Jucătorul nu a fost găsit. Verifică nickname-ul!");
    }
}

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

function formatMatchDate(timestamp) {
    if (!timestamp) return "Dată indisponibilă";
    
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

    // Imaginea de profil implicită dacă jucătorul nu are una setată
    const defaultAvatarUrl = "https://corporate.faceit.com/wp-content/uploads/2021/04/faceit-app-logo.png";
    const finalAvatar = data.player.avatar ? data.player.avatar : defaultAvatarUrl;

    // Inserăm imaginea (fie cea reală, fie cea default) și ascundem textul "CS2"
    playerAvatar.innerHTML = `<img src="${finalAvatar}" alt="Avatar ${data.player.nickname}" style="width: 100%; height: 100%; object-fit: cover; border-radius: inherit;">`;
    playerAvatar.style.padding = "0";
    playerAvatar.style.overflow = "hidden"; // Asigură tăierea perfectă pe margini

    renderStats(data.stats);
    renderMatches(data.matches);
    showState("dashboard");
}

showState("empty");
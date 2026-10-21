const loadingState = document.getElementById("loading-state");
const errorState = document.getElementById("error-state");
const emptyState = document.getElementById("empty-state");
const dashboard = document.getElementById("dashboard-content");

const playerName = document.getElementById("player-name");
const statsContainer = document.getElementById("stats-cards");
const matchesContainer = document.getElementById("matches-list");
const matchesEmpty = document.getElementById("matches-empty");

function showState(state, message = "") {
    loadingState.hidden = true;
    errorState.hidden = true;
    emptyState.hidden = true;
    dashboard.hidden = true;

    if (state === "loading") {
        loadingState.hidden = false;
    } else if (state === "error") {
        errorState.textContent = message || "A apărut o eroare.";
        errorState.hidden = false;
    } else if (state === "empty") {
        emptyState.hidden = false;
    } else if (state === "dashboard") {
        dashboard.hidden = false;
    }
}

function formatNumber(value, decimals = 0) {
    if (value === null || value === undefined || value === "") {
        return "—";
    }

    const number = Number(value);

    if (!Number.isFinite(number)) {
        return "—";
    }

    return number.toLocaleString("ro-RO", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });
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

    const winRate = stats.winRate === null ||
        stats.winRate === undefined ||
        stats.winRate === ""
        ? "—"
        : `${formatNumber(stats.winRate, 1)}%`;

    const cards = [
        createStatCard(
            "Elo",
            formatNumber(stats.elo),
            "Punctaj FACEIT"
        ),
        createStatCard(
            "K/D Ratio",
            formatNumber(stats.kdRatio, 2),
            "Eliminări raportate la decese"
        ),
        createStatCard(
            "Win Rate",
            winRate,
            "Procentul meciurilor câștigate"
        )
    ];

    statsContainer.append(...cards);
}

function formatMatchDate(dateValue) {
    if (!dateValue) {
        return "Dată indisponibilă";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return String(dateValue);
    }

    return date.toLocaleString("ro-RO", {
        dateStyle: "medium",
        timeStyle: "short"
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
        const normalizedResult = String(match.result || "").toLowerCase();

        if (["win", "won", "victory"].includes(normalizedResult)) {
            result.textContent = "Victorie";
            result.className = "match-result win";
        } else if (["loss", "lost", "defeat"].includes(normalizedResult)) {
            result.textContent = "Înfrângere";
            result.className = "match-result loss";
        } else {
            result.textContent = match.result || "Rezultat indisponibil";
            result.className = "match-result";
        }

        const date = document.createElement("p");
        date.textContent = `Data: ${formatMatchDate(match.date)}`;

        const score = document.createElement("p");
        score.textContent = `Scor: ${match.score || "Indisponibil"}`;

        const kd = document.createElement("p");

        const hasKda = [
            match.kills,
            match.deaths,
            match.assists
        ].some(value => value !== null && value !== undefined);

        if (hasKda) {
            kd.textContent =
                `K/D/A: ${match.kills ?? "—"} / ` +
                `${match.deaths ?? "—"} / ${match.assists ?? "—"}`;
        } else {
            kd.textContent = "K/D/A: Indisponibil";
        }

        card.append(mapName, result, date, score, kd);
        matchesContainer.appendChild(card);
    });
}

function renderDashboard(data) {
    if (!data || typeof data !== "object") {
        showState("error", "Datele primite nu sunt valide.");
        return;
    }

    const player = data.player || {};
    const stats = data.stats || {};
    const matches = Array.isArray(data.matches) ? data.matches : [];

    const hasData =
        Boolean(player.nickname) ||
        stats.elo !== undefined ||
        stats.kdRatio !== undefined ||
        stats.winRate !== undefined ||
        matches.length > 0;

    if (!hasData) {
        showState("empty");
        return;
    }

    playerName.textContent = player.nickname || "Jucător FACEIT";

    renderStats(stats);
    renderMatches(matches);

    showState("dashboard");
}

function showLoading() {
    showState("loading");
}

function showError(message) {
    showState("error", message);
}

window.CS2StatsUI = {
    showLoading,
    showError,
    renderDashboard
};
const demoPlayers = [
    {
        player: { nickname: "AWP_Master" },
        stats: { elo: 2450, kdRatio: 1.42, winRate: 64.5 },
        matches: [
            {
                map: "de_mirage",
                result: "win",
                date: "2026-10-18T18:30:00Z",
                score: "13:8",
                kills: 28,
                deaths: 17,
                assists: 6
            },
            {
                map: "de_ancient",
                result: "win",
                date: "2026-10-17T20:00:00Z",
                score: "13:10",
                kills: 22,
                deaths: 18,
                assists: 4
            }
        ]
    },
    {
        player: { nickname: "HeadshotKing" },
        stats: { elo: 1870, kdRatio: 1.18, winRate: 57.2 },
        matches: [
            {
                map: "de_inferno",
                result: "loss",
                date: "2026-10-18T16:00:00Z",
                score: "10:13",
                kills: 21,
                deaths: 20,
                assists: 8
            },
            {
                map: "de_dust2",
                result: "win",
                date: "2026-10-16T19:15:00Z",
                score: "13:7",
                kills: 25,
                deaths: 14,
                assists: 3
            }
        ]
    },
    {
        player: { nickname: "ClutchGod" },
        stats: { elo: 1620, kdRatio: 1.05, winRate: 51.8 },
        matches: [
            {
                map: "de_nuke",
                result: "win",
                date: "2026-10-18T14:00:00Z",
                score: "13:11",
                kills: 24,
                deaths: 22,
                assists: 9
            },
            {
                map: "de_mirage",
                result: "loss",
                date: "2026-10-17T17:30:00Z",
                score: "9:13",
                kills: 18,
                deaths: 21,
                assists: 5
            }
        ]
    },
    {
        player: { nickname: "EntryFragger" },
        stats: { elo: 1280, kdRatio: 0.94, winRate: 46.3 },
        matches: [
            {
                map: "de_anubis",
                result: "win",
                date: "2026-10-18T12:00:00Z",
                score: "13:6",
                kills: 19,
                deaths: 15,
                assists: 7
            },
            {
                map: "de_inferno",
                result: "loss",
                date: "2026-10-16T21:00:00Z",
                score: "8:13",
                kills: 16,
                deaths: 22,
                assists: 4
            }
        ]
    },
    {
        player: { nickname: "CosminCS" },
        stats: { elo: 2050, kdRatio: 1.31, winRate: 60.0 },
        matches: [
            {
                map: "de_dust2",
                result: "win",
                date: "2026-10-19T10:00:00Z",
                score: "13:9",
                kills: 27,
                deaths: 18,
                assists: 5
            },
            {
                map: "de_ancient",
                result: "win",
                date: "2026-10-17T15:00:00Z",
                score: "13:5",
                kills: 23,
                deaths: 12,
                assists: 8
            }
        ]
    }
];

const playerSelector = document.getElementById("player-selector");

demoPlayers.forEach((data, index) => {
    const option = document.createElement("option");

    option.value = index;
    option.textContent = data.player.nickname;

    playerSelector.appendChild(option);
});

function selectPlayer() {
    const index = Number(playerSelector.value);
    const selectedPlayer = demoPlayers[index];

    if (selectedPlayer) {
        CS2StatsUI.renderDashboard(selectedPlayer);
    }
}

playerSelector.addEventListener("change", selectPlayer);

selectPlayer();
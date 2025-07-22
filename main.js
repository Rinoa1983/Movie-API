const movieIds = [
            [
                "tt0120737",
                "tt0167261",
                "tt0167260",
                "tt0903624",
                "tt1170358",
                "tt2310332",
            ],
            [
                "tt0108941",
                "tt0099864",
                "tt1212452",
                "tt0120689",
                "tt0109642",
                "tt0118460",
            ],
            [
                "tt0079945",
                "tt0084726",
                "tt0088170",
                "tt0092007",
                "tt0098382",
                "tt0102975",
            ],
        ];

        document.addEventListener("DOMContentLoaded", function () {
            // --- Watchlist Funktionen ---
            function getWatchlist() {
                return JSON.parse(localStorage.getItem("watchlist") || "[]");
            }
            function saveWatchlist(list) {
                localStorage.setItem("watchlist", JSON.stringify(list));
            }
            function toggleWatchlist(id) {
                let list = getWatchlist();
                if (list.includes(id)) {
                    list = list.filter(x => x !== id);
                } else {
                    list.push(id);
                }
                saveWatchlist(list);
                renderWatchlist();
                loadAllRows();
            }
            function isInWatchlist(id) {
                return getWatchlist().includes(id);
            }
            function animateHeart(el) {
                el.classList.add("animate-heart");
                setTimeout(() => el.classList.remove("animate-heart"), 300);
            }

            // --- Kartenfunktion ---
            async function renderCards(container, ids) {
                let cardsHtml = "";
                for (const id of ids) {
                    try {
                        const response = await fetch(`https://www.omdbapi.com/?i=${id}&apikey=d66efe54`);
                        const movie = await response.json();
                        const heartClass = isInWatchlist(id) ? "fa-solid" : "fa-regular";
                        cardsHtml += `
                    <div class="card">
                        <h4>
                            ${movie.Title}
                            <i class="fa-heart ${heartClass} heart-icon" data-id="${id}"></i>
                        </h4>
                        <div class="img-container">
                            <img src="${movie.Poster}" alt="Poster" class="card-img">
                            <div class="plot">${movie.Plot}</div>
                        </div>
                    </div>
                `;
                    } catch (e) { }
                }
                container.innerHTML = cardsHtml;
                container.querySelectorAll(".heart-icon").forEach(icon => {
                    icon.onclick = function () {
                        animateHeart(this);
                        toggleWatchlist(this.dataset.id);
                    };
                });
            }

            // --- Watchlist anzeigen ---
            function renderWatchlist() {
                const list = getWatchlist();
                const row = document.getElementById("watchlist-row");
                const cards = document.getElementById("watchlist-cards");
                if (list.length === 0) {
                    row.style.display = "none";
                    cards.innerHTML = "";
                    return;
                }
                row.style.display = "block";
                renderCards(cards, list);
            }

            // --- Hauptreihen laden ---
            async function loadAllRows() {
                for (let row = 0; row < movieIds.length; row++) {
                    const container = document.getElementById(`movierow-${row + 1}`);
                    await renderCards(container, movieIds[row]);
                }
                renderWatchlist();
            }

            // --- Initiales Laden ---
            loadAllRows();

            // --- Suchfunktion ---
            const searchInput = document.getElementById("searchmovie");
            const searchBtn = document.getElementById("searchBtn");
            const searchDiv = document.getElementById("moviesearch");
            const searchHeading = document.getElementById("searchheading");
            const searchContainer = document.getElementById("searchDiv");

            // Anfangs ausblenden
            searchContainer.style.display = "none";
            searchHeading.style.display = "none";
            searchDiv.innerHTML = "";

            searchBtn.addEventListener("click", async function () {
                const query = searchInput.value.trim();
                if (!query) {
                    searchContainer.style.display = "none";
                    searchHeading.style.display = "none";
                    searchDiv.innerHTML = "";
                    return;
                }

                // Spinner anzeigen
                searchDiv.innerHTML = `<i class="fa-solid fa-spinner my-spinner"></i>`;
                searchContainer.style.display = "block";
                searchHeading.style.display = "block";

                // OMDb-API Suche
                const response = await fetch(`https://www.omdbapi.com/?s=${encodeURIComponent(query)}&apikey=d66efe54`);
                const data = await response.json();

                if (data.Search && data.Search.length > 0) {
                    let cardsHtml = "";
                    for (const movie of data.Search) {
                        try {
                            // Detaildaten für Plot
                            const detailResponse = await fetch(`https://www.omdbapi.com/?i=${movie.imdbID}&apikey=d66efe54`);
                            const detail = await detailResponse.json();
                            const heartClass = isInWatchlist(movie.imdbID) ? "fa-solid" : "fa-regular";
                            cardsHtml += `
                        <div class="card">
                            <h4>
                                ${detail.Title}
                                <i class="fa-heart ${heartClass} heart-icon" data-id="${movie.imdbID}"></i>
                            </h4>
                            <div class="img-container">
                                <img src="${detail.Poster}" alt="Poster" class="card-img">
                                <div class="plot">${detail.Plot}</div>
                            </div>
                        </div>
                    `;
                        } catch (e) { }
                    }
                    searchDiv.innerHTML = cardsHtml;
                    // Herz-EventListener & Animation für Suchergebnisse
                    searchDiv.querySelectorAll(".heart-icon").forEach(icon => {
                        icon.onclick = function () {
                            animateHeart(this);
                            toggleWatchlist(this.dataset.id);
                        };
                    });
                }
            });
        });
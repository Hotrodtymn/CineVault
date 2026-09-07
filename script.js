const API_KEY = "cbced459";
const API_URL = "https://www.omdbapi.com/";

const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");

const movieGrid = document.getElementById("movieGrid");

const loading = document.getElementById("loading");
const errorMessage = document.getElementById("errorMessage");

const resultsTitle = document.getElementById("resultsTitle");
const resultCount = document.getElementById("resultCount");

const pagination = document.getElementById("pagination");

const modal = document.getElementById("movieModal");
const movieDetails = document.getElementById("movieDetails");
const closeModal = document.getElementById("closeModal");

let currentSearch = "Batman";
let currentPage = 1;


/* =========================
   SEARCH MOVIES
========================= */

async function searchMovies(query, page = 1) {

    if (!query.trim()) {
        return;
    }

    currentSearch = query;
    currentPage = page;

    showLoading();

    try {

        const response = await fetch(
            `${API_URL}?apikey=${API_KEY}&s=${encodeURIComponent(query)}&type=movie&page=${page}`
        );

        const data = await response.json();

        hideLoading();

        if (data.Response === "False") {

            showError();

            movieGrid.innerHTML = "";

            pagination.innerHTML = "";

            return;
        }

        hideError();

        resultsTitle.textContent = `Results for "${query}"`;

        resultCount.textContent =
            `${data.totalResults} movies`;

        displayMovies(data.Search);

        createPagination(
            Math.ceil(Number(data.totalResults) / 10)
        );

    } catch (error) {

        hideLoading();

        showError();

        console.error(error);

    }

}


/* =========================
   DISPLAY MOVIES
========================= */

function displayMovies(movies) {

    movieGrid.innerHTML = "";

    movies.forEach(movie => {

        const card = document.createElement("article");

        card.className = "movie-card";

        let posterHTML;

        if (movie.Poster && movie.Poster !== "N/A") {

            posterHTML = `
                <img
                    class="poster"
                    src="${movie.Poster}"
                    alt="${movie.Title}"
                    loading="lazy"
                >
            `;

        } else {

            posterHTML = `
                <div class="no-poster">
                    <i class="fa-solid fa-film"></i>
                </div>
            `;

        }

        card.innerHTML = `

            ${posterHTML}

            <div class="movie-info">

                <div class="movie-title">
                    ${movie.Title}
                </div>

                <div class="movie-meta">

                    <span class="movie-type">
                        ${movie.Year}
                    </span>

                    <span>
                        ${movie.Type}
                    </span>

                </div>

            </div>

        `;

        card.addEventListener(
            "click",
            () => getMovieDetails(movie.imdbID)
        );

        movieGrid.appendChild(card);

    });

}


/* =========================
   MOVIE DETAILS
========================= */

async function getMovieDetails(imdbID) {

    modal.classList.add("show");

    movieDetails.innerHTML = `

        <div class="loading" style="display:block">

            <div class="spinner"></div>

            <p>Loading movie...</p>

        </div>

    `;

    try {

        const response = await fetch(
            `${API_URL}?apikey=${API_KEY}&i=${imdbID}&plot=full`
        );

        const movie = await response.json();

        if (movie.Response === "False") {

            movieDetails.innerHTML = `
                <div class="error-message" style="display:block">
                    Unable to load movie details.
                </div>
            `;

            return;
        }

        let poster;

        if (movie.Poster && movie.Poster !== "N/A") {

            poster = `
                <img
                    class="details-poster"
                    src="${movie.Poster}"
                    alt="${movie.Title}"
                >
            `;

        } else {

            poster = `
                <div class="no-poster details-poster">
                    <i class="fa-solid fa-film"></i>
                </div>
            `;

        }


        movieDetails.innerHTML = `

            <div class="details">

                ${poster}

                <div class="details-content">

                    <h2>
                        ${movie.Title}
                    </h2>

                    <p class="details-tagline">
                        ${movie.Year} • ${movie.Rated} • ${movie.Runtime}
                    </p>


                    <div class="details-meta">

                        <span>
                            <i class="fa-solid fa-star"></i>
                            ${movie.imdbRating}
                        </span>

                        <span>
                            <i class="fa-solid fa-film"></i>
                            ${movie.Genre}
                        </span>

                        <span>
                            <i class="fa-solid fa-globe"></i>
                            ${movie.Language}
                        </span>

                    </div>


                    <h3>Overview</h3>

                    <p class="plot">
                        ${movie.Plot}
                    </p>


                    <div class="detail-row">
                        <strong>Director:</strong>
                        <span>${movie.Director}</span>
                    </div>

                    <div class="detail-row">
                        <strong>Actors:</strong>
                        <span>${movie.Actors}</span>
                    </div>

                    <div class="detail-row">
                        <strong>Writer:</strong>
                        <span>${movie.Writer}</span>
                    </div>

                    <div class="detail-row">
                        <strong>Released:</strong>
                        <span>${movie.Released}</span>
                    </div>

                    <div class="detail-row">
                        <strong>Awards:</strong>
                        <span>${movie.Awards}</span>
                    </div>

                </div>

            </div>

        `;

    } catch (error) {

        movieDetails.innerHTML = `
            <div class="error-message" style="display:block">
                Something went wrong loading this movie.
            </div>
        `;

        console.error(error);

    }

}


/* =========================
   PAGINATION
========================= */

function createPagination(totalPages) {

    pagination.innerHTML = "";

    const maxPages = Math.min(totalPages, 10);

    for (let i = 1; i <= maxPages; i++) {

        const button = document.createElement("button");

        button.textContent = i;

        if (i === currentPage) {
            button.classList.add("active");
        }

        button.addEventListener("click", () => {

            searchMovies(currentSearch, i);

            window.scrollTo({
                top: document.getElementById("movies").offsetTop - 30,
                behavior: "smooth"
            });

        });

        pagination.appendChild(button);

    }

}


/* =========================
   SEARCH BUTTON
========================= */

searchButton.addEventListener("click", () => {

    searchMovies(searchInput.value);

});


/* ENTER KEY */

searchInput.addEventListener("keydown", event => {

    if (event.key === "Enter") {

        searchMovies(searchInput.value);

    }

});


/* =========================
   QUICK SEARCH BUTTONS
========================= */

document.querySelectorAll("[data-search]").forEach(button => {

    button.addEventListener("click", () => {

        const query = button.dataset.search;

        searchInput.value = query;

        searchMovies(query);

        document.getElementById("movies").scrollIntoView({
            behavior: "smooth"
        });

    });

});


/* =========================
   CLOSE MODAL
========================= */

closeModal.addEventListener("click", () => {

    modal.classList.remove("show");

});


document.querySelector(".modal-backdrop").addEventListener(
    "click",
    () => {
        modal.classList.remove("show");
    }
);


/* ESC KEY */

document.addEventListener("keydown", event => {

    if (event.key === "Escape") {

        modal.classList.remove("show");

    }

});


/* =========================
   UI HELPERS
========================= */

function showLoading() {

    loading.style.display = "block";

    movieGrid.style.display = "none";

    pagination.style.display = "none";

    errorMessage.style.display = "none";

}


function hideLoading() {

    loading.style.display = "none";

    movieGrid.style.display = "grid";

    pagination.style.display = "flex";

}


function showError() {

    errorMessage.style.display = "block";

}


function hideError() {

    errorMessage.style.display = "none";

}


/* =========================
   INITIAL MOVIES
========================= */

searchMovies("Batman");
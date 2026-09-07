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
const sortSelect = document.getElementById("sortSelect");

const movieModal = document.getElementById("movieModal");
const modalBody = document.getElementById("modalBody");
const closeModal = document.getElementById("closeModal");

let currentSearch = "Batman";
let currentPage = 1;
let totalResults = 0;
let currentMovies = [];

/* =========================
   SEARCH MOVIES
========================= */

async function searchMovies(searchTerm, page = 1) {
  if (!searchTerm.trim()) {
    showError("Please enter a movie title.");
    return;
  }

  currentSearch = searchTerm;
  currentPage = page;

  movieGrid.innerHTML = "";
  pagination.innerHTML = "";
  errorMessage.style.display = "none";
  loading.style.display = "block";

  resultsTitle.textContent = `Results for "${searchTerm}"`;
  resultCount.textContent = "";

  try {
    const url =
      `${API_URL}?apikey=${API_KEY}` +
      `&s=${encodeURIComponent(searchTerm)}` +
      `&type=movie` +
      `&page=${page}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Network error");
    }

    const data = await response.json();

    loading.style.display = "none";

    if (data.Response === "False") {
      showError(data.Error || "No movies found.");
      return;
    }

    totalResults = Number(data.totalResults);

    resultCount.textContent = `${totalResults.toLocaleString()} movies found`;

    currentMovies = data.Search;

    displayMovies(currentMovies);

    createPagination();
  } catch (error) {
    loading.style.display = "none";

    showError("Something went wrong while searching. Please try again.");

    console.error(error);
  }
}

/* =========================
   DISPLAY MOVIES
========================= */

function displayMovies(movies) {
  if (!movies || movies.length === 0) {
    movieGrid.innerHTML = "";
    return;
  }

  let sortedMovies = [...movies];

  const sortType = sortSelect.value;

  /* TITLE A-Z */

  if (sortType === "title-asc") {
    sortedMovies.sort((a, b) => a.Title.localeCompare(b.Title));
  } else if (sortType === "title-desc") {
    /* TITLE Z-A */
    sortedMovies.sort((a, b) => b.Title.localeCompare(a.Title));
  } else if (sortType === "year-desc") {
    /* NEWEST */
    sortedMovies.sort((a, b) => getYear(b.Year) - getYear(a.Year));
  } else if (sortType === "year-asc") {
    /* OLDEST */
    sortedMovies.sort((a, b) => getYear(a.Year) - getYear(b.Year));
  }

  /* DISPLAY */

  movieGrid.innerHTML = "";

  sortedMovies.forEach((movie) => {
    const card = document.createElement("article");

    card.className = "movie-card";

    const poster =
      movie.Poster !== "N/A"
        ? movie.Poster
        : "https://via.placeholder.com/300x450?text=No+Poster";

    card.innerHTML = `

            <div class="poster-container">

                <img
                    src="${poster}"
                    alt="${escapeHTML(movie.Title)}"
                    loading="lazy"
                >

            </div>


            <div class="movie-info">

                <div class="movie-title">
                    ${escapeHTML(movie.Title)}
                </div>


                <div class="movie-meta">

                    <span>
                        ${movie.Year}
                    </span>

                    <span>
                        ${movie.Type}
                    </span>

                </div>

            </div>

        `;

    card.addEventListener("click", () => {
      getMovieDetails(movie.imdbID);
    });

    movieGrid.appendChild(card);
  });
}

/* =========================
   GET MOVIE DETAILS
========================= */

async function getMovieDetails(imdbID) {
  movieModal.classList.add("show");

  modalBody.innerHTML = `

        <div class="loading">
            Loading movie details...
        </div>

    `;

  try {
    const url =
      `${API_URL}?apikey=${API_KEY}` +
      `&i=${encodeURIComponent(imdbID)}` +
      `&plot=full`;

    const response = await fetch(url);

    const movie = await response.json();

    if (movie.Response === "False") {
      throw new Error(movie.Error);
    }

    const poster =
      movie.Poster !== "N/A"
        ? movie.Poster
        : "https://via.placeholder.com/300x450?text=No+Poster";

    modalBody.innerHTML = `

            <div class="modal-movie">


                <img
                    src="${poster}"
                    alt="${escapeHTML(movie.Title)}"
                >


                <div class="modal-details">


                    <h2>
                        ${escapeHTML(movie.Title)}
                    </h2>


                    <p>

                        <strong>
                            ${movie.Year}
                        </strong>

                        &nbsp; • &nbsp;

                        ${movie.Runtime}

                        &nbsp; • &nbsp;

                        ${movie.Rated}

                    </p>


                    <p>

                        <strong>
                            Genre:
                        </strong>

                        ${escapeHTML(movie.Genre)}

                    </p>


                    <p>

                        <strong>
                            Director:
                        </strong>

                        ${escapeHTML(movie.Director)}

                    </p>


                    <p>

                        <strong>
                            Cast:
                        </strong>

                        ${escapeHTML(movie.Actors)}

                    </p>


                    <p>

                        <strong>
                            IMDb Rating:
                        </strong>

                        ${movie.imdbRating}

                    </p>


                    <p>
                        ${escapeHTML(movie.Plot)}
                    </p>


                </div>

            </div>

        `;
  } catch (error) {
    modalBody.innerHTML = `

            <div
                class="error-message"
                style="display:block;"
            >

                Unable to load movie details.

            </div>

        `;

    console.error(error);
  }
}

/* =========================
   PAGINATION
========================= */

function createPagination() {
  pagination.innerHTML = "";

  const totalPages = Math.ceil(totalResults / 10);

  if (totalPages <= 1) {
    return;
  }

  /* PREVIOUS */

  const previousButton = document.createElement("button");

  previousButton.textContent = "← Previous";

  previousButton.disabled = currentPage === 1;

  previousButton.addEventListener("click", () => {
    if (currentPage > 1) {
      searchMovies(currentSearch, currentPage - 1);

      window.scrollTo({
        top: document.querySelector(".movies-section").offsetTop,
        behavior: "smooth",
      });
    }
  });

  pagination.appendChild(previousButton);

  /* PAGE NUMBERS */

  const startPage = Math.max(1, currentPage - 2);

  const endPage = Math.min(totalPages, currentPage + 2);

  for (let page = startPage; page <= endPage; page++) {
    const button = document.createElement("button");

    button.textContent = page;

    if (page === currentPage) {
      button.classList.add("active");
    }

    button.addEventListener("click", () => {
      searchMovies(currentSearch, page);

      window.scrollTo({
        top: document.querySelector(".movies-section").offsetTop,
        behavior: "smooth",
      });
    });

    pagination.appendChild(button);
  }

  /* NEXT */

  const nextButton = document.createElement("button");

  nextButton.textContent = "Next →";

  nextButton.disabled = currentPage === totalPages;

  nextButton.addEventListener("click", () => {
    if (currentPage < totalPages) {
      searchMovies(currentSearch, currentPage + 1);

      window.scrollTo({
        top: document.querySelector(".movies-section").offsetTop,
        behavior: "smooth",
      });
    }
  });

  pagination.appendChild(nextButton);
}

/* =========================
   ERROR MESSAGE
========================= */

function showError(message) {
  errorMessage.textContent = message;

  errorMessage.style.display = "block";

  movieGrid.innerHTML = "";

  pagination.innerHTML = "";
}

/* =========================
   SEARCH BUTTON
========================= */

searchButton.addEventListener("click", () => {
  searchMovies(searchInput.value.trim(), 1);
});

/* =========================
   ENTER KEY
========================= */

searchInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    searchMovies(searchInput.value.trim(), 1);
  }
});

/* =========================
   QUICK SEARCH BUTTONS
========================= */

document.querySelectorAll(".quick-btn").forEach((button) => {
  button.addEventListener("click", () => {
    const searchTerm = button.dataset.search;

    searchInput.value = searchTerm;

    searchMovies(searchTerm, 1);

    document.getElementById("movies").scrollIntoView({
      behavior: "smooth",
    });
  });
});

/* =========================
   SORT MOVIES
========================= */

sortSelect.addEventListener("change", () => {
  displayMovies(currentMovies);
});

/* =========================
   CLOSE MODAL
========================= */

closeModal.addEventListener("click", () => {
  movieModal.classList.remove("show");
});

/* =========================
   CLOSE MODAL OUTSIDE
========================= */

movieModal.addEventListener("click", (event) => {
  if (event.target === movieModal) {
    movieModal.classList.remove("show");
  }
});

/* =========================
   ESCAPE KEY
========================= */

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    movieModal.classList.remove("show");
  }
});

/* =========================
   GET YEAR
========================= */

function getYear(year) {
  const match = String(year).match(/\d{4}/);

  return match ? Number(match[0]) : 0;
}

/* =========================
   HTML ESCAPING
========================= */

function escapeHTML(value) {
  if (!value) {
    return "";
  }

  return String(value)
    .replace(/&/g, "&amp;")

    .replace(/</g, "&lt;")

    .replace(/>/g, "&gt;")

    .replace(/"/g, "&quot;")

    .replace(/'/g, "&#039;");
}

/* =========================
   INITIAL SEARCH
========================= */

searchMovies("Batman", 1);

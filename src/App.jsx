import { useEffect, useState } from "react";
import { isCancel } from "axios";
import { getPopularMovies, searchMovies } from "./api/tmdb";
import MovieCard from "./components/MovieCard";
import "./App.css";

export default function App() {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [query, setQuery] = useState("");
    const [search, setSearch] = useState("");

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [selectedMovie, setSelectedMovie] = useState(null);

    useEffect(() => {
        const controller = new AbortController();

        setLoading(true);
        setError(null);

        const request = search
            ? searchMovies(search, page, controller.signal)
            : getPopularMovies(page, controller.signal);

        request
            .then((data) => {
                if (page === 1) {
                    setMovies(data.results);
                } else {
                    setMovies((oldMovies) => [
                        ...oldMovies,
                        ...data.results
                    ]);
                }

                setTotalPages(data.total_pages);
                setLoading(false);
            })
            .catch((err) => {
                if (isCancel(err)) {
                    return;
                }

                setError("Couldn't load movies. Try again later.");
                setLoading(false);
            });

        return () => controller.abort();
    }, [search, page]);

    function handleSearch(e) {
        e.preventDefault();

        setPage(1);
        setMovies([]);
        setSelectedMovie(null);
        setSearch(query.trim());
    }

    function loadMore() {
        setPage(page + 1);
    }

    return (
        <main className="app">
            <h1>Movie Explorer</h1>

            <form onSubmit={handleSearch}>
                <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search movies..."
                />
                <button type="submit">Search</button>
            </form>

            {selectedMovie && (
                <section className="details">
                    <button
                        className="close-button"
                        onClick={() => setSelectedMovie(null)}
                    >
                        Close
                    </button>

                    <h2>{selectedMovie.title}</h2>

                    <p>
                        {selectedMovie.overview ||
                            "No overview available for this movie."}
                    </p>
                </section>
            )}

            {loading && page === 1 && <p>Loading...</p>}

            {error && <p className="error">{error}</p>}

            {!loading &&
                !error &&
                search &&
                movies.length === 0 && (
                    <p className="empty">
                        No results for "{search}"
                    </p>
                )}

            {!error && movies.length > 0 && (
                <div className="grid">
                    {movies.map((movie) => (
                        <MovieCard
                            key={movie.id}
                            movie={movie}
                            onSelect={setSelectedMovie}
                        />
                    ))}
                </div>
            )}

            {loading && page > 1 && <p>Loading more...</p>}

            {!loading &&
                !error &&
                movies.length > 0 &&
                page < totalPages && (
                    <button
                        className="load-more"
                        onClick={loadMore}
                    >
                        Load More
                    </button>
                )}
        </main>
    );
}

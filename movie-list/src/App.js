import { useEffect, useState } from "react";
import StarRating from './StarRating'



const average = (arr) =>
  arr.length ? arr.reduce((acc, cur) => acc + cur / arr.length, 0) : 0
const KEY = "6a93798a";
export default function App() {
  const [movies, setMovies] = useState([]);
  const [watched, setWatched] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [query, setQuery] = useState("");
  const tempquery = "interstellar"
  const [selectedId, setSelectedId] = useState(null)

  /* useEffect(function () {
    fetch(`http://www.omdbapi.com/?apikey=${Key}&s=interstellar`)
      .then((response) => response.json())
      .then((data) => setMovies(data.Search));
  }, []) */

  //whether components are re-rendered, depending on dependency array

  /* useEffect(function () {
    console.log('After initial render')
  }.[])
  useEffect(
    () => {
      console.log('After updating query')
    }, [query]
  );
  useEffect(
    () => {
      console.log('After every render')
    }
  ); */

  function handleSelectedMovie(id) {
    setSelectedId(selectedId => (id === selectedId) ? null : id);
  }
  function handleCloseMovie() {
    setSelectedId(null);
  }
  function handleAddWatched(movie) {
    setWatched(prevWatched => [...prevWatched, movie]);
  }
  function handleDeleteWatched(id) {
    setWatched(prevWatched => prevWatched.filter(movie => movie.imdbID !== id));
  }

  useEffect(
    () => {
      const controller = new AbortController();
      async function fetchMovies() {
        try {
          setIsLoading(true);
          setError("");

          const res = await fetch(
            `http://www.omdbapi.com/?apikey=${KEY}&s=${query}`,
            { signal: controller.signal }
          );

          if (!res.ok)
            throw new Error("Something went wrong with fetching movies");

          const data = await res.json();
          if (data.Response === "False") throw new Error("Movie not found");

          setMovies(data.Search);
          setError("");
        } catch (err) {
          if (err.name !== "AbortError") {
            console.log(err.message);
            if (err.name !== "AbortError") {
              setError(err.message);
            }
          }
        } finally {
          setIsLoading(false);
        }
      }
      if (query.length < 3) {
        setMovies([]);
        setError("");
        return
      }
      handleCloseMovie();
      fetchMovies();
      return function () {
        //clean up fetching data every re-render
        //controller will abort fetch request 
        controller.abort();
      }
    }, [query]
  );


  return (
    <>
      <Nav>
        <Logo />
        <Search query={query} setQuery={setQuery} />
        <NumResults movies={movies} />
      </Nav>
      <Main>
        <Box >
          {/* {isLoading ? <Loader /> : <MovieList movies={movies} />} */}
          {isLoading && <Loader />}
          {!isLoading && !error && <MovieList movies={movies} onSelectedMovie={handleSelectedMovie} />}
          {error && <ErrorMessage message={error} />}
        </Box>
        <Box>
          {selectedId ? (
            <MovieDetails
              selectedId={selectedId}
              onCloseMovie={handleCloseMovie}
              onAddWatched={handleAddWatched}
              watched={watched} />
          ) : (
            <>
              <Summary watched={watched} />
              <WatchList watched={watched} onDeleteWached={handleDeleteWatched} />
            </>)
          }
        </Box>


      </Main>


    </>
  );
}


function ErrorMessage({ message }) {
  return (
    <p className="error">
      {message}
    </p>
  )
}


function Loader() {
  return (
    <p className="loader"> Loading....</p>
  )
}
function Nav({ children }) {

  return (
    <nav className="nav-bar">
      {children}
    </nav>
  )
}
function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  )
}
function Search({ query, setQuery }) {

  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />)
}
function NumResults({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  )
}

function Main({ children }) {


  return (
    <main className="main">

      {children}

    </main>)
}
function Box({ children }) {

  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="box">
      <button
        className="btn-toggle"
        onClick={() => setIsOpen((open) => !open)}
      >
        {isOpen ? "–" : "+"}
      </button>
      {/* allow for any children(component) to be in */}
      {isOpen && children}
    </div>
  )
}



function MovieList({ movies, onSelectedMovie }) {

  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie movie={movie} key={movie.imdbID} onSelectedMovie={onSelectedMovie} />
      ))}
    </ul>
  )
}
function Movie({ movie, onSelectedMovie }) {
  return (
    <li onClick={() => onSelectedMovie(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  )

}

function MovieDetails({ selectedId, onCloseMovie, onAddWatched, watched }) {
  const [movie, setMovie] = useState({})
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userRating, setUserRating] = useState('');
  const isWatched = watched.map((movie) => movie.imdbID).includes(selectedId);
  const watchedUserRating = watched.find(
    (movie) => movie.imdbID === selectedId
  )?.userRating;
  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre,
  } = movie;
  function handleAdd() {
    const newWatchMovie = {
      imdbID: selectedId,
      title,
      year,
      poster,
      imdbRating: Number(imdbRating),
      runtime: Number(runtime.split(" ").at(0)),
      userRating
    }
    //console.log(newWatchMovie);
    onAddWatched(newWatchMovie)
    onCloseMovie()
  }
  useEffect(function () {
    function callback(e) {
      if (e.code === 'Escape') {
        onCloseMovie();
        console.log('CLOSING')
      }
    }
    document.addEventListener('keydown', callback)
    return function () {
      document.removeEventListener('keydown', callback);
    }
  }, [onCloseMovie])
  useEffect(
    function () {
      async function getMovieDetails() {
        setIsLoading(true);
        setError(null);
        try {
          const res = await fetch(`http://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`);
          const data = await res.json();
          if (data.Response === "False") throw new Error("Movie not found");
          setMovie(data)

        }
        catch (err) {
          console.log(err.message);
          setError(err.message);

        }
        finally {
          setIsLoading(false);
        }
      }
      getMovieDetails();
    }, [selectedId]
  );
  useEffect(
    function () {
      if (!title) return
      document.title = `Movie | ${title}`;

      //clean up fn runs after component is unmounted
      return function () {
        document.title = "usePopcorn";
        //console.log(`Clean up effect for movie ${title}`)
        //althoguh component is unmounted, js engine will still remember what title is because of closure
      }
    }, [title]
  )
  return (
    <div className="details">
      {isLoading ? (<Loader />) : (<><header>
        <button className="btn-back" onClick={onCloseMovie}>&larr;</button>
        <img src={poster} alt={`Poster of ${movie} movie`} />
        <div className="details-overview">
          <h2>{title}</h2>
          <p>
            {released} &bull; {runtime}
          </p>
          <p>{genre}</p>
          <p>
            <span>⭐️</span>
            {imdbRating} IMDb rating
          </p>
        </div>
      </header>
        <section>
          <div className="Rating">
            {!isWatched ? (
              <>
                <StarRating
                  maxRating={10}
                  size={24}
                  onSetRating={setUserRating}
                />
                {userRating > 0 && (
                  <button className="btn-add" onClick={handleAdd}>
                    + Add to list
                  </button>
                )}
              </>
            ) : (
              <p>
                You rated with movie {watchedUserRating} <span>⭐️</span>
              </p>
            )}
          </div>
          <p>
            <em>{plot}</em>
          </p>
          <p>Starring {actors}</p>
          <p>Directed by {director}</p>
        </section></>)
      }

    </div >
  )
}

function Summary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));
  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{isNaN(avgImdbRating) ? '0' : avgImdbRating.toFixed(2)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{isNaN(avgUserRating) ? '0' : avgUserRating.toFixed(2)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{isNaN(avgRuntime) ? '0' : avgRuntime.toFixed(2)} min</span>
        </p>
      </div>
    </div>
  )
}

function WatchList({ watched, onDeleteWached }) {
  return (
    <ul className="list">
      {watched.map(movie => (
        <WatchMovie
          movie={movie}
          key={movie.imdbID}
          onDeleteWached={(onDeleteWached)} />))}
    </ul>)
}
function WatchMovie({ movie, onDeleteWached }) {
  return (
    <li key={movie.imdbID}>
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>
        <button className="btn-delete" onClick={() => onDeleteWached(movie.imdbID)}>

        </button>
      </div>
    </li>
  )
}
import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom'
import { TSR, Resource } from '../../src'

/* Define your resource type */
type Movie = { episode_id: string; title: string }
type MoviesResource = Resource<Movie[], Error>

const fetchMovies = () => {
  /* https://swapi.dev/documentation#films */
  return fetch('https://swapi.dev/api/films/')
}

const MoviesApp = () => {
  /* Initialize movies resource */
  const [movies, setMovies] = useState<MoviesResource>(TSR.initial)

  useEffect(() => {
    setMovies(TSR.loading)
    fetchMovies()
      .then(async res => {
        if (res.ok) {
          const { results } = await res.json()
          /* uncomment to delay success */
          // await new Promise(r => setTimeout(r, 1000))
          setMovies(TSR.success(results))
        } else {
          throw new Error('Not ok!')
        }
      })
      .catch(error => {
        /* Or set the error */
        setMovies(TSR.failure(error))
      })
  }, [])

  return (
    <div>
      <h1>Star Wars films</h1>
      {TSR.fold(movies, {
        /* Unpack resource value and handle all possible states */
        initial: () => /* nothing is there */ null,
        loading: () => <div>loading movies...</div>,
        failure: error => <div>error: {error.message}</div>,
        success: movies => (
          <ul>
            {movies.map(movie => (
              <li key={movie.episode_id}>{movie.title}</li>
            ))}
          </ul>
        ),
      })}
    </div>
  )
}

ReactDOM.render(<MoviesApp />, document.getElementById('root'))

# TSR: Typescript Resource

![SWR](https://ulianov.dev/tsr/banner.png)

**Resource** is an [ADT (Algebraic Data Type)](https://wiki.haskell.org/Algebraic_data_type), that is heavily inspired by [Remote Data](https://github.com/krisajenkins/remotedata). You can read more about it in this [post](http://blog.jenkster.com/2016/06/how-elm-slays-a-ui-antipattern.html).

## Install

You can install this package using `npm` or `yarn`. To get the full type inference with
curried functions it's recommended to use `pipe` function from [fp-ts](https://github.com/gcanti/fp-ts).

```bash
npm install --save @throned/resource-ts fp-ts
```

```bash
yarn add @throned/resource-ts fp-ts
```

## React example

```tsx
import React, { useState, useEffect } from 'react'
import { TSR, Resource } from '@throned/tsr'

type Movie = { episode_id: string; title: string }
type MoviesResource = Resource<Movie[], Error>

const MoviesApp = () => {
  const [movies, setMovies] = useState<MoviesResource>(TSR.initial)

  useEffect(() => {
    setMovies(TSR.loading)
    /* Fetch all Star Wars films https://swapi.dev/documentation#films */
    fetch('https://swapi.dev/api/films/')
      .then(async res => {
        const { results } = await res.json()
        setMovies(TSR.success(results))
      })
      .catch(error => setMovies(TSR.failure(error)))
  }, [])

  return (
    <div>
      <h1>Star Wars films</h1>
      {TSR.fold(movies, {
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
```

## Resource

Simply put, **Resource** is representation of some asynchronous data in type-safe way that also allows you to drop `boolean` flags (such as `isLoading` or `isError`) and forces you to handle all possible states.

**`Resource<A, E>`** is a sum type of four possible states: `Initial`, `Loading`, `Success<`**`A`**`>` and `Failure<`**`E`**`>`, where **A** - is a type of data and **E** - is a type of error.

## Constructors

To represent resource in Initial or Loading state use `initial` and `loading` constants. To represent resource in `Success` or `Failure` state use `success` and `failure` constructors.

```ts
import { of, initial, loading, failure, success, Resource } from '@throned/tsr'

initial // {tag: 'Initial'}
loading // {tag: 'Loading'}
success({ title: 'Blade Runner' }) // {tag: 'Success', value: {title: 'Blade Runner'}}
failure(new Error('noop')) // {tag: 'Failure', error: Error('nope')}

of({ title: 'Matrix' }) // works as success
```

Also there are to useful helper methods that can construct a resource: `fromNullable` and `tryCatch`.

**`fromNullable: (a: A | null | undefined) => Success<A> | Initial`**

```ts
import { fromNullable } from '@throned/tsr'

/* Returns Success with the value passed */
fromNullable('Matrix') // {tag: 'Success', value: {title: 'Matrix'}}

/* Returns Initial for null and undefined */
fromNullable(null) // {tag: 'Initial'}
```

**`tryCatch: (f: () => A) => Success<A> | Failure<E>`**

```ts
import { tryCatch } from '@throned/tsr'

const exsplosiveRandom = (): number => {
  const rand = Math.random()
  if (rand > 0.5) {
    throw new Error('Boom!')
  }
  return rand
}

/* tryCatch accepts a thunk that return a value but may fail */
const rand: Resource<number, Error> = tryCatch(exsplosiveRandom)
rand // Success with random number or Failure(Error('Boom!'))
```

## Working with multiple resources

Sometimes you have to work with more than one resource, so let's imagine next situation.

```ts
import { TSR } from '@throned/tsr'

// You have multiply function
const multiply = (x: number, { times }: { times: number }) => {
  return x * times
}

// And you have two resources: number and times to multiply
const number = TSR.of(42)
const mulOptions = TSR.of({ times: 10 })
```

There are few ways of how you can call `multiply` function with values of these resources. These ways are described below, but feel free to skip them and see `combine` if you just interested in the actual library approach.

**`chain`**

```ts
import { TSR } from '@throned/tsr'
import { pipe } from 'fp-ts/pipeable'

const multiply = (x: number, { times }: { times: number }) => {
  return x * times
}

const number = TSR.of(42)
const mulOptions = TSR.of({ times: 10 })

const result = TSR.chain(number, n => TSR.map(mulOptions, o => multiply(n, o)))
TSR.tap(result, console.log) // 420
```

**`ap`**

```ts
import { TSR } from '@throned/tsr'

/* First, we have to make a curried version of multiply */
const multiply = (x: number) => ({ times }: { times: number }) => {
  return x * times
}

const number = of(42)
const mulOptions = of({ times: 10 })

/**
 * You can define useful function that uses ap and map to apply a function to resources
 * To see why this functions is not included in the lib check the next example
 */
const lift2 = <A, B, C, E>(
  a: Resource<A, E>,
  b: Resource<B, E>,
  f: (a: A) => (b: B) => C,
): Resource<C, E> => {
  return TSR.ap(b, TSR.map(a, f))
}

const result = lift2(number, mulOptions, multiply)
TSR.tap(result, console.log) // 420
```

**`combine`**

You don't have to understand FP concepts like applicative to use multiple resources, instead you can use a simple function that merges resources in a predictive way.
If all passed resource are Success then result is Success that holds a tuple with all values, otherwise result is a fallback to first resource that is not Success.

```ts
import { of, combine, map, tap } from '@throned/tsr'

const multiply = (x: number, { times }: { times: number }) => {
  return x * times
}

const args = TSR.combine(number, mulOptions) // Success<[number, {times: number}]>
const result = TSR.map(args, ([number, options]) => multiply(number, options))
TSR.tap(result, console.log) // 420
```

In addition to than `combine` can merge more than two resources into one.

```ts
import { combine, of } from '@throned/tsr'

combine(of(1), of(2), of({ three: true })) // Success<[number, number, {three: boolean}]>
combine(of(1), of(2), of('3'), of('4'), of(true)) // Success<[number, number, string, string, boolean]>
```

## API style

All functions are available via direct import or TSR namespace.

```ts
import { of, map, TSR } from '@throned/tsr'
import { pipe } from 'fp-ts/pipeable'

/* Regular-style functions (similar to lodash) */
TSR.map(TSR.of(10), a => a * 10) // success(100)

/* Curried functions where actual resource comes last, shines with fp-ts pipe thanks to type inference */
pipe(
  of(10),
  map(a => a * 10),
) // success(100)
```

## API

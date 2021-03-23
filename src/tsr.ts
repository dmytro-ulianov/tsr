type InitialTag = 'Initial'
type LoadingTag = 'Loading'
type FailureTag = 'Failure'
type SuccessTag = 'Success'

export type Tag = InitialTag | LoadingTag | FailureTag | SuccessTag

export type Initial = { tag: InitialTag }
export type Loading = { tag: LoadingTag }
export type Failure<E> = { tag: FailureTag; error: E }
export type Success<A> = { tag: SuccessTag; value: A }

export type Resource<A, E> = Initial | Loading | Success<A> | Failure<E>

type AnyResource = Resource<unknown, unknown>

/**
 * Represents resource that was not requested
 */
export const initial: Initial = { tag: 'Initial' }

/**
 * Represents resource that is requested but not loaded yet
 */
export const loading: Loading = { tag: 'Loading' }

/**
 * Represents resource that holds error of failed request
 */
export const failure = <E>(error: E): Failure<E> => ({ tag: 'Failure', error })

/**
 * Represents resource that holds value of succeded request
 */
export const success = <A>(value: A): Success<A> => ({ tag: 'Success', value })

/**
 * Creates resource with value
 */
export const of = success

/**
 * Tags dictionary
 */
export const tag = {
  initial: 'Initial',
  loading: 'Loading',
  failure: 'Failure',
  success: 'Success',
} as const

export const fromNullable = <A>(value: A | null | undefined) => {
  return value == null ? initial : success(value)
}

export const tryCatch = <A, E = unknown>(f: () => A) => {
  try {
    return success<A>(f())
  } catch (error) {
    return failure<E>(error)
  }
}

export const map = <A, B>(f: (value: A) => B) => <E>(
  resource: Resource<A, E>,
): Resource<B, E> => {
  return resource.tag === 'Success' ? success(f(resource.value)) : resource
}

export const chain = <A, B, E>(f: (value: A) => Resource<B, E>) => (
  resource: Resource<A, E>,
) => {
  return resource.tag === 'Success' ? f(resource.value) : resource
}

export const alt = <A, E>(def: () => Resource<A, E>) => (
  resource: Resource<A, E>,
): Resource<A, E> => {
  return resource.tag === 'Success' ? resource : def()
}

export const mapFailure = <E, E1>(f: (error: E) => E1) => <A>(
  resource: Resource<A, E>,
): Resource<A, E1> => {
  return resource.tag === 'Failure' ? failure(f(resource.error)) : resource
}

export const bimap = <A, E, B, E1>(
  fa: (value: A) => B,
  fe: (error: E) => E1,
) => (resource: Resource<A, E>): Resource<B, E1> => {
  if (resource.tag === 'Success') return success(fa(resource.value))
  if (resource.tag === 'Failure') return failure(fe(resource.error))
  return resource
}

export const tap = <A>(f: (value: A) => void) => <E>(
  resource: Resource<A, E>,
): Resource<A, E> => {
  if (resource.tag === 'Success') {
    f(resource.value)
  }
  return resource
}

export const tapFailure = <E>(f: (error: E) => void) => <A>(
  resource: Resource<A, E>,
): Resource<A, E> => {
  if (resource.tag === 'Failure') {
    f(resource.error)
  }
  return resource
}

export const getOrElse = <A>(def: () => A) => <E>(
  resource: Resource<A, E>,
): A => {
  return resource.tag === 'Success' ? resource.value : def()
}

export const ap = <A, B, E>(fresource: Resource<(a: A) => B, E>) => (
  resource: Resource<A, E>,
): Resource<B, E> => {
  if (resource.tag === 'Success') {
    return fresource.tag === 'Success'
      ? success(fresource.value(resource.value))
      : fresource
  }
  return resource
}

export const recover = <A, E>(f: (error: E) => A | undefined) => (
  resource: Resource<A, E>,
): Resource<A, E> => {
  if (resource.tag === 'Failure') {
    const recovered = f(resource.error)
    return recovered !== undefined ? success(recovered) : resource
  }
  return resource
}

export const fold = <A, E, RI, RL, RF, RS>(
  initial: () => RI,
  loading: () => RL,
  failure: (error: E) => RF,
  success: (value: A) => RS,
  // eslint-disable-next-line max-params
) => (resource: Resource<A, E>): RI | RL | RF | RS => {
  switch (resource.tag) {
    case 'Initial': {
      return initial()
    }
    case 'Loading': {
      return loading()
    }
    case 'Failure': {
      return failure(resource.error)
    }
    case 'Success': {
      return success(resource.value)
    }
  }
}

export function combine<A, EE>(ra: Resource<A, EE>): Resource<[A], EE>
export function combine<A, B, EE>(
  ra: Resource<A, EE>,
  rb: Resource<B, EE>,
): Resource<[A, B], EE>
export function combine<A, B, C, EE>(
  ra: Resource<A, EE>,
  rb: Resource<B, EE>,
  rc: Resource<C, EE>,
): Resource<[A, B, C], EE>
export function combine<A, B, C, D, EE>(
  ra: Resource<A, EE>,
  rb: Resource<B, EE>,
  rc: Resource<C, EE>,
  rd: Resource<D, EE>,
): Resource<[A, B, C, D], EE>
export function combine<A, B, C, D, E, EE>(
  ra: Resource<A, EE>,
  rb: Resource<B, EE>,
  rc: Resource<C, EE>,
  rd: Resource<D, EE>,
  re: Resource<E, EE>,
): Resource<[A, B, C, D, E], EE>
export function combine<A, B, C, D, E, F, EE>(
  ra: Resource<A, EE>,
  rb: Resource<B, EE>,
  rc: Resource<C, EE>,
  rd: Resource<D, EE>,
  re: Resource<E, EE>,
  rf: Resource<F, EE>,
): Resource<[A, B, C, D, E, F], EE>
export function combine<A, B, C, D, E, F, G, EE>(
  ra: Resource<A, EE>,
  rb: Resource<B, EE>,
  rc: Resource<C, EE>,
  rd: Resource<D, EE>,
  re: Resource<E, EE>,
  rf: Resource<F, EE>,
  rg: Resource<G, EE>,
): Resource<[A, B, C, D, E, F, G], EE>
export function combine<A, B, C, D, E, F, G, H, EE>(
  ra: Resource<A, EE>,
  rb: Resource<B, EE>,
  rc: Resource<C, EE>,
  rd: Resource<D, EE>,
  re: Resource<E, EE>,
  rf: Resource<F, EE>,
  rg: Resource<G, EE>,
  rh: Resource<H, EE>,
): Resource<[A, B, C, D, E, F, G, H], EE>
export function combine<E>(...resources: Array<Resource<any, E>>) {
  let combined: Resource<AnyResource[], E> = success([] as AnyResource[])
  for (const resource of resources) {
    if (resource.tag !== 'Success') {
      return resource
    }
    combined = ap(map(append)(combined))(resource)
  }
  return combined
}
function append(values: AnyResource[]) {
  return (value: AnyResource) => [...values, value]
}

export function unpackValue<A>(resource: Success<A>): A
export function unpackValue<E>(resource: Initial | Loading | Failure<E>): never
export function unpackValue<A, E>(resource: Resource<A, E>): A
export function unpackValue<A>(resource: Resource<A, unknown>) {
  if (resource.tag === 'Success') {
    return resource.value
  }
  throw new Error(`Can't unpack value from resource in ${resource.tag} state!`)
}

export function unpackError<E>(resource: Failure<E>): E
export function unpackError<A>(resource: Initial | Loading | Success<A>): never
export function unpackError<A, E>(resource: Resource<A, E>): E
export function unpackError<E>(resource: Resource<unknown, E>): E {
  if (resource.tag === 'Failure') {
    return resource.error
  }
  throw new Error(`Can't unpack error from resource in ${resource.tag} state!`)
}

interface TSR {
  initial: Initial
  loading: Loading
  failure: <E>(error: E) => Failure<E>
  success: <A>(value: A) => Success<A>
  of: <A>(value: A) => Success<A>

  tag: typeof tag

  fromNullable: <A>(value: A | null | undefined) => Initial | Success<A>
  tryCatch: <A, E = unknown>(f: () => A) => Failure<E> | Success<A>

  alt: <A, E>(
    resource: Resource<A, E>,
    def: () => Resource<A, E>,
  ) => Resource<A, E>

  ap: <A, B, E>(
    resource: Resource<A, E>,
    fresource: Resource<(a: A) => B, E>,
  ) => Resource<B, E>

  bimap: <A, E, B, E1>(
    resource: Resource<A, E>,
    fa: (value: A) => B,
    fe: (error: E) => E1,
  ) => Resource<B, E1>

  chain: <A, E, B>(
    resource: Resource<A, E>,
    f: (value: A) => Resource<B, E>,
  ) => Resource<B, E>

  combine<A, EE>(ra: Resource<A, EE>): Resource<[A], EE>
  combine<A, B, EE>(
    ra: Resource<A, EE>,
    rb: Resource<B, EE>,
  ): Resource<[A, B], EE>
  combine<A, B, C, EE>(
    ra: Resource<A, EE>,
    rb: Resource<B, EE>,
    rc: Resource<C, EE>,
  ): Resource<[A, B, C], EE>
  combine<A, B, C, D, EE>(
    ra: Resource<A, EE>,
    rb: Resource<B, EE>,
    rc: Resource<C, EE>,
    rd: Resource<D, EE>,
  ): Resource<[A, B, C, D], EE>
  combine<A, B, C, D, E, EE>(
    ra: Resource<A, EE>,
    rb: Resource<B, EE>,
    rc: Resource<C, EE>,
    rd: Resource<D, EE>,
    re: Resource<E, EE>,
  ): Resource<[A, B, C, D, E], EE>
  combine<A, B, C, D, E, F, EE>(
    ra: Resource<A, EE>,
    rb: Resource<B, EE>,
    rc: Resource<C, EE>,
    rd: Resource<D, EE>,
    re: Resource<E, EE>,
    rf: Resource<F, EE>,
  ): Resource<[A, B, C, D, E, F], EE>
  combine<A, B, C, D, E, F, G, EE>(
    ra: Resource<A, EE>,
    rb: Resource<B, EE>,
    rc: Resource<C, EE>,
    rd: Resource<D, EE>,
    re: Resource<E, EE>,
    rf: Resource<F, EE>,
    rg: Resource<G, EE>,
  ): Resource<[A, B, C, D, E, F, G], EE>
  combine<A, B, C, D, E, F, G, H, EE>(
    ra: Resource<A, EE>,
    rb: Resource<B, EE>,
    rc: Resource<C, EE>,
    rd: Resource<D, EE>,
    re: Resource<E, EE>,
    rf: Resource<F, EE>,
    rg: Resource<G, EE>,
    rh: Resource<H, EE>,
  ): Resource<[A, B, C, D, E, F, G, H], EE>

  fold: <A, E, RI, RL, RF, RS>(
    resource: Resource<A, E>,
    match: {
      initial: () => RI
      loading: () => RL
      failure: (error: E) => RF
      success: (value: A) => RS
    },
  ) => RI | RL | RF | RS

  getOrElse: <A, E>(resource: Resource<A, E>, def: () => A) => A

  map: <A, E, B>(resource: Resource<A, E>, f: (value: A) => B) => Resource<B, E>

  mapFailure: <A, E, E1>(
    resource: Resource<A, E>,
    fe: (error: E) => E1,
  ) => Resource<A, E1>

  recover: <A, E>(
    resource: Resource<A, E>,
    f: (error: E) => A | undefined,
  ) => Resource<A, E>

  tap: <A, E>(resource: Resource<A, E>, f: (value: A) => void) => Resource<A, E>

  tapFailure: <A, E>(
    resource: Resource<A, E>,
    fe: (error: E) => void,
  ) => Resource<A, E>

  unpackError<E>(resource: Failure<E>): E
  unpackError<A>(resource: Initial | Loading | Success<A>): never
  unpackError<A, E>(resource: Resource<A, E>): E

  unpackValue<A>(resource: Success<A>): A
  unpackValue<E>(resource: Initial | Loading | Failure<E>): never
  unpackValue<A, E>(resource: Resource<A, E>): A
}

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const TSR: TSR = {
  alt: (resource, def) => alt(def)(resource),
  ap: (resource, fresource) => ap(fresource)(resource),
  bimap: (resource, fa, fe) => bimap(fa, fe)(resource),
  chain: (resource, f) => chain(f)(resource),
  combine: combine,
  failure: failure,
  fold: (r, f) => fold(f.initial, f.loading, f.failure, f.success)(r),
  fromNullable: fromNullable,
  getOrElse: (resource, def) => getOrElse(def)(resource),
  initial: initial,
  loading: loading,
  map: (resource, f) => map(f)(resource),
  mapFailure: (resource, fe) => mapFailure(fe)(resource),
  of: of,
  recover: (resource, f) => recover(f)(resource),
  success: success,
  tag: tag,
  tap: (resource, f) => tap(f)(resource),
  tapFailure: (resource, fe) => tapFailure(fe)(resource),
  tryCatch: tryCatch,
  unpackError: unpackError,
  unpackValue: unpackValue,
}

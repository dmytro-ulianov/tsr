import { TSR, initial, loading, failure, success, Resource } from '../src'

const identity = <A>(a: A) => a
const f = (n: number) => n * 2
const g = (n: number) => n + 8
const fe = (s: string) => s + ' f'
const ge = (s: string) => s + ' g'

function getResources({ a = 10, e = 'noop' }: { a?: number; e?: string } = {}) {
  type R = Resource<number, string>
  return {
    ri: initial as R,
    rl: loading as R,
    rf: failure(e) as R,
    rs: success(a) as R,
  }
}

describe('constructors', () => {
  it('creates resources using each constructor', () => {
    const { ri, rl, rs, rf } = getResources()
    expect([ri, rl, rf, rs, TSR.of(42)]).toMatchInlineSnapshot(`
      Array [
        Object {
          "tag": "Initial",
        },
        Object {
          "tag": "Loading",
        },
        Object {
          "error": "noop",
          "tag": "Failure",
        },
        Object {
          "tag": "Success",
          "value": 10,
        },
        Object {
          "tag": "Success",
          "value": 42,
        },
      ]
    `)
  })

  it('creates resources using fromNullable', () => {
    expect([
      TSR.fromNullable(42),
      TSR.fromNullable(null),
      TSR.fromNullable(undefined),
    ]).toMatchInlineSnapshot(`
      Array [
        Object {
          "tag": "Success",
          "value": 42,
        },
        Object {
          "tag": "Initial",
        },
        Object {
          "tag": "Initial",
        },
      ]
    `)
  })

  it('creates resources using tryCatch', () => {
    expect([
      TSR.tryCatch(() => 'Win'),
      TSR.tryCatch(() => {
        throw new Error('Lose')
      }),
    ]).toMatchInlineSnapshot(`
      Array [
        Object {
          "tag": "Success",
          "value": "Win",
        },
        Object {
          "error": [Error: Lose],
          "tag": "Failure",
        },
      ]
    `)
  })
})

describe('map', () => {
  test('identity law', () => {
    const { ri, rl, rs, rf } = getResources()
    // r.map(a -> a) is equal r
    expect(TSR.map(ri, identity)).toEqual(ri)
    expect(TSR.map(rl, identity)).toEqual(rl)
    expect(TSR.map(rs, identity)).toEqual(rs)
    expect(TSR.map(rf, identity)).toEqual(rf)
  })

  test('composition law', () => {
    const { ri, rl, rs, rf } = getResources()
    // r.map(a -> f(g(a))) is equal r.map(g).map(f)
    expect(TSR.map(ri, number => f(g(number)))).toEqual(
      TSR.map(TSR.map(ri, g), f),
    )
    expect(TSR.map(rl, number => f(g(number)))).toEqual(
      TSR.map(TSR.map(rl, g), f),
    )
    expect(TSR.map(rf, number => f(g(number)))).toEqual(
      TSR.map(TSR.map(rf, g), f),
    )
    expect(TSR.map(rs, number => f(g(number)))).toEqual(
      TSR.map(TSR.map(rs, g), f),
    )
  })

  test('runs function only over success', () => {
    const { ri, rl, rs, rf } = getResources({ a: 50 })
    expect(TSR.map(ri, f)).toEqual(ri)
    expect(TSR.map(rl, f)).toEqual(rl)
    expect(TSR.map(rs, f)).toEqual(success(f(50)))
    expect(TSR.map(rf, f)).toEqual(rf)
  })
})

describe('mapFailure', () => {
  test('identity law', () => {
    const { ri, rl, rs, rf } = getResources()
    // r.mapFailure(a -> a) is equal r
    expect(TSR.mapFailure(ri, identity)).toEqual(ri)
    expect(TSR.mapFailure(rl, identity)).toEqual(rl)
    expect(TSR.mapFailure(rs, identity)).toEqual(rs)
    expect(TSR.mapFailure(rf, identity)).toEqual(rf)
  })

  test('composition law', () => {
    const { ri, rl, rs, rf } = getResources()
    // r.mapFailure(a -> f(g(a))) is equal r.mapFailure(g).mapFailure(f)
    expect(TSR.mapFailure(ri, string => fe(ge(string)))).toEqual(
      TSR.mapFailure(TSR.mapFailure(ri, ge), fe),
    )
    expect(TSR.mapFailure(rl, string => fe(ge(string)))).toEqual(
      TSR.mapFailure(TSR.mapFailure(rl, ge), fe),
    )
    expect(TSR.mapFailure(rf, string => fe(ge(string)))).toEqual(
      TSR.mapFailure(TSR.mapFailure(rf, ge), fe),
    )
    expect(TSR.mapFailure(rs, string => fe(ge(string)))).toEqual(
      TSR.mapFailure(TSR.mapFailure(rs, ge), fe),
    )
  })

  test('runs function only over failure', () => {
    const { ri, rl, rs, rf } = getResources({ e: 'a' })
    expect(TSR.mapFailure(ri, fe)).toEqual(ri)
    expect(TSR.mapFailure(rl, fe)).toEqual(rl)
    expect(TSR.mapFailure(rs, fe)).toEqual(rs)
    expect(TSR.mapFailure(rf, fe)).toEqual(failure(fe('a')))
  })
})

describe('bimap', () => {
  test('identity law', () => {
    const { ri, rl, rs, rf } = getResources()
    // r.bimap(a -> a, e -> e) is equal r
    expect(TSR.bimap(ri, identity, identity)).toEqual(ri)
    expect(TSR.bimap(rl, identity, identity)).toEqual(rl)
    expect(TSR.bimap(rs, identity, identity)).toEqual(rs)
    expect(TSR.bimap(rf, identity, identity)).toEqual(rf)
  })

  test('composition law', () => {
    const { ri, rl, rs, rf } = getResources()
    // r.bimap(a -> f(g(a)), e -> fe(ge(e))) is equal r.bimap(g, ge).bimap(f, fe)
    expect(
      TSR.bimap(
        ri,
        number => f(g(number)),
        e => fe(ge(e)),
      ),
    ).toEqual(TSR.bimap(TSR.bimap(ri, g, ge), f, fe))
    expect(
      TSR.bimap(
        rl,
        number => f(g(number)),
        e => fe(ge(e)),
      ),
    ).toEqual(TSR.bimap(TSR.bimap(rl, g, ge), f, fe))
    expect(
      TSR.bimap(
        rs,
        number => f(g(number)),
        e => fe(ge(e)),
      ),
    ).toEqual(TSR.bimap(TSR.bimap(rs, g, ge), f, fe))
    expect(
      TSR.bimap(
        rf,
        number => f(g(number)),
        e => fe(ge(e)),
      ),
    ).toEqual(TSR.bimap(TSR.bimap(rf, g, ge), f, fe))
  })

  test('runs function only over success and failure', () => {
    const { ri, rl, rs, rf } = getResources({ a: 50, e: 'a' })
    expect(TSR.bimap(ri, f, fe)).toEqual(ri)
    expect(TSR.bimap(rl, f, fe)).toEqual(rl)
    expect(TSR.bimap(rs, f, fe)).toEqual(success(f(50)))
    expect(TSR.bimap(rf, f, fe)).toEqual(failure(fe('a')))
  })
})

describe('chain', () => {
  test('associativity law', () => {
    // r.chain(g).chain(f) is equal r.chain(a => g(a).chain(f))
    const { ri, rl, rs, rf } = getResources()
    const f = (n: number) => success(`number ${n}`)
    const g = (n: number) => success(n + 8)
    expect(TSR.chain(TSR.chain(ri, g), f)).toEqual(
      TSR.chain(ri, n => TSR.chain(g(n), f)),
    )
    expect(TSR.chain(TSR.chain(rl, g), f)).toEqual(
      TSR.chain(rl, n => TSR.chain(g(n), f)),
    )
    expect(TSR.chain(TSR.chain(rs, g), f)).toEqual(
      TSR.chain(rs, n => TSR.chain(g(n), f)),
    )
    expect(TSR.chain(TSR.chain(rf, g), f)).toEqual(
      TSR.chain(rf, n => TSR.chain(g(n), f)),
    )
  })

  test('runs function only over success', () => {
    const { ri, rl, rs, rf } = getResources({ a: 50 })
    const f = (n: number) => success(n * 2)
    expect(TSR.chain(ri, f)).toEqual(ri)
    expect(TSR.chain(rl, f)).toEqual(rl)
    expect(TSR.chain(rs, f)).toEqual(f(50))
    expect(TSR.chain(rf, f)).toEqual(rf)
  })
})

describe('tap', () => {
  test('runs function only over success and returns always the same resource', () => {
    const { ri, rl, rs, rf } = getResources({ a: 50 })
    const f = jest.fn((n: number) => n * 2)
    expect(TSR.tap(ri, f)).toEqual(ri)
    expect(TSR.tap(rl, f)).toEqual(rl)
    expect(TSR.tap(rs, f)).toEqual(rs)
    expect(TSR.tap(rf, f)).toEqual(rf)
    expect(f).toBeCalledTimes(1)
    expect(f).toBeCalledWith(50)
  })
})

describe('tapFailure', () => {
  test('runs function only over failure and returns always the same resource', () => {
    const { ri, rl, rs, rf } = getResources({ e: 'a' })
    const fe = jest.fn((s: string) => s + 'f')
    expect(TSR.tapFailure(ri, fe)).toEqual(ri)
    expect(TSR.tapFailure(rl, fe)).toEqual(rl)
    expect(TSR.tapFailure(rs, fe)).toEqual(rs)
    expect(TSR.tapFailure(rf, fe)).toEqual(rf)
    expect(fe).toBeCalledTimes(1)
    expect(fe).toBeCalledWith('a')
  })
})

describe('alt', () => {
  test('associativity law', () => {
    // r.alt(g).alt(f) is equal r.alt(a => g(a).alt(f))
    const { ri, rl, rs, rf } = getResources()
    const f = () => success(100)
    const g = () => loading
    expect(TSR.chain(TSR.chain(ri, g), f)).toEqual(
      TSR.chain(ri, () => TSR.chain(g(), f)),
    )
    expect(TSR.chain(TSR.chain(rl, g), f)).toEqual(
      TSR.chain(rl, () => TSR.chain(g(), f)),
    )
    expect(TSR.chain(TSR.chain(rs, g), f)).toEqual(
      TSR.chain(rs, () => TSR.chain(g(), f)),
    )
    expect(TSR.chain(TSR.chain(rf, g), f)).toEqual(
      TSR.chain(rf, () => TSR.chain(g(), f)),
    )
  })

  test('distributivity law', () => {
    // r.alt(a, b).map(f) is equal r.alt(a.map(f), () -> b().map(f))
    const { ri, rl, rs, rf } = getResources({ a: 50 })
    const f = (n: number) => n * 2
    const b = () => success(0) as Resource<number, string>
    expect(TSR.map(TSR.alt(ri, b), f)).toEqual(
      TSR.alt(TSR.map(ri, f), () => TSR.map(b(), f)),
    )
    expect(TSR.map(TSR.alt(rl, b), f)).toEqual(
      TSR.alt(TSR.map(rl, f), () => TSR.map(b(), f)),
    )
    expect(TSR.map(TSR.alt(rf, b), f)).toEqual(
      TSR.alt(TSR.map(rf, f), () => TSR.map(b(), f)),
    )
    expect(TSR.map(TSR.alt(rs, b), f)).toEqual(
      TSR.alt(TSR.map(rs, f), () => TSR.map(b(), f)),
    )
  })

  test('uses function only when it is not success', () => {
    const { ri, rl, rs, rf } = getResources()
    const b = success(100)
    expect(TSR.alt(ri, () => b)).toEqual(b)
    expect(TSR.alt(rl, () => b)).toEqual(b)
    expect(TSR.alt(rs, () => b)).toEqual(rs)
    expect(TSR.alt(rf, () => b)).toEqual(b)
  })
})

describe('getOrElse', () => {
  test('returns resource value when success, otherwise returns fallback', () => {
    const { ri, rl, rs, rf } = getResources({ a: 10 })
    const f = () => 0
    expect(TSR.getOrElse(ri, f)).toEqual(0)
    expect(TSR.getOrElse(rl, f)).toEqual(0)
    expect(TSR.getOrElse(rs, f)).toEqual(10)
    expect(TSR.getOrElse(rf, f)).toEqual(0)
  })
})

describe('fold', () => {
  test('unpacks resource properly', () => {
    const { ri, rl, rs, rf } = getResources({ a: 10, e: 'noop' })
    const match = {
      initial: () => 'initial',
      loading: () => 'loading',
      failure: (e: string) => `failure ${e}`,
      success: (a: number) => `success ${a}`,
    }
    expect(TSR.fold(ri, match)).toEqual('initial')
    expect(TSR.fold(rl, match)).toEqual('loading')
    expect(TSR.fold(rs, match)).toEqual('success 10')
    expect(TSR.fold(rf, match)).toEqual('failure noop')
  })
})

describe('ap', () => {
  test('composition law', () => {
    // (ab -> bc -> a -> c).map(fac).ap(fbc).ap(fa) is equal fa.ap(fab).ap(fbc)
    const { ri, rl, rs, rf } = getResources()
    type A = number
    type B = string
    type C = { message: string }
    const fab = success((n: A): B => `number ${n}`)
    const fbc = success((s: B): C => ({ message: s.toUpperCase() }))
    const fac = (ab: (a: A) => B) => (bc: (b: B) => C) => (a: A) => bc(ab(a))
    expect(TSR.ap(ri, TSR.ap(fbc, TSR.map(fab, fac)))).toEqual(
      TSR.ap(TSR.ap(ri, fab), fbc),
    )
    expect(TSR.ap(rl, TSR.ap(fbc, TSR.map(fab, fac)))).toEqual(
      TSR.ap(TSR.ap(rl, fab), fbc),
    )
    expect(TSR.ap(rs, TSR.ap(fbc, TSR.map(fab, fac)))).toEqual(
      TSR.ap(TSR.ap(rs, fab), fbc),
    )
    expect(TSR.ap(rf, TSR.ap(fbc, TSR.map(fab, fac)))).toEqual(
      TSR.ap(TSR.ap(rf, fab), fbc),
    )
  })
})

describe('combine', () => {
  test('combines resources properly', () => {
    const { ri, rl, rs, rf } = getResources({ a: 100 })
    const _ = getResources({ a: 0, e: 'noop' })

    expect(TSR.combine(ri)).toEqual(ri)
    expect(TSR.combine(rl)).toEqual(rl)
    expect(TSR.combine(rs)).toEqual(success([100]))
    expect(TSR.combine(rf)).toEqual(rf)

    expect(TSR.combine(ri, _.ri)).toEqual(ri)
    expect(TSR.combine(ri, _.rl)).toEqual(ri)
    expect(TSR.combine(ri, _.rs)).toEqual(ri)
    expect(TSR.combine(ri, _.rf)).toEqual(ri)

    expect(TSR.combine(rl, _.ri)).toEqual(rl)
    expect(TSR.combine(rl, _.rl)).toEqual(rl)
    expect(TSR.combine(rl, _.rs)).toEqual(rl)
    expect(TSR.combine(rl, _.rf)).toEqual(rl)

    expect(TSR.combine(rf, _.ri)).toEqual(rf)
    expect(TSR.combine(rf, _.rl)).toEqual(rf)
    expect(TSR.combine(rf, _.rs)).toEqual(rf)
    expect(TSR.combine(rf, _.rf)).toEqual(rf)

    expect(TSR.combine(rs, _.ri)).toEqual(_.ri)
    expect(TSR.combine(rs, _.rl)).toEqual(_.rl)
    expect(TSR.combine(rs, _.rs)).toEqual(success([100, 0]))
    expect(TSR.combine(rs, _.rf)).toEqual(_.rf)
  })
})

describe('recover', () => {
  test('recovers from failure into success if recovery function returns some value', () => {
    const { ri, rl, rs, rf } = getResources()
    const recoverNot = () => undefined
    const recoverYes = () => 1

    expect(TSR.recover(ri, recoverNot)).toEqual(ri)
    expect(TSR.recover(rl, recoverNot)).toEqual(rl)
    expect(TSR.recover(rs, recoverNot)).toEqual(rs)
    expect(TSR.recover(rf, recoverNot)).toEqual(rf)

    expect(TSR.recover(ri, recoverYes)).toEqual(ri)
    expect(TSR.recover(rl, recoverYes)).toEqual(rl)
    expect(TSR.recover(rs, recoverYes)).toEqual(rs)
    expect(TSR.recover(rf, recoverYes)).toEqual(success(1))
  })
})

describe('unpackValue', () => {
  test('return value when success, throws otherwise', () => {
    const { ri, rl, rs, rf } = getResources({ a: 100 })
    expect(() => TSR.unpackValue(ri)).toThrowError()
    expect(() => TSR.unpackValue(rl)).toThrowError()
    expect(() => TSR.unpackValue(rf)).toThrowError()
    expect(TSR.unpackValue(rs)).toBe(100)
  })
})

describe('unpackFailure', () => {
  test('return error when failure, throws otherwise', () => {
    const { ri, rl, rs, rf } = getResources({ e: 'oops' })
    expect(() => TSR.unpackError(ri)).toThrowError()
    expect(() => TSR.unpackError(rl)).toThrowError()
    expect(() => TSR.unpackError(rs)).toThrowError()
    expect(TSR.unpackError(rf)).toBe('oops')
  })
})

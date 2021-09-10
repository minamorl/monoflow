interface Hmm<T> {
  then<F>(fn: (item: T) => F): Hmm<F>;
  else<F>(fn: (error: Error) => F): Hmm<F>;
  unwrap(fallback?: (error: Error) => T): T;
}

class Yep<T> implements Hmm<T> {
  constructor(private readonly _item: T) {}

  then<F>(fn: (item: T) => F): Hmm<F> {
    try {
      return new Yep(fn(this._item));
    } catch (err) {
      return new Nope(err as Error);
    }
  }

  else<F>(_fn: (error: Error) => F): Hmm<F> {
    return this as unknown as Yep<F>;
  }

  unwrap(_fallback?: (error: Error) => T): T {
    return this._item;
  }
}

class Nope<T> implements Hmm<T> {
  constructor(public readonly err: Error) {}

  then<F>(_fn: (item: T) => F): Hmm<F> {
    return this as unknown as Nope<F>;
  }

  else<F>(fn: (error: Error) => F): Hmm<F> {
    try {
      return new Yep(fn(this.err));
    } catch (err) {
      return new Nope(err as Error);
    }
  }

  unwrap(_fallback?: (error: Error) => T) {
    if (_fallback) {
      return _fallback(this.err);
    }
    throw this.err;
  }
}

function log<T>(item: T): T {
  console.log(item);
  return item;
}

// I'm trying to figure out how to move the `3` to the end like `.run(3)`...
const value = new Yep(3)
  .then((x) => x * 10)
  .then(log)
  .then(() => {
    throw new Error("oh no");
  })
  .else((err) => {
    console.error("recovered error:", err.message);
    return 42;
  })
  .then(log)
  .then(() => {
    throw new Error("not again");
  })
  .else((err) => {
    console.error("recovered error:", err.message);
    return 200;
  })
  .unwrap();

console.log(value);

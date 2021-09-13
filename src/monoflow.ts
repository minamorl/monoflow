/**
 * A workflow starts with a `Z` value, which is supplied at the end via `.run`.
 * Each `Workflow` is only a single step, linked together as a linked list,
 * where `A` and `B` represents the input and output types of the handler
 * function for that step. The handlers supplied to `else` work like the `catch`
 * in `try/catch`: the workflow will skip all intermediate steps until it finds
 * an `else` handler, and throw an exception if it doesn't find one.
 */
export class Workflow<Z, A, B> {
  static create<A, B>(ok: (a: A) => B): Workflow<A, A, B> {
    return new Workflow(ok);
  }

  private constructor(
    private readonly _ok: ((a: A) => B) | undefined = undefined,
    private readonly _err: ((error: Error) => B) | undefined = undefined,
    private readonly _steps: readonly Workflow<any, any, any>[] = []
  ) {}

  then<C>(fn: (item: B) => C): Workflow<Z, B, C> {
    return new Workflow(fn, undefined, [...this._steps, this]);
  }

  else<C>(fn: (error: Error) => C): Workflow<Z, B, C> {
    return new Workflow(undefined, fn, [...this._steps, this]);
  }

  combine<T, U>(workflow: Workflow<Z, any, any>): Workflow<Z, T, U> {
    return new Workflow(workflow._ok, workflow._err, [...this._steps, this, ...workflow._steps]);
  }

  run(value: Z): B {
    const steps = [...this._steps, this] as Workflow<any, any, any>[];
    let ret: any = value;
    let i = 0;
    while (i < steps.length) {
      let step = steps[i];
      try {
        // Each step is either an `ok` or `err` handler
        if (step._ok) {
          ret = step._ok(ret);
        }
      } catch (err) {
        // Catch errors from `ok` handlers, and find the nearest `err` handler
        while (step && !step._err) {
          i++;
          step = steps[i];
        }
        if (step && step._err) {
          // If we have an `err` handler, use that instead
          ret = step._err(err as Error);
        } else {
          // Else, just throw the error
          throw err;
        }
        // TODO: Should you be able to chain `.else` repeatedly? I don't think
        // this will work if you do that. This would probably need to be
        // recursive.
      }
      i++;
    }
    return ret;
  }
}

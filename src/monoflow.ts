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

  then<C>(fn: (item: B) => C): Workflow<Z, B, C> | Workflow<Z, A, C>{
    // Make a higher-order function when `this._ok` exists.
    if (this._ok) {
      const binded = this._ok.bind(this);
      return new Workflow((item: A) => fn(binded(item)), undefined, [...this._steps]);
    }
    return new Workflow(fn, undefined, [...this._steps, this]);
  }

  else<C>(fn: (error: Error) => C): Workflow<Z, B, unknown>  {
    // Make a higher-order function when `this._err` exists.
    const sym = Symbol.for("monoflow.hasError");
    if (this._err) {
      const binded = this._err.bind(this);
      const safeFn = (err: Error) => {
        try {
          return {
            [sym]: false,
            _value: binded(err)
          };
        } catch (err2) {
          return {
            [sym]: true,
            _value: err2 as Error
          };
        }
      }
      return new Workflow(undefined, (error: Error) => {
        const result = safeFn(error);
        if (result[sym]) {
          return fn(result._value as Error)
        }
        return result._value;
      }, [...this._steps]);
    }
    return new Workflow(undefined, fn, [...this._steps, this]);
  }

  combine<C>(workflow: Workflow<Z, B, C>): Workflow<Z, B, C> {
    return new Workflow(workflow._ok, workflow._err, [...this._steps, this, ...workflow._steps]);
  }

  private *steps(): Generator<Workflow<any, any, any>> {
    const list = [...this._steps, this] as Workflow<any, any, any>[];
    for (const step of list) {
      yield step;
    }
  }

  run(value: Z): B {
    let ret: any = value;
    const iter = this.steps(); 
    for (const step of iter) {
      try {
        if (step._ok) {
          ret = step._ok(ret);
        }
      } catch (err) {
        const nextSteps: Workflow<any, any, any> | undefined = iter.next().value;
        if (!nextSteps?._err) {
          throw err as Error;
        }
        ret = nextSteps._err(err as Error);
      }
    }
    return ret;
  }
}

/**
 * A workflow starts with a `TInit` value, which is supplied at the end via
 * `.run`. Each `Workflow` is only a single step, linked together as a linked
 * list, where `TIn` and `TOut` represents the input and output types of the
 * handler function for that step. The handlers supplied to `else` work like the
 * `catch` in `try/catch`: the workflow will skip all intermediate steps until
 * it finds an `else` handler, and throw an exception if it doesn't find one.
 */
class Workflow<TInit, TIn, TOut> {
  static create<TIn, TOut>(ok: (a: TIn) => TOut): Workflow<TIn, TIn, TOut> {
    return new Workflow<TIn, TIn, TOut>(ok);
  }

  private constructor(
    private readonly _ok: ((a: TIn) => TOut) | undefined = undefined,
    private readonly _err: ((error: Error) => TOut) | undefined = undefined,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private readonly _next: Workflow<any, any, any> | undefined = undefined
  ) {}

  then<TOut2>(fn: (item: TOut) => TOut2): Workflow<TInit, TOut, TOut2> {
    return new Workflow(fn, undefined, this);
  }

  else<TOut2>(fn: (error: Error) => TOut2): Workflow<TInit, TOut, TOut2> {
    return new Workflow(undefined, fn, this);
  }

  run(value: TInit): TOut {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const steps: Workflow<any, any, any>[] = [this];
    let step = this._next;
    while (step) {
      steps.unshift(step);
      step = step._next;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let ret: any = value;
    let i = 0;
    while (i < steps.length) {
      let step = steps[i];
      try {
        if (step._ok) {
          ret = step._ok(ret);
        }
      } catch (err) {
        while (step && !step._err) {
          i++;
          step = steps[i];
        }
        if (step && step._err) {
          ret = step._err(err as Error);
        } else {
          throw err;
        }
      }
      i++;
    }
    return ret;
  }
}

// Argument type MUST be annotated on the first function
const value = Workflow.create((x: number) => x * 10)
  .then((x) => x + 2)
  .then((x) => `cool ${x}`)
  // .then((_x) => {
  //   throw new Error("oops");
  // })
  .else((_err) => "NICE")
  .then((x) => x)
  .run(3);

console.log(value);

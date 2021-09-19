# Monoflow
A monadic interface for handling errors in JS

## What is it?

Monoflow provides one `Workflow` class that makes you easier to deal with combine functions, error handlings, and provides lazy evaluation.

## Examples

### Example 1: Create Workflow instance
```ts
import { Workflow } from "monoflow"

const workflow = Workflow.create((x: number) => x + 1);

console.log(workflow.run(2)); // Output: 3
```

That's it. Note that you need to explicit type of input type.

### Example 2: Chain functions with `.then()`
```ts
const workflow = Workflow.create((x: number) => x + 1)
  .then((x) => x * 2)
  .then((x) => x + 1);

console.log(workflow.run(1)); // Output: 5
```

### Example 3: Deal with errors

```ts
const workflow = Workflow.create((x: number) => x + 1)
  .then((x) => x * 2)
  .then((x) => x + 1)
  .then((_) => throw new Error("error!"))
  .else((err) => err.message);

console.log(workflow.run(1)); // Output: "error!"
```

Note that you can put `.else()` anyware. So as you can see below, you can get back to the function mapped by `.then()`

```ts
const workflow = Workflow.create((x: number) => x + 1)
  .then((x) => x * 2)
  .then((x) => x + 1)
  .then((_) => throw new Error("error!"))
  .else((err) => err.message);
  .then((x: string) => x + "!")

console.log(workflow.run(1)); // Output: "error!!"
```

### Example 4: Combine workflows

You can combine multiple workflows like this:

```ts
const workflow1 = Workflow.create((_) => {
  throw new Error("error")
});
const workflow2 = Workflow.create((_) => undefined)
  .else((err) => err.message);
const workflow3 = workflow1.combine(workflow2);
console.log(workflow3.run(undefined)); // Output: "error"
```

## Authors

### Maintainer
[@minamorl]("https://github.com/minamorl")

### Core Contributors 
[@wavebeem]("https://github.com/wavebeem")

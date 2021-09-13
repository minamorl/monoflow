import { Workflow } from "./monoflow";

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

const workflow1 = Workflow.create((x: number) => x + 1).then((x) => x * 2).then((x) => x + 1)
const workflow2 = Workflow.create((x: number) => x * 3).then((x) => `${x}`)
console.log(workflow1.run(1));
console.log(workflow1.combine(workflow2).run(1));

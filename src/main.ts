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

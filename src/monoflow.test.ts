import { Workflow } from "./monoflow";

test("A workflow can be initialized by Workflow.create", () => {
  expect(Workflow.create(() => "A").run(undefined)).toBe("A");
});

test("A workflow can be chained by .then()", () => {
  // Argument type MUST be annotated on the first function
  const value = Workflow.create((x: number) => x * 10)
    .then((x) => x + 2)
    .run(1);
  expect(value).toBe(12)
});

test("A workflow can be combined other workflow by .combine()", () => {
  const workflow1 = Workflow
    .create((x: number) => x + 1)
    .then((x) => x * 2).then((x) => x + 1);
  const workflow2 = Workflow
    .create((x: number) => x * 3)
    .then((x) => `${x}`);
  const workflow3 = workflow1.combine(workflow2);
  expect(workflow3.run(1)).toBe("15");
});

test("A workflow can handle simple error by .else()", () => {
  const workflow = Workflow
    .create((_: number) => { throw new Error("err")})
    .else((err) => err.message);
  expect(workflow.run(1)).toBe("err");
});

test("Complex chain of .else()", () => {
  const workflow = Workflow
    .create((_: number) => { throw new Error()})
    .else((_err) => { throw new Error()})
    .else((_err) => { throw new Error()})
    .else((_err) => { throw new Error("err")})
    .else((err) => err.message)
    .then((id) => id);
  expect(workflow.run(1)).toBe("err")
})

test("Ignore second .else()", () => {
  const workflow = Workflow.create((_n: number) => {
    throw new Error("hey");
  })
    .else((_err) => {
      return "hey!";
    })
    .else((err) => {
      return `${err.message}!`;
    });
  expect(workflow.run(1)).toBe("hey!");
})


test("A Workflow handles user-defined errors", () => {
  const workflow = Workflow.create((_) => {
    throw { message: "error" }
  }).else(err => {
    throw err
  }).else(err => {
    return err.message;
  })
  expect(workflow.run(undefined)).toBe("error")
});
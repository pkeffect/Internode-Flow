// A Comfy-style Node Definition
export const nodes = [
  {
    id: "Math.Add",         // Unique internal ID
    label: "Add Numbers",   // Display name
    category: "Math",       // For the menu
    description: "Adds two numbers together",
    inputs: [
      { name: "a", type: "number", label: "Value A" },
      { name: "b", type: "number", label: "Value B" }
    ],
    outputs: [
      { name: "result", type: "number", label: "Result" }
    ],
    // The logic to run (we won't run it yet, but this is where it lives)
    execute: (inputs) => {
      return { result: inputs.a + inputs.b };
    }
  },
  {
    id: "Math.Multiply",
    label: "Multiply",
    category: "Math",
    inputs: [
        { name: "a", type: "number" },
        { name: "b", type: "number" }
    ],
    outputs: [{ name: "result", type: "number" }]
  }
];
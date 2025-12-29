export const nodes = [
  {
    id: "Agent.Input",
    label: "Chat Input",
    category: "I/O",
    description: "Receives the user message from OpenWebUI",
    inputs: [],
    outputs: [{ name: "text", type: "string", label: "User Message" }]
  },
  {
    id: "Agent.LLM",
    label: "LLM Generation",
    category: "Model",
    description: "Processes text using an LLM",
    inputs: [
      { name: "prompt", type: "string", label: "Prompt" },
      { name: "model", type: "string", label: "Model Name" },
      { name: "history", type: "array", label: "Chat History" }
    ],
    outputs: [{ name: "response", type: "string", label: "Response" }]
  },
  {
    id: "Agent.Tool",
    label: "Tool / API Call",
    category: "Tools",
    description: "Calls an external API or Function",
    inputs: [
      { name: "trigger", type: "string", label: "Trigger" },
      { name: "params", type: "json", label: "Parameters" }
    ],
    outputs: [{ name: "result", type: "string", label: "Result" }]
  },
  {
    id: "Agent.Router",
    label: "Logic Router",
    category: "Logic",
    description: "Routes flow based on conditions",
    inputs: [{ name: "input", type: "string", label: "Input" }],
    outputs: [
      { name: "true", type: "signal", label: "True" },
      { name: "false", type: "signal", label: "False" }
    ]
  },
  {
    id: "Agent.Output",
    label: "Chat Output",
    category: "I/O",
    description: "Sends final response back to user",
    inputs: [{ name: "text", type: "string", label: "Final Text" }],
    outputs: []
  }
];
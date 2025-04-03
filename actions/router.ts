"use server";

import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateObject, streamText } from "ai";
import { createStreamableValue } from "ai/rsc";
import { z } from "zod";
import { contextTool } from "../lib/tools/contextTool";
import { getContext } from "./getContext";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function routeQuery(query: string) {
  console.log("Incoming query:", query);

  const { object: intentClassification } = await generateObject({
    model: google("gemini-1.5-flash"),
    system:
      "You are a customer support routing assistant for a smart water bottle device. Your task is to analyze customer queries and determine both their intent and complexity level. For intent classification:\n\n- Use 'product inquiry' for questions about the smart water bottle features, specifications, compatibility, or availability\n- Use 'technical support' for issues with water tracking, app connectivity, sensor problems, or device malfunctions\n- Use 'billing or refund' for payment, warranty, or refund-related queries\n- Use 'human-needed' when the query involves water safety concerns, health-related issues, or complex technical problems\n\nFor complexity:\n- Mark as 'simple' if the query has a straightforward solution like basic feature explanations or common troubleshooting\n- Mark as 'complex' if the query requires detailed technical investigation, multiple troubleshooting steps, or specialized product knowledge",
    prompt: `Please carefully analyze the following smart water bottle related customer query and classify its intent and complexity based on the given criteria. Consider the specific details and context of the query to provide accurate classification.\n\nCustomer Query: "${query}"\n\nProvide a classification that best matches the nature and requirements of this inquiry.`,
    schema: z.object({
      brief: z.string().describe("Why this intent?"),
      intent: z.enum([
        "product-inquiry",
        "technical-support ",
        "billing-or-refund",
        "human-needed",
      ]),
      complexity: z.enum(["simple", "complex"]),
    }),
  });

  console.log("Intent Classification:", intentClassification);

  //   if (intentClassification.intent === "human-needed") {
  //     // route to human with brief
  //   }

  const stream = createStreamableValue("");

  (async () => {
    console.log(
      "Starting stream generation with complexity:",
      intentClassification.complexity
    );

    const selectedModel =
      intentClassification.complexity === "simple"
        ? "gemini-1.5-flash-latest"
        : "gemini-2.0-flash-001";
    console.log("Selected model:", selectedModel);

    // Fetch context directly before stream generation
    console.log("Fetching context directly before stream generation");
    
      const contextData = await getContext( query );
    console.log("Context fetched directly, length:", contextData.length);

    const { textStream } = streamText({
      tools: {
        context: contextTool,
      },
      model: google(selectedModel),
      system: {
        "product-inquiry":
          `You are a smart water bottle product specialist. Here is context about the query: ${contextData}\n\nUse this context to answer questions about our device's features, specifications, and capabilities. Only provide information that is supported by the context.`,
        "technical-support ":
          "call to context tool to get context about the query.You are a technical support expert for smart water bottles. Use the provided context to diagnose issues and provide step-by-step troubleshooting solutions. Only recommend steps that are supported by the context.",
        "billing-or-refund":
          "call to context tool to get context about the query.You are a billing specialist handling smart water bottle purchases. Use the provided context to address concerns about orders, warranties, and refunds. Only provide policy information that is supported by the context.",
        "human-needed":
          "call to context tool to get context about the query.You are a support assistant gathering information before human escalation. Use the provided context to acknowledge the issue and explain the escalation process.",
      }[intentClassification.intent] as string,

      prompt: {
        "product-inquiry": `Please provide detailed information about this smart water bottle product inquiry: "${query}"`,
        "billing-or-refund": `Please assist with this smart water bottle billing or refund question: "${query}"`,
        "technical-support ": `Please provide step-by-step guidance for this smart water bottle technical issue: "${query}"`,
        "human-needed": `Please acknowledge this query and explain the process for human agent assistance: "${query}"`,
      }[intentClassification.intent] as string,
    });

    console.log("Stream generation started");

    for await (const text of textStream) {
      console.log("Stream chunk received:", text.substring(0, 50) + "...");
      stream.update(text);
    }

    console.log("Stream generation completed");
    stream.done();
  })();

  return { output: stream.value };
}

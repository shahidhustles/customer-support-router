"use server";

import { createCohere } from "@ai-sdk/cohere";
import { cosineSimilarity, embed, embedMany } from "ai";
import fs from "fs";

const cohere = createCohere({
  apiKey: process.env.COHERE_API_KEY,
});

export async function getContext(input: string): Promise<string> {
  console.log("Tool execution started with input:", input);

  const db: { embedding: number[]; value: string }[] = [];

  const filePath =
    "D:\\workflows\\Routing\\customer-support-router\\lib\\file.txt";
  console.log("Attempting to read file from:", filePath);

  if (!fs.existsSync(filePath)) {
    console.error("File does not exist at path:", filePath);
    return "Error: Context file not found. Please check the file path.";
  }

  const file = fs.readFileSync(filePath, "utf8");
  console.log("File successfully read. Content length:", file.length);

  const chunks = file
    .split(".")
    .map((chunk) => chunk.trim())
    .filter((chunk) => chunk.length > 0 && chunk !== "\n");
  console.log("Number of chunks created:", chunks.length);

  console.log("Getting embeddings for chunks...");
  const { embeddings } = await embedMany({
    model: cohere.embedding("embed-english-light-v3.0"),
    values: chunks,
  });
  console.log("Received embeddings. Count:", embeddings.length);

  console.log("Building database...");
  embeddings.forEach((e, i) => {
    db.push({
      embedding: e,
      value: chunks[i],
    });
  });
  console.log("Database built with entries:", db.length);

  console.log("Getting embedding for input query...");
  const { embedding } = await embed({
    model: cohere.embedding("embed-english-light-v3.0"),
    value: input,
  });
  console.log("Input embedding received");

  console.log("Calculating similarities and sorting context...");
  const context = db
    .map((item) => ({
      document: item,
      similarity: cosineSimilarity(embedding, item.embedding),
    }))
    .sort((a, b) => b.similarity - a.similarity)
    .map((r) => r.document.value)
    .join("\n");

  console.log("Final context length:", context.length);
  return context;
}

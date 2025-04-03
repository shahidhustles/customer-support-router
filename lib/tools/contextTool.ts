import { z } from "zod";
import { tool } from "ai";
import { getContext } from "../../actions/getContext";

export const contextTool = tool({
  description: "Get the relevant context for answering the queries",
  parameters: z.object({
    input: z
      .string()
      .describe("describe what kind of text you need to answer the query"),
  }),
  execute: async ({ input }) => {
    return await getContext(input);
  },
});
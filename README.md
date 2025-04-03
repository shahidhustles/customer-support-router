# Smart Water Bottle Customer Support Router

An intelligent customer support routing system for smart water bottle inquiries. This application uses AI to classify customer queries, retrieve relevant context, and provide accurate responses based on the query type and complexity.

## Features

- Automatic query classification (product inquiry, technical support, billing/refund, human escalation)
- Complexity assessment for optimal model selection
- Context-aware responses using semantic search
- Real-time streaming responses
- Modern, responsive UI

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- API keys for Google Gemini and Cohere

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/customer-support-router.git
   cd customer-support-router
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn
   # or
   pnpm install
   ```

3. Create a `.env.local` file in the root directory with your API keys:
   ```plaintext
   GEMINI_API_KEY=your_gemini_api_key_here
   COHERE_API_KEY=your_cohere_api_key_here
   ```

4. Add your knowledge base content to `lib/file.txt`

5. Start the development server
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application

## Usage

1. Enter a customer query in the input field
2. The system will:
   - Classify the query by intent and complexity
   - Retrieve relevant context from the knowledge base
   - Generate an appropriate response
   - Stream the response to the UI in real-time

## How It Works

1. Query Classification: Uses Gemini to determine the query intent and complexity
2. Context Retrieval: Employs Cohere embeddings to find relevant information
3. Response Generation: Selects the appropriate model based on complexity and generates a response using the retrieved context
4. Streaming: Delivers the response in real-time to the user interface

## Customization

- Update the knowledge base in `lib/file.txt` with your product information
- Modify the classification system in `actions/router.ts` to match your support categories
- Adjust the UI in `app/page.tsx` to match your brand

## Project Structure

- `/actions` - Server actions for routing and AI processing
- `/app` - Next.js application pages and components
- `/lib` - Utility functions and tools
  - `/tools` - AI tools for context retrieval
- `/public` - Static assets

## License

MIT
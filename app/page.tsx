"use client"

import { routeQuery } from "@/actions/router";
import { readStreamableValue } from "ai/rsc";
import { useState } from "react";

export default function Home() {
  const [query, setQuery] = useState<string>("");
  const [generation, setGeneration] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-blue-600 p-6">
          <h1 className="text-2xl font-bold text-white">Smart Water Bottle Support</h1>
          <p className="text-blue-100 mt-1">Ask a question about your device</p>
        </div>
        
        <div className="p-6">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!query.trim()) return;
              
              setGeneration("");
              setIsLoading(true);
              try {
                const { output } = await routeQuery(query);
                for await (const text of readStreamableValue(output)) {
                  setGeneration((currentGen) => `${currentGen}${text}`);
                }
              } catch (error) {
                console.error('Error generating response:', error);
                setGeneration("Sorry, there was an error processing your request. Please try again.");
              } finally {
                setIsLoading(false);
              }
            }}
            className="space-y-4"
          >
            <div>
              <label htmlFor="query" className="block text-sm font-medium text-black mb-1">
                Your Question
              </label>
              <div className="relative">
                <input
                  id="query"
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g., How do I connect my bottle to my phone?"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-gray-900"
                  disabled={isLoading}
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className={`w-full py-2 px-4 rounded-lg text-white font-medium transition ${
                isLoading || !query.trim() 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isLoading ? 'Processing...' : 'Get Help'}
            </button>
          </form>
          
          {generation && (
            <div className="mt-6">
              <h2 className="text-lg font-medium text-gray-900 mb-2">Response:</h2>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="prose max-w-none">
                  {generation.split('\n').map((line, i) => (
                    <p key={i} className="mb-2">{line || <br />}</p>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {isLoading && (
            <div className="mt-6 flex justify-center">
              <div className="animate-pulse flex space-x-2">
                <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
                <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
                <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <p className="mt-4 text-sm text-gray-500">
        © 2023 Smart Water Bottle Inc. All rights reserved.
      </p>
    </div>
  );
}

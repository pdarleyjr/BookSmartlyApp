import { sendChat, handleFunctionCall } from "../services/ChatService";
import type { ChatCompletionMessageParam } from "openai/resources";
import type OpenAI from "openai";

/**
 * Chat API service
 */
export const chatApi = {
  /**
   * Send a message to the chat service
   * @param messages - Array of chat messages
   * @returns Promise with the assistant's response
   */
  sendMessage: async (messages: ChatCompletionMessageParam[]) => {
    try {
      const response = await sendChat(messages);
      return response;
    } catch (error) {
      console.error("Error sending chat message:", error);
      throw error;
    }
  },

  /**
   * Execute a function call from the assistant
   * @param message - The message containing the function call
   * @returns Promise with the function result
   */
  executeFunction: async (message: OpenAI.Chat.Completions.ChatCompletionMessage) => {
    try {
      const result = await handleFunctionCall(message);
      return result;
    } catch (error) {
      console.error("Error executing function:", error);
      throw error;
    }
  },

  /**
   * Process a chat conversation with function calling
   * This is a higher-level method that handles the entire conversation flow
   * @param messages - Array of chat messages
   * @returns Promise with the final response
   */
  processConversation: async (messages: ChatCompletionMessageParam[]) => {
    try {
      // Send the initial messages to the chat service
      const assistantResponse = await sendChat(messages);
      
      // If there's a function call, execute it
      if (assistantResponse.function_call) {
        // Execute the function
        const functionResult = await handleFunctionCall(assistantResponse);
        
        // Add the function result to the messages
        const functionMessage = {
          role: "function" as const,
          name: functionResult.name,
          content: JSON.stringify(functionResult.result)
        };
        
        // Get the final response from the assistant
        const finalResponse = await sendChat([...messages, assistantResponse, functionMessage]);
        
        return {
          initialResponse: assistantResponse,
          functionCall: functionResult,
          finalResponse
        };
      }
      
      // If there's no function call, just return the assistant's response
      return {
        initialResponse: assistantResponse,
        functionCall: null,
        finalResponse: null
      };
    } catch (error) {
      console.error("Error processing conversation:", error);
      throw error;
    }
  }
};
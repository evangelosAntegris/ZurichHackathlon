// lib/conversation-service.ts
import { orchestratorRun } from "./agents/orchestrator";


export const runLLMPipeline = async (conversationId: string) => {
    console.log("Second function triggered for conversation:", conversationId)
  //Now we take the data from the database based on the conversationId
  //We feed the data to the LLM pipeline
    try {    
       // Run full pipeline (Agents 1→5)
    const { prep, ie, clf, val, fin } = await orchestratorRun("../public/test.txt", "./prompts/classifier.txt");
    console.log(clf)
    } catch (error) {
      console.error("Error in runLLMPipeline:", error)
    }
  }
  
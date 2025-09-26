// lib/agents/orchestrator.ts
import { preprocessingAgent } from "./preprocessing";
import { intentEntityAgent } from "./ie";
import { classifierAgent } from "./classifier";
import { validationAgent } from "./validation";
import { finalizeAgent } from "./finalize";

type OrchestratorResult = {
  prep: ReturnType<typeof preprocessingAgent> extends Promise<infer T> ? T : never;
  ie:   ReturnType<typeof intentEntityAgent> extends Promise<infer T> ? T : never;
  clf:  ReturnType<typeof classifierAgent> extends Promise<infer T> ? T : never;
  val:  ReturnType<typeof validationAgent> extends Promise<infer T> ? T : never;
  fin:  ReturnType<typeof finalizeAgent>;
};

/** Runs the full pipeline: preprocessing -> ie -> classifier -> validation -> finalize */
export const run = async (raw: string, classifierPromptPath?: string): Promise<OrchestratorResult> => {
  const promptPath = classifierPromptPath || process.env.CLASSIFIER_PROMPT_PATH || "prompts/classifier.txt";

  const prep = await preprocessingAgent({ transcript_raw: raw });
  const ie   = await intentEntityAgent({ transcript_clean: prep.transcript_clean, sentences: prep.sentences });
  const clf  = await classifierAgent({
    transcript_clean: prep.transcript_clean,
    requests: ie.requests,
    promptPath
  });
  const val  = await validationAgent({ candidates: clf.candidates, transcript_clean: prep.transcript_clean });
  // lib/agents/orchestrator.ts
  const fin = finalizeAgent({
    validated: val.validated,
    sort: true,
    topK: Infinity,
    minSpans: 1
  });


  return { prep, ie, clf, val, fin };
};

export default run;

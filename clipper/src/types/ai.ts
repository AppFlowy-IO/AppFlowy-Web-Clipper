export interface AIService {
  streamCompletionText: (params: {
    workspaceId: string;
    data: CompleteTextData;
  }) => Promise<ReadableStream<String>>;
}

export interface CustomPrompt {
  system: string;
  user?: string;
}

export enum CompletionType {
  ImproveWriting = 1,
  SpellingAndGrammar = 2,
  MakeShorter = 3,
  MakeLonger = 4,
  ContinueWriting = 5,
}

export interface CompleteTextData {
  text: string;
  completionType?: CompletionType;
  customPrompt?: CustomPrompt;
}

export class CompleteTextParamsClass implements CompleteTextData {
  text: string;
  completionType?: CompletionType;
  customPrompt?: CustomPrompt;

  constructor(text: string, completionType?: CompletionType) {
    this.text = text;
    this.completionType = completionType;
    this.customPrompt = undefined;
  }
}

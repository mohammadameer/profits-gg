import { OpenAIApi, Configuration } from "openai";


export async function getOpenaiClient() {
  const configuration = new Configuration({
    organization: process.env.OPENAI_ORG_ID,
    apiKey: process.env.OPENAI_API_KEY,
  });

  return new OpenAIApi(configuration);
}
import { OpenAIApi, Configuration } from "openai";

const configuration = new Configuration({
  organization: process.env.OPENAI_ORG_ID,
  apiKey: process.env.OPENAI_API_KEY,
});

export const openai = new OpenAIApi(configuration);
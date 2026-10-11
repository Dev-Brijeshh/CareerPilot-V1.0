require("dotenv").config();

const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

async function checkModels() {
  try {
    const models = await openai.models.list();

    models.data.forEach((model) => {
      console.log(model.id);
    });
  } catch (error) {
    console.error("Error:", error.message);
  }
}

checkModels();

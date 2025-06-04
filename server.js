 

import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();
import express from "express";
import bodyParser from "body-parser";
const app = express();
app.use(express.json());
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("hello gemini");
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const prompt = "How does AI work?";

const generate = async (prompt) => {
  try {
    // const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    console.log(response.text());
    return response.text();
  } catch (err) {
    console.error("Gemini Error:", err);
  }
};

// generate();

app.get("/api/content", async (req, res) => {
  try {
    const data = req.body.question;
    const result = await generate(data);
    res.send({
      result: result,
    });
  } catch (error) {
    res.send({ "error:": error.message });
  }
});

const generatePrompt = async (content, tone) => {
  return `You are an intelligent email assistant. 
Reply to the following email with a ${tone} tone.

Email:
"${content}"

The reply should be well-structured, polite, and suitable for professional communication.
`;
};

app.get("/api/email", async (req, res) => {
  try {
    const { content, tone } = req.body;
    const prompt = await generatePrompt(content,tone);

    const result = await generate(prompt);
    res.send({
      result: result,
    });
  } catch (error) {
    res.send({ "error:": error.message });
  }
});
app.listen(5000, () => {
  console.log("app is running on port 5000");
});

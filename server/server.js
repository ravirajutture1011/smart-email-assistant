
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();
import express from "express";
import bodyParser from "body-parser";
import cors from "cors"
const app = express();
app.use(express.json());
app.use(bodyParser.json());

app.use(cors({
  // origin:"http://localhost:5173",
  origin:"*",
  credentials:true
}))

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

The reply should meet the following conditions:
1. Don't include a subject.
2. Start with "Hi [Sender Name],"
3. Add exactly one line break after "Hi [Sender Name],", then write the rest of the message.
4. Be well-structured, polite, and suitable for professional communication.
5. Return the response in a single line without any newline characters (\\n).
6. make sure your response is grametically correct.
7. recheck once for verification.

Only return the reply.`;
};


app.post("/api/email", async (req, res) => {
  try {
    const { content, tone } = req.body;
    const prompt = await generatePrompt(content,tone);

    let result = await generate(prompt);
    result =  result.replace(/\n/g, ' ');
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




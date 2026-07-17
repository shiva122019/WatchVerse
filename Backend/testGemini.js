// testGemini.js
require("dotenv").config();
const axios = require("axios");
const { getEndpoint } = require("./config/gemini");

async function callGemini(withGrounding) {
  try {
    const body = {
      contents: [{ role: "user", parts: [{ text: "Say hello in one sentence." }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 100 },
    };
    if (withGrounding) {
      body.tools = [{ google_search: {} }];
    }

    const { data } = await axios.post(getEndpoint(), body);
    console.log(`✅ ${withGrounding ? "WITH" : "WITHOUT"} grounding: SUCCESS`);
    console.log(data.candidates?.[0]?.content?.parts?.[0]?.text);
  } catch (err) {
    console.log(`❌ ${withGrounding ? "WITH" : "WITHOUT"} grounding: FAILED`);
    console.log("Status:", err.response?.status);
    console.log("Body:", JSON.stringify(err.response?.data, null, 2));
  }
}

async function test() {
  await callGemini(false); // plain call, no search tool
  console.log("\n---\n");
  await callGemini(true); // grounded call, with search tool
}

test();
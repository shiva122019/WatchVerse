const axios = require("axios");
require("dotenv").config();

(async () => {
  try {
    const res = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            role: "user",
            parts: [{ text: "Say hello." }]
          }
        ]
      }
    );

    console.log(res.data);
  } catch (e) {
    console.log(e.response?.status);
    console.log(JSON.stringify(e.response?.data, null, 2));
  }
})();
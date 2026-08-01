require("dotenv").config();

const { askGemini } = require("./services/gemini.service");

async function main() {

    const reply = await askGemini(
        "Tell me about Interstellar in one sentence."
    );

    console.log(reply);

}

main();

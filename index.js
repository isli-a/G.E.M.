const axios = require("axios");

require("dotenv").config();

const { App } = require("@slack/bolt");


const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode: true
});

//ping command
app.command("/gem-ping", async ({ command, ack, respond }) => {
  const start = Date.now();
  await ack();
  const latency = Date.now() - start;
  await respond({ text: `Pong!\nLatency: ${latency}ms` });
});

//cat fact command
app.command("/gem-catfact", async ({ ack, respond }) => {
  
  await ack();
   try {
    const response = await axios.get("https://catfact.ninja/fact");
    await respond({ text: `Cat Fact:\n${response.data.fact}` });
  } catch (err) {
    await respond({ text: "Failed to fetch a catfact." });
  }
});

//joke command
app.command("/gem-joke", async ({ ack, respond }) => {
  await ack();

  try {
    const response = await axios.get("https://official-joke-api.appspot.com/random_joke");
    await respond({
      text:
`${response.data.setup}

${response.data.punchline}`
    });
  } catch (err) {
    await respond({ text: "Failed to fetch a joke." });
  }
});

//trivia command
app.command("/gem-trivia", async ({ ack, respond }) => {
  await ack();

  try {
    const response = await axios.get("https://opentdb.com/api.php?amount=1&type=multiple");
    await respond({
      text:
`Question: ${response.data.results[0].question}
Options: ${response.data.results[0].incorrect_answers.join(", ")}, ${response.data.results[0].correct_answer}`
    });
  } catch (err) {
    await respond({ text: "Failed to fetch a trivia question." });
  }
});

//remind command
app.command("/gem-remind", async ({ command, ack, client, respond }) => {
  await ack();

  // Split the text into pieces
  const args = command.text.split(" ");

  // First argument = minutes
  const minutes = parseInt(args[0]);

  // Remaining text = reminder message
  const reminder = args.slice(1).join(" ");

  // Validate input
  if (isNaN(minutes) || !reminder) {
    await respond({
      text:
        "Usage:\n/gem-remind <minutes> <message>\nExample: /gem-remind 10 Finish homework"
    });
    return;
  }

  // Confirm reminder
  await respond({
    text: `⏰ I'll remind you in ${minutes} minute(s):\n"${reminder}"`
  });

  // Wait the specified time
  setTimeout(async () => {
    try {
      await client.chat.postMessage({
        channel: command.channel_id,
        text: `🔔 Reminder for <@${command.user_id}>:\n${reminder}`
      });
    } catch (error) {
      console.error("Reminder error:", error);
    }
  }, minutes * 60 * 1000);
});

//ask search command
app.command("/gem-ask", async ({ command, ack, respond }) => {
  await ack();

  const responses = [
    "Yes.",
    "No.",
    "Absolutely.",
    "Ask again later.",
    "The odds are favorable.",
    "I don't think so.",
    "Definitely not."
  ];

  const answer =
    responses[Math.floor(Math.random() * responses.length)];

  await respond({
    text: `❓ ${command.text}\n\n🤖 ${answer}`
  });
});

//weather command
app.command("/gem-weather", async ({ command, ack, respond }) => {
  await ack();

  const city = command.text;

  if (!city) {
    await respond({
      text: "Usage:\n/gem-weather <city>"
    });
    return;
  }

  try {
    const response = await axios.get(
      "https://api.openweathermap.org/data/2.5/weather",
      {
        params: {
          q: city,
          appid: process.env.WEATHER_API_KEY,
          units: "imperial"
        }
      }
    );

    const weather = response.data;

    await respond({
      text:
`🌤 Weather in ${weather.name}

Temperature: ${weather.main.temp}°F
Condition: ${weather.weather[0].description}
Humidity: ${weather.main.humidity}%
Wind: ${weather.wind.speed} mph`
    });

  } catch (err) {
    console.error(err);
    await respond({
      text: "Couldn't find that city."
    });
  }
});

//help command
app.command("/gem-help", async ({ ack, respond }) => {
  await ack();
  await respond({
    text:
`Available Commands:
/gem-ping - Check bot latency
/gem-catfact - Get a cat fact
/gem-joke - Get a random joke
/gem-trivia - Get a trivia question
/gem-help - Show this help message
/gem-remind - Set a reminder
/gem-weather - Get a weather update
/gem-ask - Ask a question and get an answer`
  });
});

(async () => {
  await app.start();
  console.log("Bot is running!!");
})();
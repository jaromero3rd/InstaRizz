import express from 'express'
import * as dotenv from 'dotenv'
import cors from 'cors'
import { Configuration, OpenAIApi } from 'openai'

dotenv.config()

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const app = express()
app.use(cors())
app.use(express.json())

app.get('/', async (req, res) => {
  res.status(200).send({
    message: 'Hello from InstaRizz!'
  })
})

app.post('/', async (req, res) => {
  try {
    const prompt = req.body.prompt;

    if (prompt.length === 0){
      res.status(200).send({
        bot: 'Send Something!'
      });
    } else if (prompt.length < 1) {
      res.status(200).send({
        bot: 'Please enter a real name!'
      });
    } else {
      const response = await openai.createCompletion({
      model: "davinci:ft-finhelp-2023-02-03-00-07-40",
      prompt: isValidInput(`${prompt}`), //`${prompt}`,
      temperature: 0.7, // Higher values means the model will take more risks.
      max_tokens: 100, // The maximum number of tokens to generate in the completion. Most models have a context length of 2048 tokens (except for the newest models, which support 4096).
      top_p: 1, // alternative to sampling with temperature, called nucleus sampling
      //n: 1, //controls the number of sub-completions generated
      frequency_penalty: 2, // Number between -2.0 and 2.0. Positive values penalize new tokens based on their existing frequency in the text so far, decreasing the model's likelihood to repeat the same line verbatim.
      presence_penalty: 0, // Number between -2.0 and 2.0. Positive values penalize new tokens based on whether they appear in the text so far, increasing the model's likelihood to talk about new topics.
      stop: "END",
      });
      res.status(200).send({
        bot: response.data.choices[0].text
      });
    }

  } catch (error) {
    console.error(error)
    res.status(500).send(error || 'Something went wrong');
  }
})

function isValidInput(userInput) {
  const capitalizedUserIn =
    userInput[0].toUpperCase() + userInput.slice(1).toLowerCase();
  return `Q: What is the funniest and clever pickup line for someone named Izzy
          A: Can I get busy with Izzy? END
          Q: What is the funniest and clever pickup line for someone named Alexandra
          A: You need to go out on a date with me right now. Alex-plain later END
          Q: What is the funniest and clever pickup line for someone named Angel
          A: Since you're Angel, do you mind if I say Halo? END
          Q: What is the funniest and clever pickup line for someone named ${capitalizedUserIn}\n
          A: `;
}


app.listen(5000, () => console.log('AI server started on http://localhost:5000'))
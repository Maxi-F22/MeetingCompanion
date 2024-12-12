// Importing required libraries
import { HfInference } from '@huggingface/inference'
import dotenv from 'dotenv'

dotenv.config()

// Set some constants
const inference = new HfInference(process.env.HF_ACCESS_TOKEN) // inference library loads access token from the .env file
const model = 'knkarthick/MEETING_SUMMARY' // model name

var text = "Hi! Hello How are you today? I'm very good thank you. Should we start? Yes. We have to design the new Remote. Yes how about we add Buttons, Noam? Oh yes Marcel that is a very good idea. What do you think Maxi? I think its awesome. I am going to bring sausages to saturdays party. Oh yes thank you."

const results = await inference.summarization({
    model: model, 
    inputs: text
})

// Output model's response
console.log(results)
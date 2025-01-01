// ############################### Initialize ###############################
// Importing required libraries
import { HfInference } from '@huggingface/inference';
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import fs from 'fs';

dotenv.config();

const app = express();
const port = 3000;

// ############################ Server Code #############################

// Allow Cross Domain from LiveServer + Middleware to process binary data (Raw Body)
app.use(cors({
    origin: 'http://127.0.0.1:5500' // Allows only cross referencing from this domain (VSCode Live Server)
}));
app.use(express.raw({ type: 'audio/webm', limit: '10mb' }));

// Route to receive audio blob
app.post('/upload', async (req, res) => {
    try {
        const audioBuffer = req.body;
        console.log('Audio-Daten empfangen:', audioBuffer);
        console.log(`Audio-Datenlänge: ${audioBuffer.length} Bytes`);

        var transcription = await transcribeRecording(audioBuffer);

        res.send(transcription);
    } catch (error) {
        console.error('Fehler beim Verarbeiten des Audio-Daten:', error);
        res.status(500).send({ message: 'Fehler beim Verarbeiten der Audio-Daten.' });
    }
});

// Start Server
app.listen(port, () => {
    console.log(`Server läuft auf http://localhost:${port}`);
});

// ############################# Hugging Face Code ################################

// Set some constants to interact with Hugging Face Inference API
const inference = new HfInference(process.env.HF_ACCESS_TOKEN); // inference library loads access token from the .env file
const sumModel = 'knkarthick/MEETING_SUMMARY';
const speechRecogModel = 'openai/whisper-large-v3-turbo';
const imgModel = 'black-forest-labs/FLUX.1-dev';

async function transcribeRecording(audio) {
    try {
        var result_text = "";

        const results = await inference.automaticSpeechRecognition({
            model: speechRecogModel,
            data: audio
        });
        
        console.log('Transkriptions-Ergebnisse:', results.text);
        result_text += "<b>Transkriptions-Ergebnisse:</b><br />" + results.text + "<br /><br /><br />";


        // const image_results = await inference.textToImage({
        //     model: imgModel, 
        //     inputs: "volleball tournament" + " icon"
        // });
        
        // console.log('Text-to-Image-Ergebnisse:', image_results);
        // fs.writeFile('./public/temp/icons/test.png', await image_results.arrayBuffer().then((arrayBuffer) => Buffer.from(arrayBuffer, "binary")), function (err) {
        //     if (err) throw err;
        //     console.log('Image Created');
        // }); 
        // //result_text += `<img src="${URL.createObjectURL(image_results)}" /><br /><br /><br />`;
        

        var test_text = "Hi! Hello How are you today? I'm very good thank you. Should we start? Yes. We have to design the new Remote. Yes how about we add Buttons, Noam? Oh yes Marcel that is a very good idea. What do you think Maxi? I think its awesome. I am going to bring sausages to saturdays party. Oh yes thank you."
        const sum_results = await inference.summarization({
            model: sumModel, 
            inputs: results.text
        });
        
        console.log('Summarization-Ergebnisse:', sum_results.summary_text);
        result_text += "<b>Zusammenfassung Ergebnisse:</b><br />" + sum_results.summary_text + "<br /><br /><br />";
        
        return result_text;
    } catch (error) {
        console.error('Fehler bei der Transkription:', error);
        throw new Error('Transkription fehlgeschlagen');
    }
}
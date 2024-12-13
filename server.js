// ############################### Initialize ###############################
// Importing required libraries
import { HfInference } from '@huggingface/inference';
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';

dotenv.config();

const app = express();
const port = 3000;

// ############################ Server Code #############################

// Allow Cross Domain from LiveServer + Middleware zum Verarbeiten von Binärdaten (Raw Body)
app.use(cors({
    origin: 'http://127.0.0.1:5500' // Erlaubt nur Anfragen von dieser Domain (z.B. VSCode Live Server)
}));
app.use(express.raw({ type: 'audio/webm', limit: '10mb' })); // Limit je nach Bedarf anpassen

// Route zum Empfangen des AudioBlobs
app.post('/upload', async (req, res) => {
    try {
        const audioBuffer = req.body; // Der Audio-Blob als Buffer
        console.log('Audio-Daten empfangen:', audioBuffer);
        console.log(`Audio-Datenlänge: ${audioBuffer.length} Bytes`);

        // Sende Audio an Transkriptions Funktion
        var transcription = await transcribeRecording(audioBuffer);

        // Bestätigung an den Client senden
        res.send(transcription);
    } catch (error) {
        console.error('Fehler beim Verarbeiten des Audio-Daten:', error);
        res.status(500).send({ message: 'Fehler beim Verarbeiten der Audio-Daten.' });
    }
});

// Server starten
app.listen(port, () => {
    console.log(`Server läuft auf http://localhost:${port}`);
});

// ############################# Hugging Face Code ################################

// Set some constants
const inference = new HfInference(process.env.HF_ACCESS_TOKEN); // inference library loads access token from the .env file
const sumModel = 'knkarthick/MEETING_SUMMARY';
const speechRecogModel = 'openai/whisper-large-v3-turbo';

async function transcribeRecording(audio) {
    try {
        const results = await inference.automaticSpeechRecognition({
            model: speechRecogModel,
            data: audio // ArrayBuffer anstelle von Buffer übergeben
        });
        
        console.log('Transkriptions-Ergebnisse:', results.text);

        // var test_text = "Hi! Hello How are you today? I'm very good thank you. Should we start? Yes. We have to design the new Remote. Yes how about we add Buttons, Noam? Oh yes Marcel that is a very good idea. What do you think Maxi? I think its awesome. I am going to bring sausages to saturdays party. Oh yes thank you."

        const sum_results = await inference.summarization({
            model: sumModel, 
            inputs: results.text
        });
        
        console.log('Summarization-Ergebnisse:', sum_results.summary_text);
        
        return sum_results.summary_text;
    } catch (error) {
        console.error('Fehler bei der Transkription:', error);
        throw new Error('Transkription fehlgeschlagen');
    }
}
// ############################### Code ###############################

var button = document.getElementById("record-button");
button?.addEventListener("click", startRecording);

var text = document.getElementById("text-span");


var isRecording = false;
var mediaRecorder = null;
var stream = null;

async function startRecording() {
    if (!isRecording) {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        const audioChunks = [];

        mediaRecorder.ondataavailable = event => audioChunks.push(event.data);
        mediaRecorder.onstop = async () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            await sendAudioToServer(audioBlob); // Sende den AudioBlob an den Server
        };
        mediaRecorder.start();
        isRecording = true;
        console.log("Recording started...");
    }
    else {
        mediaRecorder.stop();
        isRecording = false;
        console.log("Recording stopped...");

        // Beende den Zugriff auf das Mikrofon
        if (stream) {
            stream.getTracks().forEach((track) => track.stop());
        }
    }
}

// Funktion zum Senden des AudioBlobs an den Server
async function sendAudioToServer(audioBlob) {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm'); // Füge den Blob als Datei hinzu

    try {
        const response = await fetch('http://localhost:3000/upload', {
            method: 'POST',
            headers: {
                'Content-Type': 'audio/webm' // Der MIME-Typ des AudioBlobs
            },
            body: formData
        });

        if (response.ok) {
            console.log(response);
            const result = await response.text();
            text.innerHTML = result;
        } else {
            console.error('Fehler beim Senden des Audios:', response.statusText);
        }
    } catch (error) {
        console.error('Fehler beim Senden der Anfrage:', error);
    }
}
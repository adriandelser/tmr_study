document.addEventListener("DOMContentLoaded", function() {
    const wordDisplay = document.getElementById("word-display");
    const audioPlayer = document.getElementById("audio-player");

    fetch("assets/liste_mot_wav.csv")
        .then(response => response.text())
        .then(data => {
            const lines = data.split('\n').filter(line => line.trim() !== "");
            const wordAudioPairs = lines.map(line => {
                const [word, audioPath] = line.split(',');
                return { word: word.trim(), audio: audioPath.trim() };
            });

            function playRandomWord() {
                const randomIndex = Math.floor(Math.random() * wordAudioPairs.length);
                const selectedPair = wordAudioPairs[randomIndex];

                wordDisplay.textContent = selectedPair.word;
                audioPlayer.src = selectedPair.audio;
                audioPlayer.play();
            }

            setInterval(playRandomWord, 5000); // Change word every 5 seconds
        });
});

document.addEventListener("DOMContentLoaded", function() {
    const nameInputOverlay = document.getElementById("name-input-overlay");
    const participantNameInput = document.getElementById("participant-name");
    const submitNameButton = document.getElementById("submit-name");
    const submitTranslationButton = document.getElementById("submit-translation");

    const wordDisplay = document.getElementById("word-display");
    const audioPlayer = document.getElementById("audio-player");
    const textInput = document.getElementById("text-input");
    const welcomeOverlay = document.getElementById("welcome-overlay");
    const phase2Instructions = document.getElementById("phase2-instructions");
    const thanksMessage = document.getElementById("thanks-message");

    let participantName = "";
    let wordAudioPairs = [];
    let currentPhase = 0;  // Start at Phase 0
    let currentIndex = 0;
    let shuffledWords = [];
    let trialData = []; // Array to hold all trial data

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function startPhase1() {
        nameInputOverlay.style.display = 'none'; // Hide the name input overlay
        welcomeOverlay.style.display = 'block';  // Show the welcome overlay
        textInput.style.display = 'none';  // Ensure the text input is hidden in Phase 1
        currentPhase = 1;  // Update phase to Phase 1
    }

    function playNextWordPhase1() {
        if (currentIndex < shuffledWords.length) {
            const selectedPair = shuffledWords[currentIndex];
            wordDisplay.textContent = selectedPair.word;
            audioPlayer.src = selectedPair.audio;
            audioPlayer.play();

            audioPlayer.onended = function() {
                setTimeout(function() {
                    currentIndex++;
                    playNextWordPhase1();
                }, 5000);  // 5-second delay before moving to the next word
            };
        } else {
            // Move to Phase 2
            currentPhase = 2;
            currentIndex = 0;
            wordDisplay.style.display = 'none';
            phase2Instructions.style.display = 'block';
        }
    }

    function startPhase2() {
        phase2Instructions.style.display = 'none';
        wordDisplay.style.display = 'block';
        textInput.style.display = 'block'; // Show the text input during Phase 2
        submitTranslationButton.style.display = 'block'; // Show the submit button in Phase 2
        wordDisplay.textContent = "Écoutez attentivement le mot et entrez la traduction."; // Instruction to listen
        shuffledWords = shuffleArray([...wordAudioPairs]); // Reshuffle the array
        // shuffledWords = shuffledWords.slice(0, 2);
    
        playNextWordPhase2();
    }

    function playNextWordPhase2() {
        if (currentIndex < shuffledWords.length) {
            const selectedPair = shuffledWords[currentIndex];
            audioPlayer.src = selectedPair.audio;
            audioPlayer.play();

            // Wait for the audio to end before prompting user input
            audioPlayer.onended = function() {
                textInput.value = '';
                textInput.focus();
            };
        } else {
            // Show thank you message
            wordDisplay.style.display = 'none';
            textInput.style.display = 'none';
            submitTranslationButton.style.display = 'none';
            thanksMessage.style.display = 'block';
            currentPhase = 3;
            downloadCSV(); // Download the CSV file at the end
        }
    }

    function handleUserInput() {
        if (currentPhase === 2 && textInput.style.display !== 'none') {
            // Collect data for this trial
            let trial = {
                french_word: shuffledWords[currentIndex].word,
                japanese_audio: shuffledWords[currentIndex].audio,
                thisRepN: 0, // Example placeholder values
                thisTrialN: 0, // Example placeholder values
                thisN: currentIndex, 
                thisIndex: currentIndex, 
                thisRow_t: "", // Example placeholder values
                notes: "", // Example placeholder values
                response: textInput.value.trim(),
                participant: participantName
            };
            trialData.push(trial);

            currentIndex++;
            playNextWordPhase2();
        } else if (currentPhase === 3 && thanksMessage.style.display !== 'none') {
            // End the experiment
            thanksMessage.style.display = 'none';
            // You can add additional code here if needed
        }
    }

    // Convert the trial data to CSV format and trigger a download
    function downloadCSV() {
        let csvContent = "data:text/csv;charset=utf-8," 
            + "french_word,japanese_audio,thisRepN,thisTrialN,thisN,thisIndex,thisRow_t,notes,response,participant\n";

        trialData.forEach(function(row) {
            let rowContent = `${row.french_word},${row.japanese_audio},${row.thisRepN},${row.thisTrialN},${row.thisN},${row.thisIndex},${row.thisRow_t},${row.notes},${row.response},${row.participant}`;
            csvContent += rowContent + "\n";
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "experiment_data.csv");
        document.body.appendChild(link); // Required for FF

        link.click(); // This will trigger the download
    }

    // Handle name submission in Phase 0
    submitNameButton.addEventListener("click", function() {
        participantName = participantNameInput.value.trim();
        if (participantName) {
            startPhase1(); // Move to Phase 1
        } else {
            alert("Veuillez entrer votre nom pour continuer.");
        }
    });

    // Add event listener for the submit button in Phase 2
    submitTranslationButton.addEventListener("click", function() {
        console.log('Submit button clicked in Phase 2'); // Debugging info
        handleUserInput();
    });

    // Handle name submission via Enter key in Phase 0
    participantNameInput.addEventListener("keydown", function(event) {
        if (event.key === "Enter") {
            participantName = participantNameInput.value.trim();
            if (participantName) {
                startPhase1(); // Move to Phase 1
            } else {
                alert("Veuillez entrer votre nom pour continuer.");
            }
        }
    });

    // Start Phase 1 after pressing Enter on the welcome screen
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            if (currentPhase === 1 && welcomeOverlay.style.display !== 'none') {
                welcomeOverlay.style.display = 'none'; // Hide the welcome overlay
                wordDisplay.style.display = 'block'; // Show word display
                shuffledWords = shuffleArray([...wordAudioPairs]); // Shuffle words
                // shuffledWords = shuffledWords.slice(0,2); // For testing
                currentIndex = 0; // Reset index for Phase 1
                playNextWordPhase1(); // Start Phase 1 word playback
            } else if (currentPhase === 2 && phase2Instructions.style.display !== 'none') {
                startPhase2(); // Start Phase 2
            } else if (currentPhase === 2 && textInput.style.display !== 'none') {
                handleUserInput(); // Handle translation input in Phase 2
            } else if (currentPhase === 3 && thanksMessage.style.display !== 'none') {
                handleUserInput(); // End the experiment
            }
        }
    });

    // Load the CSV file and initialize the word list
    fetch("assets/liste_mot_wav.csv")
        .then(response => response.text())
        .then(data => {
            const lines = data.split('\n').filter(line => line.trim() !== "");
            wordAudioPairs = lines.map(line => {
                const [word, audioPath] = line.split(',');
                return { word: word.trim(), audio: audioPath.trim() };
            });
        });
});

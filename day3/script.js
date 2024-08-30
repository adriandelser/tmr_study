document.addEventListener("DOMContentLoaded", function() {
    const nameInputOverlay = document.getElementById("name-input-overlay");
    const participantNameInput = document.getElementById("participant-name");
    const submitNameButton = document.getElementById("submit-name");
    const submitTranslationButton = document.getElementById("submit-translation");

    const wordDisplay = document.getElementById("word-display");
    const audioPlayer = document.getElementById("audio-player");
    const textInput = document.getElementById("text-input");
    const feedbackDisplay = document.createElement("div"); // Element for showing feedback
    const phase2Instructions = document.getElementById("phase2-instructions");
    const thanksMessage = document.getElementById("thanks-message");
    const welcomeOverlay = document.getElementById("welcome-overlay");

    let participantName = "";
    let wordAudioPairs = [];
    let currentPhase = 0;  // Start at Phase 0
    let currentIndex = 0;
    let shuffledWords = [];
    let trialData = []; // Array to hold all trial data

    feedbackDisplay.id = "feedback-display"; // Set ID for feedback display
    feedbackDisplay.style.textAlign = "center"; // Center feedback text
    document.body.appendChild(feedbackDisplay); // Add feedback display to the body

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
        document.getElementById("continue-phase1").style.display = 'block'; // Show the continue button
        textInput.style.display = 'none';  // Ensure the text input is hidden in Phase 1
        currentPhase = 1;  // Update phase to Phase 1
    }

    function playNextWordPhase1() {
        if (currentIndex < shuffledWords.length) {
            const selectedPair = shuffledWords[currentIndex];
            audioPlayer.src = selectedPair.audio;
            audioPlayer.play();
            textInput.value = '';
            feedbackDisplay.textContent = ''; // Clear previous feedback

            // Wait for the audio to end before prompting user input
            audioPlayer.onended = function() {
                textInput.focus();
            };
        } else {
            // Move to Phase 2
            currentPhase = 2;
            currentIndex = 0;
            wordDisplay.style.display = 'none';
            feedbackDisplay.style.display = 'none'; // Hide feedback in Phase 2
            phase2Instructions.style.display = 'block';
            document.getElementById("continue-phase2").style.display = 'block'; // Show the continue button
        }
    }

    function playNextWordPhase2() {
        if (currentIndex < shuffledWords.length) {
            const selectedPair = shuffledWords[currentIndex];
            audioPlayer.src = selectedPair.audio;
            audioPlayer.play();
            textInput.value = '';
            feedbackDisplay.textContent = ''; // No feedback in Phase 2

            // Wait for the audio to end before prompting user input
            audioPlayer.onended = function() {
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
        if (currentPhase === 1 && textInput.style.display !== 'none') {
            if (!textInput.value.trim()) {
                alert("Veuillez tenter de répondre ou entrez un caractère si vous ne connaissez pas la réponse.");
                return;  // Prevent further execution until the user enters something
            }
            
            // Check if the word is already in trialData
            let trial = trialData.find(trial => trial.french_word === shuffledWords[currentIndex].word);
            
            if (!trial) {
                // If not, create a new trial entry
                trial = {
                    french_word: shuffledWords[currentIndex].word,
                    japanese_audio: shuffledWords[currentIndex].audio,
                    phase1_response: textInput.value.trim(),  // Store the response for Phase 1
                    phase2_response: "",  // Placeholder for Phase 2 response
                    participant: participantName
                };
                trialData.push(trial);
            } else {
                // If it exists, just update the Phase 1 response (for edge cases)
                trial.phase1_response = textInput.value.trim();
            }
    
            // Show feedback (correct translation) in Phase 1
            feedbackDisplay.textContent = `Réponse Correcte: ${shuffledWords[currentIndex].word}`;
    
            currentIndex++;
            setTimeout(playNextWordPhase1, 3000); // Wait 3 seconds before moving to next word
    
        } else if (currentPhase === 2 && textInput.style.display !== 'none') {
            if (!textInput.value.trim()) {
                alert("Veuillez tenter de répondre ou entrez un caractère si vous ne connaissez pas la réponse.");
                return;  // Prevent further execution until the user enters something
            }
    
            // Find the trial entry and update the Phase 2 response
            let trial = trialData.find(trial => trial.french_word === shuffledWords[currentIndex].word);
            if (trial) {
                trial.phase2_response = textInput.value.trim();
            }
    
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
            + "french_word,japanese_audio,phase1_response,phase2_response,participant\n";
    
        trialData.forEach(function(row) {
            let rowContent = `${row.french_word},${row.japanese_audio},${row.phase1_response},${row.phase2_response},${row.participant}`;
            csvContent += rowContent + "\n";
        });
    
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${participantName}_day_3.csv`);  // Dynamic naming
        document.body.appendChild(link); // Required for FF
    
        link.click(); // This will trigger the download
    }
    

    function handleNameSubmission(){
        // Handle name submission
        participantName = participantNameInput.value.trim();
        if (participantName) {
            startPhase1(); // Move to Phase 1
        } else {
            alert("Veuillez entrer votre nom pour continuer.");
        }
    }

    // Unified keydown event listener to handle Enter key across phases
    document.addEventListener("keydown", function(event) {
        if (event.key === "Enter") {
            if (currentPhase === 0 && participantNameInput === document.activeElement) {
                handleNameSubmission();
            } else if (currentPhase === 1 && welcomeOverlay.style.display !== 'none') {
                // Hide welcome overlay and start Phase 1 instructions
                document.getElementById("continue-phase1").click(); // Simulate the click on the continue button
            } else if (currentPhase === 1 && textInput.style.display !== 'none') {
                handleUserInput(); // Handle translation input with feedback in Phase 1
            } else if (currentPhase === 2 && phase2Instructions.style.display !== 'none') {
                document.getElementById("continue-phase2").click()
            } else if (currentPhase === 2 && textInput.style.display !== 'none') {
                handleUserInput(); // Handle translation input without feedback in Phase 2
            } else if (currentPhase === 2 && phase2Instructions.style.display !== 'none') {
                // Hide Phase 2 instructions and start Phase 2
                document.getElementById("continue-phase2").click(); // Simulate the click on the continue button
            } else if (currentPhase === 3 && thanksMessage.style.display !== 'none') {
                handleUserInput(); // End the experiment
            }
        }
    });



        // function startPhase1() {
    //     nameInputOverlay.style.display = 'none'; // Hide the name input overlay
    //     wordDisplay.style.display = 'block';
    //     textInput.style.display = 'block'; // Show the text input
    //     submitTranslationButton.style.display = 'block'; // Show the submit button
    //     wordDisplay.textContent = "Écoutez attentivement le mot et entrez la traduction."; // Instruction to listen
    //     shuffledWords = shuffleArray([...wordAudioPairs]); // Reshuffle the array
    //     currentPhase = 1;  // Update phase to Phase 1
    
    //     playNextWordPhase1();
    // }
    // Add event listener for the Continue button in Phase 1
    document.getElementById("continue-phase1").addEventListener("click", function() {
        document.getElementById("continue-phase1").style.display = 'none'; // Hide the button after clicking
        welcomeOverlay.style.display = 'none'; // Hide the welcome overlay
        wordDisplay.style.display = 'block'; // Show word display
        textInput.style.display = 'block'; // Show the text input during Phase 2
        submitTranslationButton.style.display = 'block'; // Show the submit button in Phase 2
        wordDisplay.textContent = "Écoutez attentivement le mot et entrez la traduction."; // Instruction to listen
        shuffledWords = shuffleArray([...wordAudioPairs]); // Shuffle words
        // shuffledWords = shuffledWords.slice(0,2); // For testing
        currentIndex = 0; // Reset index for Phase 1
        // globalKeydownEnabled = true; // Re-enable the global keydown listener
        playNextWordPhase1(); // Start Phase 1 word playback
    });

    // Add event listener for the Continue button in Phase 2
    document.getElementById("continue-phase2").addEventListener("click", function() {
        document.getElementById("continue-phase2").style.display = 'none'; // Hide the button after clicking
        phase2Instructions.style.display = 'none'; // Hide the phase 2 instructions
        wordDisplay.style.display = 'block'; // Show word display
        textInput.style.display = 'block'; // Show the text input during Phase 2
        submitTranslationButton.style.display = 'block'; // Show the submit button in Phase 2
        currentPhase = 2; // Set the current phase to 2
        shuffledWords = shuffleArray([...wordAudioPairs]); // Reshuffle the array
        currentIndex = 0; // Reset the index for Phase 2
        playNextWordPhase2(); // Start Phase 2 word playback
    });

    // Add event listener for the submit button in Phase 1 and Phase 2
    submitTranslationButton.addEventListener("click", function() {
        handleUserInput();
    });

    // Add event listener for the name
    submitNameButton.addEventListener("click", function() {
        handleNameSubmission();
    });

    // Load the CSV file and initialize the word list
    fetch("../assets/liste_mot_wav.csv")
        .then(response => response.text())
        .then(data => {
            const lines = data.split('\n').filter(line => line.trim() !== "");
            wordAudioPairs = lines.map(line => {
                const [word, audioPath] = line.split(',');
                return {
                    word: word.trim(),
                    audio: `../${audioPath.trim()}` // Adjust the audio path
                };
            });
        });
});

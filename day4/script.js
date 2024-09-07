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
    let isAudioPlaying = false; // Flag to track if the audio is playing


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
            
            isAudioPlaying = true; // Audio is playing, block input
            textInput.disabled = true; // Disable input while audio is playing
            submitTranslationButton.disabled = true; // Disable submit button

            const selectedPair = shuffledWords[currentIndex];
            const audioPlayer = selectedPair.audio; // Use the preloaded Audio object

            // Add error handling
            audioPlayer.onerror = function() {
                console.error(`Error playing audio: ${selectedPair.audio.src}. Skipping to the next word.`);
                currentIndex++;
                playNextWordPhase1(); // Skip to the next word
            };
    
            audioPlayer.play();
            textInput.value = '';
            feedbackDisplay.textContent = ''; // Clear previous feedback
    
            // Wait for the audio to end before prompting user input
            // When the audio finishes, allow user input
            audioPlayer.onended = function() {
                isAudioPlaying = false; // Audio finished, allow input
                textInput.disabled = false; // Enable input again
                submitTranslationButton.disabled = false; // Enable submit button again
                textInput.focus();
            };

        } else {
            // Show thank you message
            wordDisplay.style.display = 'none';
            textInput.style.display = 'none';
            submitTranslationButton.style.display = 'none';
            thanksMessage.style.display = 'block';
            currentPhase = 2;
            downloadCSV(); // Download the CSV file at the end
        }
    }
    

    function handleUserInput() {

        // Prevent input if the audio is still playing
        if (isAudioPlaying) {
            showInputError(); // Show the red outline and shake effect
            return;
        }

        if (currentPhase === 1 && textInput.style.display !== 'none') {
            if (!textInput.value.trim()) {
                showInputError(); // Show the red outline and shake effect for empty input
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
                    // phase2_response: "",  // Placeholder for Phase 2 response
                    participant: participantName
                };
                trialData.push(trial);
            } else {
                // If it exists, just update the Phase 1 response (for edge cases)
                trial.phase1_response = textInput.value.trim();
            }
    
            // Show feedback (correct translation) in Phase 1
            // feedbackDisplay.textContent = `Réponse Correcte: ${shuffledWords[currentIndex].word}`;
            // Disable input during the 0.5-second delay
            textInput.disabled = true; 
            submitTranslationButton.disabled = true; 
            currentIndex++;
            setTimeout(playNextWordPhase1, 500); // Wait 0.5 seconds before moving to next word
    
        
        } else if (currentPhase === 2 && thanksMessage.style.display !== 'none') {
            // End the experiment
            thanksMessage.style.display = 'none';
            // You can add additional code here if needed
        }
    }
    

    // Function to show the input error with red outline and shake effect
    function showInputError() {
        textInput.classList.add('input-error');  // Add the red outline and shake effect
        setTimeout(() => {
            textInput.classList.remove('input-error');  // Remove it after 500ms
        }, 500);
    }
    
    function downloadCSV() {
        let csvContent = "french_word,japanese_audio,phase1_response,participant\n";
    
        trialData.forEach(function(row) {
            // Extract the audio source from the HTMLAudioElement
            let audioSrc = row.japanese_audio.src; 
            let rowContent = `${row.french_word},${audioSrc},${row.phase1_response},${row.participant}`;
            csvContent += rowContent + "\n";
        });
    
        const day = 4;  // Replace with the correct day for the experiment
        const filename = `${participantName}_day_${day}.csv`;
    
        // Send the CSV via email, then trigger the download
        sendCSV(csvContent, filename, participantName, day, function() {
            // After sending the email, trigger the download
            const encodedUri = encodeURI(`data:text/csv;charset=utf-8,${csvContent}`);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", filename);
            document.body.appendChild(link); // Required for FF
    
            link.click(); // This will trigger the download
        });
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
            } else if (currentPhase === 1 && textInput.style.display !== 'none' && !isAudioPlaying && !textInput.disabled) {
                handleUserInput(); // Handle translation input in Phase 1 only if audio has ended and input is enabled
            } else if (isAudioPlaying || textInput.disabled) {
                showInputError(); // Show error if Enter is pressed during the transition or audio playback
            }
        }
    });

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

    

    // Add event listener for the submit button in Phase 2
    submitTranslationButton.addEventListener("click", function() {
        if (!isAudioPlaying && !textInput.disabled) {
            handleUserInput(); // Handle submission only if audio has ended and input is enabled
        } else {
            showInputError(); // Show error if the submit button is clicked during the transition or audio playback
        }
    });

    // Add event listener for the name
    submitNameButton.addEventListener("click", function() {
        handleNameSubmission();
    });

    // Load the CSV file and initialize the word list
    fetch("../assets/liste_mot_mp3.csv")
        .then(response => response.text())
        .then(data => {
            const lines = data.split('\n').filter(line => line.trim() !== "");
            wordAudioPairs = lines.map(line => {
                const [word, audioPath] = line.split(',');
                const audio = new Audio(`../${audioPath.trim()}`); // Create an Audio object to preload the file
                return {
                    word: word.trim(),
                    audio: audio // Store the preloaded Audio object
                };
            });
        });
    
});

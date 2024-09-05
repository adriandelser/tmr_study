#!/bin/bash

# Create the output directory if it doesn't exist
mkdir -p output

# Loop through all .wav files in the audio directory
for file in audio/*.wav; do
  # Extract the base name (filename without extension)
  basename=$(basename "$file" .wav)
  
  # Convert the .wav file to .mp3 and save in the output directory
  ffmpeg -i "$file" "output/${basename}.mp3"
done


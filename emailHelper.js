// emailHelper.js

function sendCSV(csvContent, filename, participantName, day, callback) {
    fetch('/.netlify/functions/sendEmail', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            csvContent: csvContent,
            filename: filename,
            participantName: participantName,
            day: day
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log(data.message); // Handle the server response
        showEmailStatus(true); // Show success icon and message
        if (callback) callback();  // Trigger the callback to download the file
    })
    .catch(error => {
        console.error('Error sending the email:', error);
        showEmailStatus(false); // Show error icon and message
        if (callback) callback();  // Still trigger the callback to download the file
    });
}
    

// function sendCSV(csvContent, filename, participantName, day, callback) {
//     fetch('/.netlify/functions/sendEmail', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({
//             csvContent: csvContent,
//             filename: filename,
//             participantName: participantName,
//             day: day
//         })
//     })
//     .then(response => response.json())
//     .then(data => {
//         console.log(data.message); // Handle the server response
//         showEmailStatus(true); // Show success icon and message
//         if (callback) callback();  // Trigger the callback to download the file
//     })
//     .catch(error => {
//         console.error('Error sending the email:', error);
//         showEmailStatus(false); // Show error icon and message
//         if (callback) callback();  // Still trigger the callback to download the file
//     });
// }

function showEmailStatus(success) {
    const statusContainer = document.getElementById('email-status');
    const successIcon = document.getElementById('success-icon');
    const errorIcon = document.getElementById('error-icon');
    const statusMessage = document.getElementById('status-message');

    statusContainer.style.display = 'block'; // Show the container

    if (success) {
        successIcon.style.display = 'inline';
        errorIcon.style.display = 'none';
        statusMessage.textContent = 'Email envoyé avec succès!';
        statusMessage.style.color = 'white';
    } else {
        successIcon.style.display = 'none';
        errorIcon.style.display = 'inline';
        statusMessage.textContent = 'Erreur de mail.';
        statusMessage.style.color = 'red';
    }
}

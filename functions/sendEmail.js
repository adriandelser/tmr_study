const nodemailer = require('nodemailer');

exports.handler = async function(event, context) {
    if (event.httpMethod === 'POST') {
        const { csvContent, filename, participantName, day } = JSON.parse(event.body);

        // Create a transporter object using Gmail
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USERNAME, // Your Gmail address
                pass: process.env.GMAIL_PASSWORD, // Your Gmail password or App Password
            },
        });

        // Setup email data
        let mailOptions = {
            from: process.env.GMAIL_USERNAME, // Sender address
            to: 'adrian.delser@gmail.com', // Your recipient email
            subject: `TMR Experiment Results: ${participantName} - Day ${day}`,  // Dynamic subject line
            text: 'Please find the attached CSV file from the experiment.', // Plain text body
            attachments: [
                {
                    filename: filename,
                    content: csvContent,
                    contentType: 'text/csv',
                },
            ],
        };

        try {
            await transporter.sendMail(mailOptions);
            return {
                statusCode: 200,
                body: JSON.stringify({ message: 'Email sent successfully!' }),
            };
        } catch (error) {
            console.error('Error sending email:',process.env.GMAIL_USERNAME,process.env.GMAIL_PASSWORD, error);
            return {
                statusCode: 500,
                body: JSON.stringify({
                    message: 'Error sending email',
                    error: error.message,  // Log the error message
                    username: process.env.EMAIL_USERNAME  // Include the username in the response
                }),
            };
        }
    } else {
        return {
            statusCode: 405,
            body: JSON.stringify({ message: 'Method not allowed' }),
        };
    }
};

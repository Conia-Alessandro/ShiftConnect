/**
 * Sanitizes input
 */
// Function to sanitize input and allow only alphabetic characters
function sanitizeInput(input){
    return input.replace(/[^A-Za-z]/g, ''); // This regex replaces any character that is not a letter with an empty string
};

export default sanitizeInput;

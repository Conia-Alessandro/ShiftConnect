/**
 * splits a string by space, returns firstName, lastname and any extra parts
 * @param {String} inputString 
 * @returns 
 */
function splitStringBySpace(inputString) {
    const parts = inputString.split(' ');
    let name, surname, extra;
  
    // Assign values based on the number of parts
    if (parts.length >= 1) {
        name = parts[0];
    }
    if (parts.length >= 2) {
        surname = parts[1];
    }
    if (parts.length > 2) {
        extra = parts.slice(2).join(' ');
    }
  
    return { name, surname, extra };
  }
  
  // Export the function
  export default splitStringBySpace;
  
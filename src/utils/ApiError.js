
class ApiError extends Error {
    /**
     * Constructor to initialize the ApiError instance.
     * @param {number} statusCode - HTTP status code for the error (e.g., 404, 500).
     * @param {string} [message="Something went wrong"] - A human-readable error message.
     * @param {Array} [errors=[]] - An array of additional error details (optional).
     * @param {string} [stack=""] - The stack trace for the error (optional).
     */
    constructor( 
        statusCode,               
        message = "Something went wrong", 
        errors = [],               
        stack = ""              
    ) {
        super(message); 
        this.statusCode = statusCode; 
        this.data = null; 
        this.message = message; 
        this.success = false; 
        this.errors = errors; 

        if (stack) {
            this.stack = stack; 
        } else {
            Error.captureStackTrace(this, this.constructor); 
        }
    }
}

export { ApiError };
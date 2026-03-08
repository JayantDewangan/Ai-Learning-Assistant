// This is the "Error Translator". It catches all errors in the backend and sends friendly messages to the user instead of scary technical errors
/*
400 - Bad request : Used when Invalid input, duplicate data, file too large
401 - Unauthorized : Invalid/expired JWT tokens
404 - Not found : Invalid MongoDB ID
500 - Server Error : Unexpected errors 
*/

// Express automatically calls this function whenever an error occurs anywhere in the backend.
const errorHandler = (err, req, res, next)=>{
    let statusCode = err.statusCode || 500; // if the error already has a status code use it otherwise use 500
    let message = err.message || 'Server Error'; // if the error already has a message use it otherwise use this default message 

    // Mongoose bad ObjectId : Invalid MongoDB ID
    // If someone types a malformed ID, MongoDB throws CastError
    if(err.name === 'CastError'){
        message = 'Resource not found';
        statusCode = 404;
    }

    // Mangoose duplicate key : Example : err.keyValue = { email: "john@gmail.com" }
    if(err.code === 11000){
        const field = Object.keys(err.keyValue)[0]; // extracts : email
        message = `${field} already exists`;
        statusCode = 400;
    }

    // Mongoose Validation error : Example : err.errors = {
    // password: { message: "Password must be at least 6 characters" },
    // email: { message: "Invalid email format" }
    // }
    if(err.name === 'ValidationError'){
        message = Object.values(err.errors).map(val=>val.message).join(', ');
        statusCode = 400;
    }

    // Multer file Size error : file too large
    if(err.code === 'LIMIT_FILE_SIZE'){
        message = 'File size exceeds the maximum limit of 10MB';
        statusCode = 400;
    }

    // JWT Errors : 
    if(err.name === 'JsonWebTokenError'){
        message = 'Invalid token'
        statusCode = 401;
    }   

    if(err.name === 'TokenExpiredError'){
        message = 'Token Expired';
        statusCode = 401;
    }

    console.error('Error',{
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        // Logs error to servre console, In development shows the full error stack trace(cleaner for debugging) but in production it hides stack trace(cleaner logs, security)
    });

    res.status(statusCode).json({
        success: false,
        error: message,
        statusCode,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

export default errorHandler;
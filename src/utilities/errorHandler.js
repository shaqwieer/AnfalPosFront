export function handleError(err, loading, defaultErrorMessage = 'An unexpected error occurred. Please try again later.') {
    let errorMessage;
    console.log(err.response?.data?.message);
    if (err.response) {
        switch (err.response.status) {
            case 400:
                errorMessage = err.response.data?.message ||'Bad request. Please check your input.';
                break;
            case 401:
                errorMessage = 'Unauthorized access. Please log in again.';
                break;
            case 403:
                errorMessage = 'Forbidden. You do not have permission to perform this action.';
                break;
            case 404:
                errorMessage = err.response.data?.message ||'Resource not found. The requested resource could not be found.';
                break;
            case 500:
                errorMessage = err.response.data?.message ||'Internal server error. Please try again later.';
                break;
            default:
                errorMessage = err.response.data?.message || defaultErrorMessage;
        }
    } else {
        // Handle non-response errors
        errorMessage = err.message || defaultErrorMessage;
    }
    console.error(' Error:', err);

    loading.setNotificationInfo('error', errorMessage);

    return errorMessage;
}
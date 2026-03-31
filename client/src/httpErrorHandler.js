import axios from 'axios';

export default function httpErrorHandler(error){
    if (error.response) {
        return {
            status: error.response.status,
            message: error.response.data?.message || 'A server error occurred.',
            data: error.response.data,
        };
    }
    else if (error.request) {
        return {
            status: 0,
            message: 'Network error. Please check your internet connection.',
            data: null,
        };
    }
    else {
        return {
            status: null,
            message: 'An unexpected error occurred.',
            data: null,
        };
    }
}
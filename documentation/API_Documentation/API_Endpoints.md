# API Documentation

## Prediction
### POST /predict
- Description: Upload an eye image for prediction
- Request: multipart/form-data with field `image`
- Response: JSON with predicted class and confidence
- Status Codes: 200, 400, 500

## Health Check
### GET /health
- Description: Check whether the backend is running
- Response: JSON status

## Error Codes
- 400: No file uploaded or invalid request
- 500: Prediction processing failed

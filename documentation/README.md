# AI-Based Eye Disease Detection and Eye Care Recommendation System

## Project Overview
This project develops an intelligent eye disease screening system that helps users upload eye images and receive a preliminary AI-based prediction along with educational guidance. The system is designed for final-year engineering demonstration, academic submission, and future extension into a full medical-support platform.

## Features
- Image-based eye disease prediction
- Preliminary screening results with confidence score
- Eye-care guidance and educational information
- Chatbot support for general queries
- Backend API for prediction integration
- Admin and user role separation
- Report generation support

## Technology Stack
- Python for AI model
- Flask for backend API
- TensorFlow/Keras for deep learning
- Pillow and NumPy for image processing
- Markdown documentation for project records

## Folder Structure
- ai_model/: model training, prediction, and AI pipeline
- backend/: Flask API server
- frontend/: user interface
- documentation/: project documentation, reports, manuals, and diagrams

## Installation Steps
1. Clone the repository
2. Create a Python virtual environment
3. Install dependencies using pip
4. Run the AI model training script
5. Start the backend server

## Running the Project
```bash
cd ai_model
pip install -r requirements.txt
python train.py
python predict.py sample.jpg

cd ../backend
pip install -r requirements.txt
python app.py
```

## AI Workflow
1. User uploads an eye image
2. Backend receives the image
3. AI model preprocesses the image
4. Prediction and confidence score are generated
5. Result is returned to the user

## API List
- POST /predict
- GET /
- GET /health

## Team Members
- Member 1: Frontend and UI
- Member 2: Backend and API integration
- Member 3: AI model and prediction engine
- Member 4: Documentation and project reports

## License
This project is intended for academic and educational use.

## Screenshots
Add screenshots of landing page, prediction result, chatbot, admin board, and reports.

## Future Scope
- Real medical dataset integration
- Improved accuracy using transfer learning
- Mobile app version
- Cloud deployment
- Doctor appointment integration

## Medical Disclaimer
> This application is intended only for AI-assisted preliminary screening and educational purposes. It is not a medical diagnostic tool and must not be used as a substitute for professional medical advice, diagnosis, or treatment. The system does not prescribe medicines, recommend surgeries, or provide definitive diagnoses. Users should always consult a qualified ophthalmologist for evaluation and treatment.

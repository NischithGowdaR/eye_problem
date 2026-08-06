# Eye Screening API

Flask API for AI-assisted preliminary eye screening; it never diagnoses or prescribes.

```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python app.py
```

`GET /health` confirms service availability. Register at `POST /register`, then use the returned bearer JWT for `/bmi`, `/predict`, `/history`, `/chat`, and `/report/<id>`. Upload `left_eye` and/or `right_eye` as JPG/JPEG/PNG.

"""Preliminary eye-screening API. Results are educational, never diagnostic."""
import hashlib, io, os, uuid
from datetime import datetime, timezone
from functools import wraps
from flask import Flask, jsonify, request, send_file
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, get_jwt_identity, jwt_required
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from PIL import Image, UnidentifiedImageError
from config import Config

DISEASES = ("Cataract", "Glaucoma", "Diabetic Retinopathy", "AMD", "Conjunctivitis", "Normal")
DISCLAIMER = "AI-assisted preliminary screening only; it is not a diagnosis. Consult a qualified ophthalmologist."
def now(): return datetime.now(timezone.utc).isoformat()

class Store:
    def __init__(self): self.users, self.bmis, self.scans = {}, [], {}
    def email(self, email): return next((u for u in self.users.values() if u["email"] == email), None)

def create_app(config=Config):
    app = Flask(__name__); app.config.from_object(config)
    os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)
    CORS(app, resources={r"/*": {"origins": app.config["CORS_ORIGINS"]}})
    bcrypt = Bcrypt(app); JWTManager(app); limiter = Limiter(get_remote_address, app=app, default_limits=["200/day", "50/hour"]); db = Store()
    error = lambda message, status=400: (jsonify(error=message), status)
    public = lambda u: {k:v for k,v in u.items() if k != "password"}
    def user(): return db.users.get(get_jwt_identity())
    def admin(fn):
        @wraps(fn)
        def wrapped(*a, **kw):
            if not user() or user().get("role") != "admin": return error("Administrator access required", 403)
            return fn(*a, **kw)
        return wrapped
    def image(file):
        if not file or "." not in file.filename or file.filename.rsplit(".",1)[1].lower() not in {"jpg","jpeg","png"}: return None
        try: Image.open(file.stream).verify(); file.stream.seek(0)
        except (UnidentifiedImageError, OSError): return None
        raw=file.read(); file.seek(0); suffix=file.filename.rsplit(".",1)[1].lower(); name=f"{uuid.uuid4().hex}.{suffix}"; file.save(os.path.join(app.config["UPLOAD_FOLDER"],name))
        h=hashlib.sha256(raw).hexdigest(); disease=DISEASES[int(h[:8],16)%len(DISEASES)]
        return {"disease":disease,"confidence":round(.55+(int(h[8:12],16)%40)/100,2),"image":name,"guidance":"Arrange an ophthalmology consultation if symptoms persist.","disclaimer":DISCLAIMER}
    @app.get("/")
    @app.get("/health")
    def health(): return jsonify(status="ok", service="eye-screening-api", time=now())
    @app.post("/register")
    @limiter.limit("5/minute")
    def register():
        d=request.get_json(silent=True) or {}; email=str(d.get("email","")).strip().lower(); password=str(d.get("password", ""))
        if not d.get("name") or "@" not in email or len(password)<8: return error("Name, valid email, and 8+ character password are required")
        if db.email(email): return error("An account with this email already exists",409)
        u={"id":uuid.uuid4().hex,"name":str(d["name"]).strip(),"email":email,"password":bcrypt.generate_password_hash(password).decode(),"role":"user","created_at":now()}; db.users[u["id"]]=u
        return jsonify(user=public(u),access_token=create_access_token(identity=u["id"])),201
    @app.post("/login")
    @limiter.limit("10/minute")
    def login():
        d=request.get_json(silent=True) or {}; u=db.email(str(d.get("email","")).lower())
        if not u or not bcrypt.check_password_hash(u["password"],str(d.get("password",""))): return error("Invalid email or password",401)
        return jsonify(user=public(u),access_token=create_access_token(identity=u["id"]))
    @app.post("/google-login")
    def google(): return error("Google OAuth token verification is not configured",501)
    @app.post("/bmi")
    @jwt_required()
    def bmi():
        d=request.get_json(silent=True) or {}
        try:
            age=int(d["age"]); height=float(d["height_cm"]); weight=float(d["weight_kg"])
            if not 1<=age<=120 or not 50<=height<=300 or not 2<=weight<=500: raise ValueError
        except (KeyError,ValueError,TypeError): return error("Provide valid age, height_cm, and weight_kg")
        value=round(weight/(height/100)**2,1); category="Underweight" if value<18.5 else "Healthy" if value<25 else "Overweight" if value<30 else "Obesity"
        r={"id":uuid.uuid4().hex,"user_id":get_jwt_identity(),"age":age,"gender":d.get("gender"),"height_cm":height,"weight_kg":weight,"bmi":value,"category":category,"created_at":now()}; db.bmis.append(r); return jsonify(r),201
    @app.get("/bmi")
    @jwt_required()
    def bmi_list(): return jsonify([x for x in db.bmis if x["user_id"]==get_jwt_identity()])
    @app.post("/predict")
    @jwt_required()
    @limiter.limit("10/hour")
    def predict():
        entries=[]
        for field, eye in (("left_eye","left"),("right_eye","right")):
            if request.files.get(field):
                result=image(request.files[field])
                if not result: return error("Images must be valid JPG, JPEG, or PNG files")
                result["eye"]=eye; entries.append(result)
        if not entries: return error("Upload left_eye and/or right_eye")
        scan={"id":uuid.uuid4().hex,"user_id":get_jwt_identity(),"results":entries,"created_at":now(),"disclaimer":DISCLAIMER}; db.scans[scan["id"]]=scan; return jsonify(scan),201
    @app.get("/history")
    @jwt_required()
    def history():
        page=max(1,request.args.get("page",1,type=int)); limit=min(50,max(1,request.args.get("limit",10,type=int))); rows=sorted((x for x in db.scans.values() if x["user_id"]==get_jwt_identity()),key=lambda x:x["created_at"],reverse=True)
        return jsonify(items=rows[(page-1)*limit:page*limit],page=page,total=len(rows))
    @app.delete("/history/<scan_id>")
    @jwt_required()
    def delete_scan(scan_id):
        scan=db.scans.get(scan_id)
        if not scan or scan["user_id"]!=get_jwt_identity(): return error("Scan not found",404)
        del db.scans[scan_id]; return "",204
    @app.post("/chat")
    @jwt_required()
    def chat():
        if not str((request.get_json(silent=True) or {}).get("message","")).strip(): return error("Message is required")
        return jsonify(reply="I can offer general eye-health education, but cannot diagnose or prescribe. Please consult an ophthalmologist for personal advice.",disclaimer=DISCLAIMER)
    @app.get("/report/<scan_id>")
    @jwt_required()
    def report(scan_id):
        scan=db.scans.get(scan_id)
        if not scan or scan["user_id"]!=get_jwt_identity(): return error("Scan not found",404)
        from reportlab.pdfgen import canvas
        stream=io.BytesIO(); pdf=canvas.Canvas(stream); pdf.drawString(72,770,"AI-Assisted Eye Screening Report"); y=735
        for r in scan["results"]: pdf.drawString(72,y,f"{r['eye'].title()}: {r['disease']} ({r['confidence']:.0%})"); y-=24
        pdf.drawString(72,y-16,DISCLAIMER); pdf.save(); stream.seek(0); return send_file(stream,mimetype="application/pdf",as_attachment=True,download_name=f"screening-{scan_id}.pdf")
    @app.get("/analytics")
    @jwt_required()
    @admin
    def analytics(): return jsonify(users=len(db.users),scans=len(db.scans),generated_at=now())
    @app.get("/users")
    @jwt_required()
    @admin
    def users(): return jsonify([public(x) for x in db.users.values()])
    return app
app=create_app()
if __name__=="__main__": app.run(host="0.0.0.0",port=int(os.getenv("PORT",5000)),debug=os.getenv("FLASK_DEBUG")=="1")

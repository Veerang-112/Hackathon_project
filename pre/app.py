from flask import Flask, render_template, request, redirect, jsonify, session
import json
import urllib.request
import urllib.parse
from flask_cors import CORS
import pandas as pd
import os
from werkzeug.utils import secure_filename
from datetime import datetime
from flask import send_from_directory


app = Flask(__name__)
app.secret_key = "hackathon-secret"
CORS(app)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

USERS_FILE = "users.csv"
COMPLAINTS_FILE = "complaints.csv"

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory('uploads', filename)

# ---------- create csv if not exists ----------
if not os.path.exists(USERS_FILE):
    pd.DataFrame(columns=["id","email","password","role"]).to_csv(USERS_FILE,index=False)

if not os.path.exists(COMPLAINTS_FILE):
    pd.DataFrame(columns=[
        "id","user","description","image","location","lat","lng",
        "status","priority","date"
    ]).to_csv(COMPLAINTS_FILE,index=False)
# ---------- ADD DEFAULT USERS ----------
    import pandas.errors

# ---------- ADD DEFAULT USERS SAFELY ----------
try:
    df_users = pd.read_csv(USERS_FILE)
except (pandas.errors.EmptyDataError, FileNotFoundError):
    df_users = pd.DataFrame(columns=["id","email","password","role"])
    df_users.to_csv(USERS_FILE, index=False)

if len(df_users) == 0:
    default_users = pd.DataFrame([
        {"id": 1, "email": "admin@test.com", "password": "admin123", "role": "admin"},
        {"id": 2, "email": "citizen@test.com", "password": "1234", "role": "citizen"}
    ])
    default_users.to_csv(USERS_FILE, index=False)

    if len(df_users) == 0:
        default_users = pd.DataFrame([
        {"id": 1, "email": "admin@test.com", "password": "admin123", "role": "admin"},
        {"id": 2, "email": "citizen@test.com", "password": "1234", "role": "citizen"}
        ])
        default_users.to_csv(USERS_FILE, index=False)


# ================= ROUTES =================

@app.route("/")
def login_page():
    return render_template("login.html")


# ---------- LOGIN ----------
@app.route("/login", methods=["POST"])
def login():
    email = request.form.get("email")
    password = request.form.get("password")
    role = request.form.get("role")

    df = pd.read_csv(USERS_FILE)

    user = df[(df["email"] == email) & (df["password"] == password) & (df["role"] == role)]

    if len(user) > 0:
        session["user"] = email
        session["role"] = role

        if role == "admin":
            return jsonify({"status": "success", "redirect": "/admin"})
        else:
            return jsonify({"status": "success", "redirect": "/citizen"})

    # ❌ WRONG LOGIN
    return jsonify({"status": "error"})


# ---------- SIGNUP ----------
@app.route("/signup", methods=["POST"])
def signup():
    email = request.form.get("email")
    password = request.form.get("password")
    role = request.form.get("role")
    username = request.form.get("username")

    df = pd.read_csv(USERS_FILE)

    new_row = {
        "id": len(df) + 1,
        "email": email,
        "password": password,
        "role": role,
        "username": username
    }

    df.loc[len(df)] = new_row
    df.to_csv(USERS_FILE, index=False)

    return redirect("/")


@app.route("/citizen")
def citizen():
    return render_template("citizen.html")


@app.route("/admin")
def admin():
    return render_template("admin.html")


@app.route("/view-complaints")
def view_complaints_page():
    return render_template("view-complaints.html")


@app.route("/file-complaint")
def file_complaint():
    return render_template("file-complaint.html")


# ---------- SUBMIT COMPLAINT ----------
@app.route("/submit", methods=["POST"])
def submit():
    description = request.form.get("description")
    lat = request.form.get("lat")
    lng = request.form.get("lng")
    user = session.get("user", "anonymous")
    file = request.files.get("image")

    if file is None or file.filename == "":
        return jsonify({"error": "No image received"}), 400

    filename = secure_filename(file.filename)
    # ensure filename is unique to prevent overwriting when multiple files share the same name
    name, ext = os.path.splitext(filename)
    timestamp = int(datetime.now().timestamp() * 1000)
    unique_filename = f"{name}_{timestamp}{ext}"
    path = os.path.join(UPLOAD_FOLDER, unique_filename)
    file.save(path)
    # use the unique filename for storing the complaint record
    filename = unique_filename

    # Attempt to reverse-geocode to a human-readable address
    def reverse_geocode(lat_val, lng_val):
        try:
            if not lat_val or not lng_val:
                return ""
            params = urllib.parse.urlencode({
                'format': 'jsonv2',
                'lat': str(lat_val),
                'lon': str(lng_val),
                'zoom': 14,
            })
            url = f"https://nominatim.openstreetmap.org/reverse?{params}"
            req = urllib.request.Request(url, headers={
                'User-Agent': 'ComplaintApp/1.0 (contact: example@example.com)'
            })
            with urllib.request.urlopen(req, timeout=5) as resp:
                body = resp.read().decode('utf-8')
                j = json.loads(body)
                return j.get('display_name', '')
        except Exception:
            return ""

    location_str = reverse_geocode(lat, lng)
    if not location_str and lat and lng:
        location_str = f"{lat},{lng}"

    df = pd.read_csv(COMPLAINTS_FILE)

    df.loc[len(df)] = {
        "id": len(df) + 1,
        "user": user,
        "description": description,
        "image": f"uploads/{filename}",
        "location": location_str,
        "lat": lat,
        "lng": lng,
        "status": "Pending",
        "priority": "Medium",
        "date": datetime.now()
    }

    df.to_csv(COMPLAINTS_FILE, index=False)

    return jsonify({"msg": "submitted"})


# ---------- GET COMPLAINTS ----------
@app.route("/complaints")
def complaints():
    df = pd.read_csv(COMPLAINTS_FILE)
    return df.to_json(orient="records")


# ---------- UPDATE STATUS ----------
@app.route("/update_status", methods=["POST"])
def update_status():
    cid = int(request.json["id"])
    status = request.json["status"]

    df = pd.read_csv(COMPLAINTS_FILE)
    df.loc[df["id"] == cid, "status"] = status
    df.to_csv(COMPLAINTS_FILE, index=False)

    return jsonify({"msg": "updated"})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
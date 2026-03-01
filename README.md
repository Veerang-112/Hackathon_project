````markdown
# 🚀 Website Setup & Run Guide

This guide explains how to start and access the website using Flask and ngrok.

---

## 📋 Prerequisites

Make sure you have installed:

- Python 3.x  
- ngrok  
- Required Python packages  

---

## ▶️ Quick Start (Git Bash)

Follow the steps **in order**.

---

### 🔹 Step 1 — Navigate to Project Folder

Open **Git Bash** and run:

```bash
cd pre
````

---

### 🔹 Step 2 — Start Flask Server

Run:

```bash
python app.py
```

✅ The server will start at:

```
http://localhost:5000
```

⚠️ **Do NOT close this terminal.**

---

### 🔹 Step 3 — Start ngrok (New Terminal)

Open a **new Git Bash window** and run:

```bash
ngrok http 5000
```

---

### 🔹 Step 4 — Open Public URL

Copy the HTTPS link shown by ngrok and paste it into your browser.

Example:

```
https://noninterpretational-deprivative-zenaida.ngrok-free.dev
```

🎉 Your website is now live and accessible.

---

## ⚠️ Important Notes

* Keep both terminals running:

  * Flask terminal
  * ngrok terminal
* Always start **Flask first**, then **ngrok**.
* The ngrok URL may change after restart.

---

## 🛠️ Troubleshooting

### ❌ Port 5000 already in use

Either close the conflicting app or change the port in `app.py` and run:

```bash
ngrok http YOUR_PORT
```

---

### ❌ ngrok not recognized

* Ensure `ngrok.exe` is installed
* Or add ngrok to your system PATH

---

## 📦 Example Project Structure

```
project/
│
├── pre/
    ├─── static/
    |        ├─admin.css
    |        ├─admin.js
    │        ├─citizen.css
    |        ├─citizen.js
    |        ├─login.css
    |        ├─script.js
    |
    ├───templates/
    |      ├─admin.html
    |      ├─citizen.html
    |      ├─file-complaint.html
    |      ├─img.jpeg
    |      ├─login.html
    |      ├─view-complaints.html
    |
    ├───uploads/
    |
    |
    ├──app.py
    ├──complaint.csv
    ├──user.csv
    ├── ngrok.exe
    └── README.md
```

---

✅ Setup complete!

```
```

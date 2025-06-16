 Artifacts Server

This is the backend server for the **Artifacts Web Application**. It provides RESTful API endpoints to manage historical artifacts, user authentication, likes system, and more.

---

## 🚀 Features

- REST API built with Express.js
- MongoDB for database
- Firebase Admin SDK for authentication (if used)
- CORS enabled
- Environment variable support using `.env`

---

## 📁 Project Structure

artifacts-server/
├── index.js # Main entry point
├── .env # Environment variables (not committed)
├── package.json # Project metadata and dependencies
├── README.md # Project documentation (this file)

yaml
Copy
Edit

---

## 🛠️ Installation

```bash
git clone https://github.com/your-username/artifacts-server.git
cd artifacts-server
npm install
📁 Environment Variables
Create a .env file in the root directory with your own values:

env
Copy
Edit
PORT=3000
DB_USER=yourMongoUser
DB_PASSWORD=yourMongoPassword
DB_NAME=artifactsDB
(Add Firebase credentials if you're using Firebase Admin SDK)

▶️ Run the Server
bash
Copy
Edit
npm start
Server will run on: http://localhost:3000

📬 API Endpoints
Method	Endpoint	Description
GET	/artifacts	Get all artifacts
GET	/artifacts/:id	Get a single artifact
POST	/artifacts	Add a new artifact
PATCH	/artifacts/:id/toggleLike	Like/Unlike artifact
DELETE	/artifacts/:id	Delete an artifact

🧪 Testing
You can test the server using:

Postman

Thunder Client (VS Code Extension)

Your frontend React app

👤 Author
Your Name
GitHub Profile
# Professional Networking System

A full-stack web application designed to connect **students, freshers, and professionals** on a single platform for mentorship, guidance, and professional networking.

This project focuses on building meaningful connections, sharing opportunities, and enabling users to grow their careers through verified profiles and interactions.

---

## 🚀 Features

* 🔐 User Authentication (Login / Signup)
* 👤 Role-based users (Students & Professionals)
* 🤝 Professional networking and connections
* 📄 Profile creation and management
* 🌐 Responsive UI with modern design
* 🔒 Secure backend APIs

---

## 🛠️ Tech Stack

### Frontend

* React.js
* Vite
* Tailwind CSS
* DaisyUI
* Axios

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose

### Other Tools

* Git & GitHub
* Render (Deployment)
* REST APIs

---

## 📂 Project Structure

```
Professional-networking-System/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── login/
│   │   └── App.jsx
│   └── package.json
│
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── server.js
│
└── README.md
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/Riyatarwani/Professional-networking-System.git
cd Professional-networking-System
```

---

### 2️⃣ Backend Setup

```bash
cd backend
npm install
npm start
```

Create a `.env` file inside `backend/`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

---

### 3️⃣ Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## 🔗 API Example

### Login API

```
POST /api/auth/login
```

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

---

## 🌍 Deployment

* Frontend & Backend deployed using **Render**
* Environment variables configured in Render dashboard

---

## 🧪 Security & Best Practices

* Password hashing
* JWT-based authentication
* Proper API error handling
* Clean folder structure

---

## 🎯 Future Enhancements

* Messaging between users
* Connection requests & notifications
* Search & filter professionals
* Admin dashboard

---

## 👩‍💻 Author

**Riya Tarwani**
MCA Graduate | Backend & Full Stack Developer
Passionate about building scalable web applications

🔗 GitHub: [https://github.com/Riyatarwani](https://github.com/Riyatarwani)

---

## ⭐ Support

If you like this project, consider giving it a ⭐ on GitHub!

---

> This project is built for learning, networking, and real-world full-stack development experience.

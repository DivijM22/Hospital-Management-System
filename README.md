# 🏥 Hospital Management System

A full-stack Hospital Management System built with **React**, **Node.js**, **Express**, and **MySQL**. The project focuses on implementing secure authentication, role-based access control, and realistic hospital workflows rather than just CRUD operations. The system is built using MVC ( Model View Controller) architecutre

The application supports four different user roles—**Patients, Doctors, Receptionists, and Admins**—each with their own permissions and responsibilities.


---

## ✨ Features

### 🔐 Authentication & Authorization

* JWT-based authentication with:

  * Short-lived access tokens
  * Rotating HttpOnly refresh tokens
* Role-Based Access Control (RBAC)
* Secure password hashing using bcrypt
* Protected REST APIs

---

### 👥 User Roles

#### 🧑 Patient

* Register and log in
* Update personal profile
* Submit appointment requests
* View appointment history

#### 👨‍⚕️ Doctor

* View upcoming appointments
* View patient information
* Manage appointment status

#### 🧑‍💼 Receptionist

* Review appointment requests
* Book appointments
* Reschedule appointments
* Cancel appointments
* Manage room allocation
* View available rooms

#### 👨‍💼 Admin

* Add and manage doctors
* Add receptionists
* Manage departments
* Manage hospital staff

---

## 📅 Appointment Scheduling

The scheduling system validates:

* Doctor working schedule
* Existing doctor appointments
* Room availability
* Same-day booking restrictions
* Past date/time validation

Appointments are created using **MySQL transactions** and atomic conditional queries to ensure booking decisions remain consistent.

---

## 🔑 Demo Credentials

The project comes preloaded with sample users for each role.

> **Password for all non-admin accounts:** `asdf@123`

| Role | Name | Email | Password |
|------|------|-------|----------|
| **Admin** | Divij Manchanda | manchandadivij@gmail.com | *Configured separately* |
| Doctor | Dr Raj Sharma | raj.sharma@hospital.com | `asdf@123` |
| Doctor | Dr Priya Singh | priya.singh@hospital.com | `asdf@123` |
| Doctor | Dr Arjun Verma | arjun.verma@hospital.com | `asdf@123` |
| Doctor | Dr Sarah Connor | sarah.connor@hospital.com | `asdf@123` |
| Doctor | Dr Amit Mehta | amit.mehta@hospital.com | `asdf@123` |
| Doctor | Dr Kavita Rao | kavita.rao@hospital.com | `asdf@123` |
| Doctor | Dr Rohit Gupta | rohit.gupta@hospital.com | `asdf@123` |
| Receptionist | Riya Malhotra | riya.malhotra@hospital.com | `asdf@123` |
| Receptionist | Karan Arora | karan.arora@hospital.com | `asdf@123` |
| Patient | Praneeth Naik | praneeth@gmail.com | `asdf@123` |

## 🔒 Security

* JWT Authentication
* HttpOnly Refresh Token Cookies
* Role-Based Authorization Middleware
* bcrypt Password Hashing
* HTTPS Deployment
* Secure Cross-Site Cookie Authentication
* TLS Encrypted Database Connection

---

## 🛠️ Tech Stack

### Frontend

* React
* React Router
* Axios
* Tailwind CSS

### Backend

* Node.js
* Express.js
* JWT
* bcrypt

### Database

* MySQL (TiDB Cloud)
* Transactions
* Views
* Relational Schema Design

### Deployment

* **Frontend:** Vercel
* **Backend:** Render
* **Database:** TiDB Cloud

---

## 📂 Project Structure

```text
client/
│── src/
│── components/
│── pages/

server/
│── controllers/
│── middleware/
│── routes/
│── models/
│── database_access.js
│── server.js
```

---

## 🚀 Getting Started

### Clone the repository

```bash
git clone https://github.com/DivijM22/Hospital-Management-System.git
cd Hospital-Management-System
```

### Backend

```bash
cd server
npm install
```

Create a `.env` file:

```env
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret

DB_HOST=your_host
DB_PORT=your_port
DB_USER=your_user
DB_PASSWORD=your_password
DB_NAME=your_database

FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

Run the server:

```bash
npm run dev
```

---

### Frontend

```bash
cd client
npm install
```

Create a `.env` file:

```env
VITE_SERVER_URL=https://hospital-management-system-hjdl.onrender.com
```

Run:

```bash
npm run dev
```

---

## 📸 Screenshots

> Add screenshots of:
>
> * Login page
    <img width="1279" height="708" alt="{A0938FCE-0CCF-4A31-8012-8A983AD6B197}" src="https://github.com/user-attachments/assets/3161c551-7a68-4c09-bad5-4273538458d9" />
    
> * Patient dashboard
    <img width="1274" height="715" alt="{44CC99B1-77D2-4A0D-AAA4-FD2396B3A282}" src="https://github.com/user-attachments/assets/5cd62b87-7876-420f-8f85-e46fdc2e2560" />

> * Receptionist dashboard
    <img width="1280" height="714" alt="{DF6CE853-ABB6-483B-8604-19C98F64394E}" src="https://github.com/user-attachments/assets/249bfda2-99e0-4b0d-88e9-d9070ed72670" />

> * Doctor dashboard
    <img width="1274" height="713" alt="{8B169C82-04B7-4E3F-B2A1-8763F300F875}" src="https://github.com/user-attachments/assets/c91b5687-a1bb-480f-8826-f3ffb079ed5d" />
    <img width="1280" height="712" alt="{B1BF1A16-88A6-4798-932E-9613AE891BCE}" src="https://github.com/user-attachments/assets/ccdce79d-0976-42ba-8b11-4450e5e82a5c" />
    
> * Appointment booking
    <img width="1206" height="700" alt="{CA2A61BF-5391-4E4C-A32B-8C0815587157}" src="https://github.com/user-attachments/assets/8367b953-9f89-49f0-ae1c-85511cded04b" />
    <img width="852" height="653" alt="{A84E1A72-13A6-4917-9F8B-E58E69B82C98}" src="https://github.com/user-attachments/assets/a312ac54-7a03-42e5-917d-9a5d41f3268f" />
    <img width="715" height="534" alt="{15A603D6-73CE-45FA-8DAC-8E110515F73E}" src="https://github.com/user-attachments/assets/f274434e-1dac-49d5-8654-671fafa165e3" />
    <img width="763" height="515" alt="{FDDCD09B-DDE3-42D4-B824-A49834809A47}" src="https://github.com/user-attachments/assets/6c9ff970-9d08-4eb9-ab71-016ce6c5ef1d" />
    <img width="714" height="526" alt="{902AED14-47D4-4E78-B118-12AD64E28F80}" src="https://github.com/user-attachments/assets/4b2e2c6f-ba60-4b30-9f34-df089aeba874" />




---

## 🌐 Live Demo

**Frontend:** https://hospital-management-system-two-ashy.vercel.app/

**Backend API:** https://hospital-management-system-hjdl.onrender.com

---

## 📌 Future Improvements

* Email notifications for appointment confirmations
* Redis-based caching
* WebSocket notifications
* Medical record management
* Prescription management
* Docker support
* CI/CD pipeline

---

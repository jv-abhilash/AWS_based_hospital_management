# Secure Cloud-based Repository on S3 for Encrypted Medical Imaging Data

A **MERN + AWS** implementation for secure upload, storage, access, and auditing of **encrypted medical imaging files**. Uses **AWS S3** for object storage, **KMS** for key management, **IAM** for least-privilege access, and **SNS/SQS** for notifications. Patient privacy and integrity are enforced with **AES encryption** and **SHA-256 hashing**.

> **Goal:** dependable, compliant handling of medical images with role-based access and full audit trails.

---

## ✨ Features

- **Encrypted storage** on S3 (at rest & in transit)
- **Integrity checks** via SHA-256 hashes
- **RBAC** (Admin, Doctor/Staff, Patient) with role-aware UI
- **Time-bound signed URLs** for controlled downloads
- **Appointment management** (book/modify/cancel; doctor/patient views)
- **Notifications** via SNS/SQS (file/appointment events)
- **Audit logs** with Winston (access, API actions, errors)
- **Responsive React UI**

---

## 🏗️ Architecture (High Level)

- **Client (React):** SPA with protected routes & role-aware navigation  
- **Server (Node.js/Express):** Auth (JWT), RBAC, REST APIs, hashing, logging  
- **Database (MongoDB/Mongoose):** users, patients, doctors, appointments, files, counters  
- **AWS:**  
  - **S3** – encrypted object storage (region chosen for low latency)  
  - **KMS** – data keys & key rotation  
  - **IAM** – least-privilege roles/policies for server  
  - **SNS/SQS** – notifications & async events  
  - **CloudWatch/CloudTrail** (optional) – ops & audit

**Core flows**

- **Upload:** Auth → validate metadata → encrypt & upload to S3 → store metadata (incl. `sha256`) → notify via SNS → log event  
- **Retrieve:** Auth + RBAC → generate time-bound signed URL → download → verify integrity → log access

---

## 📦 Tech Stack

- **Frontend:** React, CSS  
- **Backend:** Node.js (≥14), Express, JWT, Winston  
- **DB:** MongoDB (≥4), Mongoose  
- **AWS:** S3, KMS, IAM, SNS/SQS  
- **Security:** AES (encryption), SHA-256 (integrity), HTTPS/TLS

---

## 📁 Folder Structure


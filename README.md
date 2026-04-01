# CertiTrust

CertiTrust is a MERN internship management and automated certification system with three roles:

- `student`
- `college`
- `company`

## Features

- JWT-based authentication with role-aware dashboards
- Student internship submission with registered company selection and report upload
- Independent college/company approval queues
- Rejection with reason and student resubmission flow
- Automatic PDF certificate generation after both approvals
- QR-backed public verification page
- Company job or internship offer posting with direct student applications
- Nodemailer status notifications
- Cloudinary-backed file storage, with local data URL fallback when Cloudinary is not configured

## Backend Setup

1. Copy [`backend/.env.example`](/c:/Users/Sathi/OneDrive/Desktop/intership-project/backend/.env.example) to `backend/.env`.
2. Install dependencies in `backend`.
3. Run `npm run dev`.

## Frontend Setup

1. Copy [`frontend/.env.example`](/c:/Users/Sathi/OneDrive/Desktop/intership-project/frontend/.env.example) to `frontend/.env`.
2. Install dependencies in `frontend`.
3. Run `npm run dev`.

## Core API Areas

- Auth: `/api/auth`
- Companies: `/api/companies`
- Internships: `/api/internships`
- Certificates: `/api/certificates/verify/:id`
- Offers: `/api/offers`

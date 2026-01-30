# Ethara HRMS

A modern Human Resource Management System (HRMS) built for efficient employee and attendance management.

## Project Overview

Ethara HRMS is a full-stack web application designed to streamline HR operations. It provides an intuitive interface for managing employee records and tracking attendance with real-time data synchronization between frontend and backend.

### Key Features

- **Employee Management**
  - Add, edit, and delete employee records
  - Sortable employee table (by Employee ID)
  - Real-time validation with meaningful error messages
  - Duplicate employee prevention (empId and email)

- **Attendance Tracking**
  - Mark daily attendance (Present/Absent)
  - Advanced filtering (employee, department, date range, status)
  - Sortable attendance records (by Employee ID and Date)
  - View present/absent statistics for selected employees
  - Department-based search for attendance records

- **User Experience**
  - Clean, modern UI with Tailwind CSS
  - Loading, empty, and error states
  - Responsive design (mobile and desktop)
  - Smooth animations and transitions

## Tech Stack

### Backend
- **Framework**: Django 6.0.1
- **API**: Django REST Framework
- **Database**: SQLite3
- **Language**: Python 3.x
- **CORS**: django-cors-headers

### Frontend
- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v4
- **Routing**: React Router
- **HTTP Client**: Axios
- **Icons**: lucide-react
- **Font**: Poppins (Google Fonts)

## Project Structure

```
Ethara/
├── server/                    # Django backend
│   ├── ethara/               # Main project settings
│   │   ├── settings.py
│   │   ├── urls.py
│   │   ├── wsgi.py
│   │   └── asgi.py
│   ├── employees/            # Employee management app
│   │   ├── models.py
│   │   ├── views.py
│   │   ├── serializers.py
│   │   ├── urls.py
│   │   └── migrations/
│   ├── attendance/           # Attendance tracking app
│   │   ├── models.py
│   │   ├── views.py
│   │   ├── serializers.py
│   │   ├── urls.py
│   │   └── migrations/
│   ├── manage.py
│   └── db.sqlite3
│
└── web/                       # React frontend
    ├── src/
    │   ├── api/              # API client
    │   │   ├── client.ts
    │   │   └── employee.ts
    │   ├── components/       # Reusable components
    │   │   └── Navbar.tsx
    │   ├── views/            # Page components
    │   │   ├── Employees.tsx
    │   │   └── Attendance.tsx
    │   ├── App.tsx
    │   ├── main.tsx
    │   └── index.css
    ├── vite.config.ts
    ├── tsconfig.json
    ├── package.json
    └── index.html
```

## Getting Started

### Prerequisites

- Python 3.8+
- Node.js 16+ and npm
- Git

### Backend Setup

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Create a virtual environment (optional but recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install django djangorestframework django-cors-headers
   ```

4. Run migrations:
   ```bash
   python manage.py migrate
   ```

5. Create a superuser (optional for admin panel):
   ```bash
   python manage.py createsuperuser
   ```

6. Start the development server:
   ```bash
   python manage.py runserver
   ```
   The backend will run on `http://127.0.0.1:8000`

### Frontend Setup

1. Navigate to the web directory:
   ```bash
   cd web
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   The frontend will be available at `http://localhost:5173`

### Running Both Simultaneously

For easier development, you can run both servers in separate terminal windows:

**Terminal 1 (Backend):**
```bash
cd server
python manage.py runserver
```

**Terminal 2 (Frontend):**
```bash
cd web
npm run dev
```

## API Endpoints

### Employees
- `GET /api/employees/` - List all employees
- `POST /api/employees/` - Create a new employee
- `GET /api/employees/{id}/` - Get employee details
- `PUT /api/employees/{id}/` - Update employee
- `DELETE /api/employees/{id}/` - Delete employee

### Attendance
- `GET /api/attendance/` - List attendance records (with filtering)
- `POST /api/attendance/` - Mark attendance
- `GET /api/attendance/{id}/` - Get attendance details
- `DELETE /api/attendance/{id}/` - Delete attendance record

#### Attendance Filter Parameters
- `employee` - Filter by employee ID
- `date` - Filter by specific date
- `date_from` - Filter from date (inclusive)
- `date_to` - Filter to date (inclusive)
- `status` - Filter by status (PRESENT/ABSENT)
- `department` - Filter by department name (case-insensitive search)

## Validation Rules

### Employee Creation/Update
- **Employee ID**: Required, positive integer, unique
- **Full Name**: Required, non-empty string
- **Email**: Required, valid email format, unique
- **Department**: Required, non-empty string

### Attendance Marking
- **Employee**: Required
- **Date**: Required
- **Status**: Required (PRESENT or ABSENT)
- **Uniqueness**: Only one attendance record per employee per date

## Assumptions & Limitations

### Assumptions
1. **Single Organization**: The system assumes a single organization with no multi-tenant support
2. **Basic Authentication**: Currently uses CORS for development; no user authentication/authorization
3. **SQLite Database**: Suitable for development and small deployments; not recommended for production
4. **Employee ID Immutability**: Employee IDs cannot be changed after creation (disabled in edit form)
5. **Date Format**: Dates are stored and transmitted in YYYY-MM-DD format
6. **Synchronous Operations**: All API calls are synchronous without real-time updates

### Limitations
1. **No User Roles/Permissions**: All users have full access to all data
2. **No Data Export**: Cannot export employee or attendance data to CSV/Excel
3. **Limited Reporting**: No advanced reporting or analytics features
4. **No Bulk Operations**: Cannot bulk import/export or perform bulk actions
5. **No Attendance History**: Attendance records cannot be modified once created (only deleted)
6. **No Email Notifications**: No automated email alerts for attendance or changes
7. **No File Uploads**: Cannot upload profile pictures or documents
8. **Session Management**: No session timeout or activity tracking
9. **API Rate Limiting**: No rate limiting implemented
10. **Logging**: Minimal application logging for debugging

## Development Notes

### Styling
The project uses Tailwind CSS v4 with custom theme tokens defined in `src/index.css`:
- **Brand Color**: `#00feb5` (vibrant green)
- **Background**: `#11111b` (dark)
- **Text**: `#cdd6f4` (light)
- **Surface**: `#181825` (dark gray)

### Error Handling
- All form errors come from the server and are displayed to the user
- API errors are caught and displayed with meaningful messages
- Validation errors include specific field information

### Sorting
- Tables support single-column sorting
- Sort direction cycles: None → Ascending → Descending → None
- Visual indicators (arrows) show current sort state

## Future Enhancements

- User authentication and role-based access control
- Employee profile pictures and documents
- Leave management system
- Performance reviews
- Payroll integration
- Mobile app
- Advanced reporting and analytics
- Data export functionality
- Bulk operations
- Email notifications

## Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## License

This project is created for recruitment assignment purposes.

## Author

Made by Utkarsh Jain - utkarsh57917@gmail.com

---

For issues, questions, or contributions, please contact the author.

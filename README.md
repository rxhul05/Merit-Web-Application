# 🎓 Merit List Management System

A modern, responsive web application for managing student records, marks entry, and generating merit lists. Built with React, TypeScript, Vite, and Firebase.

![Merit List System](https://img.shields.io/badge/React-18.3.1-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue) ![Vite](https://img.shields.io/badge/Vite-5.4.2-purple) ![Firebase](https://img.shields.io/badge/Firebase-12.9.0-yellow) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.1-blue)

## ✨ Features

### 🎯 Core Functionality
- **Student Management**: Add, edit, delete, and search student records
- **Marks Entry**: Enter and manage student marks by subject and semester
- **Merit List Generation**: Automatic ranking and percentage calculation
- **Export Capabilities**: PDF and Excel export for merit lists
- **Real-time Search & Filtering**: Advanced filtering by semester, percentage, and text search

### 🎨 User Experience
- **Modern UI/UX**: Clean, responsive design with smooth animations
- **Toast Notifications**: Real-time feedback for all user actions
- **Form Validation**: Comprehensive client-side validation with error messages
- **Loading States**: Skeleton screens and loading indicators
- **Error Handling**: Graceful error handling with user-friendly messages
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile

### 🔧 Technical Features
- **TypeScript**: Full type safety and better development experience
- **React Router**: Client-side routing for seamless navigation
- **Vite**: Fast build tool and development server
- **Firebase Integration**: Real-time Firestore database with Firebase Authentication
- **Error Boundaries**: React error boundaries for better error handling
- **Custom Hooks**: Reusable logic for authentication and data management
- **Toast Notifications**: Real-time user feedback system
- **Responsive Design**: Mobile-first approach with Tailwind CSS

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Firebase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd merit-list-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Set up Firebase database**
   - Create a new Firebase project
   - Enable Firestore Database
   - Enable Authentication (Email/Password)
   - Add a web app and copy the config to your `.env` file
   - Set up Firestore Rules appropriate for your use case

5. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:5173`
   
   **Default Admin Credentials:**
   - Email: `admin@merit.com`
   - Password: `admin123`
   *(Make sure to register this account in your Firebase Authentication console first)*

## 🗄️ Database Schema

### Collections

#### `students`
- `name` (string, required)
- `roll_number` (string, required, unique)
- `email` (string, optional)
- `phone` (string, optional)
- `semester` (string, required)
- `batch` (string, required)
- `created_at` (iso string)
- `updated_at` (iso string)

#### `subjects`
- `name` (string, required)
- `code` (string, required)
- `max_marks` (number, required)
- `semester` (string, required)
- `created_at` (iso string)

#### `marks`
- `student_id` (string, reference)
- `subject_id` (string, reference)
- `marks` (number, required)
- `semester` (string, required)
- `created_at` (iso string)

## 🔐 Authentication

The system uses Firebase Authentication.

### Admin User Setup

1. **Create an admin user** in Firebase Console:
   - Go to Authentication → Users
   - Click "Add User"
   - Use email: `admin@merit.com` and password: `admin123`

2. **Database Security**
   - Set up Firestore Security Rules to protect your collections.

## 📱 Usage Guide

### 1. Login
- Use the admin credentials created in Firebase
- Default: `admin@merit.com` / `admin123`

### 2. Student Management
- Click "Manage Students" from the dashboard
- Add new students with required information
- Edit existing student records
- Search and filter by semester
- Delete students (with confirmation)

### 3. Marks Entry
- Click "Enter Marks" from the dashboard
- Add subjects for each semester
- Select a student to enter marks
- Enter marks for each subject
- Save marks (overwrites existing marks for the semester)

### 4. Merit List Generation
- Click "Generate Merit List" from the dashboard
- View automatically calculated rankings
- Filter by semester, percentage range, or search
- Export to PDF or Excel format
- View top performers

## 🛠️ Development

### Project Structure
```
merit-list-management-system/
├── src/
│   ├── components/          # React components
│   │   ├── Dashboard.tsx    # Main dashboard
│   │   ├── Login.tsx        # Authentication
│   │   ├── Layout.tsx       # App layout wrapper
│   │   ├── StudentManagement.tsx
│   │   ├── MarksEntry.tsx
│   │   ├── MeritList.tsx
│   │   ├── Toast.tsx        # Notification system
│   │   ├── ErrorBoundary.tsx
│   │   └── LoadingSpinner.tsx
│   ├── contexts/            # React contexts
│   │   └── AuthContext.tsx  # Authentication context
│   ├── types/               # TypeScript types
│   │   └── index.ts
│   ├── firebase.ts          # Firebase config
│   ├── App.tsx              # Main app component
│   ├── main.tsx             # Application entry point
│   └── index.css            # Global styles
├── public/                  # Static assets
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

### Available Scripts

```bash
# Development
npm run dev          # Start development server

# Production
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint
```

### Key Dependencies

- **React 18.3.1**: UI library
- **TypeScript 5.5.3**: Type safety
- **Vite 5.4.2**: Build tool and dev server
- **Firebase 12.9.0**: Backend and authentication
- **React Router 7.9.1**: Client-side routing
- **Tailwind CSS 3.4.1**: Styling
- **Lucide React 0.544.0**: Icons
- **jsPDF 3.0.2**: PDF generation
- **XLSX 0.18.5**: Excel export

## 🎨 Customization

### Styling
The app uses Tailwind CSS with custom animations and components. Key customizations:

- **Custom animations**: `fadeIn`, `slideIn`, `scaleIn`
- **Glass morphism effects**: Backdrop blur and transparency
- **Gradient text**: Custom gradient text effects
- **Hover effects**: Lift and scale animations

### Adding New Features
1. Create new components in `src/components/`
2. Add types in `src/types/index.ts`
3. Update the database schema if needed
4. Add new routes in `App.tsx`

## 🐛 Troubleshooting

### Common Issues

1. **Firebase Connection Error**
   - Check your environment variables
   - Verify Firebase API key and config matches

2. **Authentication Issues**
   - Verify admin user exists in Firebase
   - Clear browser cache and cookies

### Getting Help

- Check the browser console for error messages
- Verify Firebase logs in the dashboard
- Ensure all environment variables are set correctly

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review Firebase documentation

---

**Built with ❤️ using React, TypeScript, Vite, and Firebase**
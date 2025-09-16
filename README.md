# 🎓 Merit List Management System

A modern, responsive web application for managing student records, marks entry, and generating merit lists. Built with React, TypeScript, Vite, and Supabase.

![Merit List System](https://img.shields.io/badge/React-18.3.1-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue) ![Vite](https://img.shields.io/badge/Vite-5.4.2-purple) ![Supabase](https://img.shields.io/badge/Supabase-2.57.4-green) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.1-blue)

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
- **Supabase Integration**: Real-time database with authentication
- **Error Boundaries**: React error boundaries for better error handling
- **Custom Hooks**: Reusable logic for authentication and data management
- **Toast Notifications**: Real-time user feedback system
- **Responsive Design**: Mobile-first approach with Tailwind CSS

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Supabase account

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
   Create a `.env.local` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up Supabase database**
   Run the SQL migrations in the `supabase/migrations/` directory:
   ```sql
   -- Migration 1: Create tables and RLS policies
   -- Migration 2: Insert sample data for testing
   -- Migration 3: Admin user setup instructions
   ```
   
   The migrations will create:
   - `students` table with RLS policies
   - `subjects` table with RLS policies  
   - `marks` table with RLS policies
   - Sample data for testing (10 students, 10 subjects, random marks)
   - Performance indexes for optimal query performance

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

## 📊 Sample Data

The application comes with pre-loaded sample data for testing:

- **10 Students** across 2 semesters (5 per semester)
- **10 Subjects** (5 per semester)
- **Random Marks** (60-98 range) for all student-subject combinations
- **Two Batches**: 2024-2025 and 2023-2024

This allows you to immediately test all features without manual data entry.

## 🗄️ Database Schema

### Tables

#### `students`
- `id` (uuid, primary key)
- `name` (text, required)
- `roll_number` (text, required, unique)
- `email` (text, optional)
- `phone` (text, optional)
- `semester` (text, required)
- `batch` (text, required)
- `created_at` (timestamp)
- `updated_at` (timestamp)

#### `subjects`
- `id` (uuid, primary key)
- `name` (text, required)
- `code` (text, required)
- `max_marks` (integer, required)
- `semester` (text, required)
- `created_at` (timestamp)

#### `marks`
- `id` (uuid, primary key)
- `student_id` (uuid, foreign key)
- `subject_id` (uuid, foreign key)
- `marks` (integer, required)
- `semester` (text, required)
- `created_at` (timestamp)

## 🔐 Authentication

The system uses Supabase Auth for authentication. The database migrations automatically set up Row Level Security (RLS) policies.

### Admin User Setup

1. **Create an admin user** in Supabase Dashboard:
   - Go to Authentication → Users
   - Click "Create New User"
   - Use email: `admin@merit.com` and password: `admin123`

2. **RLS Policies** are automatically created by the migrations:
   - All tables have RLS enabled
   - Authenticated users can perform all CRUD operations
   - Policies are set for `students`, `subjects`, and `marks` tables

## 📱 Usage Guide

### 1. Login
- Use the admin credentials created in Supabase
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
│   ├── lib/                 # Utilities
│   │   └── supabase.ts      # Supabase client
│   ├── types/               # TypeScript types
│   │   └── index.ts
│   ├── App.tsx              # Main app component
│   ├── main.tsx             # Application entry point
│   └── index.css            # Global styles
├── supabase/
│   └── migrations/          # Database migrations
│       ├── 20250913164239_dawn_fire.sql    # Tables & RLS
│       ├── 20250913164251_mellow_tree.sql  # Sample data
│       └── 20250913164457_raspy_paper.sql  # Admin setup
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
- **Supabase 2.57.4**: Backend and authentication
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
3. Update the database schema if needed (create new migration)
4. Add new routes in `App.tsx`
5. Update the Supabase client if new tables are added

## 🐛 Troubleshooting

### Common Issues

1. **Supabase Connection Error**
   - Check your environment variables
   - Verify Supabase URL and API key
   - Ensure RLS policies are set up correctly

2. **Authentication Issues**
   - Verify admin user exists in Supabase
   - Check email confirmation if required
   - Clear browser cache and cookies

3. **Database Errors**
   - Run all migration files in order (dawn_fire → mellow_tree → raspy_paper)
   - Check table permissions and RLS policies
   - Verify foreign key relationships
   - Ensure sample data was inserted correctly

### Getting Help

- Check the browser console for error messages
- Verify Supabase logs in the dashboard
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
- Review Supabase documentation

---

**Built with ❤️ using React, TypeScript, Vite, and Supabase**
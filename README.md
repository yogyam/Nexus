# Nexus - Collaborative Student Projects

A modern web application for student teams to organize group projects, manage tasks, and collaborate effectively.

## 🚀 Features

- **Project Management** - Create and organize collaborative projects
- **Task Tracking** - Manage tasks with status updates (To Do, In Progress, Done)
- **Assignment Viewer** - Copy and paste assignment text for easy reference
- **Team Collaboration** - Work together with classmates on group projects
- **Modern UI** - Beautiful, responsive design with smooth animations
- **Real-time Updates** - Live data synchronization across team members

## 🛠️ Tech Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI)
- **Backend**: Supabase
- **Database**: PostgreSQL
- **Authentication**: Supabase Auth
- **State Management**: TanStack Query
- **Routing**: React Router DOM

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase account

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd nexus-collab-spark
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Run the database migrations in your Supabase SQL Editor:
   ```sql
   -- Run the migration files from supabase/migrations/
   -- This will create all necessary tables and RLS policies
   ```

### 4. Configure Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 5. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:8080`

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── AuthProvider.tsx # Authentication context
│   ├── Logo.tsx        # Nexus logo component
│   ├── Navigation.tsx  # Navigation bar
│   ├── ProjectForm.tsx # Project creation form
│   └── TaskForm.tsx    # Task creation form
├── pages/              # Page components
│   ├── Index.tsx       # Landing page
│   ├── Auth.tsx        # Authentication page
│   ├── Dashboard.tsx   # User dashboard
│   └── Project.tsx     # Individual project view
├── integrations/       # External service integrations
│   └── supabase/       # Supabase client and types
└── hooks/              # Custom React hooks
```

## 🗄️ Database Schema

The application uses the following tables:

- **profiles** - User profile information
- **projects** - Project data with assignment text
- **project_members** - Many-to-many relationship between users and projects
- **tasks** - Task management within projects

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🎨 Customization

### Styling
The application uses Tailwind CSS for styling. You can customize the design by modifying:
- `tailwind.config.ts` - Tailwind configuration
- `src/index.css` - Global styles
- Component-specific classes

### Components
All UI components are built with shadcn/ui and can be customized in `src/components/ui/`.

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy!

### Netlify
1. Build the project: `npm run build`
2. Deploy the `dist` folder to Netlify

### Other Platforms
The application can be deployed to any static hosting platform that supports React applications.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built with [shadcn/ui](https://ui.shadcn.com/)
- Powered by [Supabase](https://supabase.com/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)

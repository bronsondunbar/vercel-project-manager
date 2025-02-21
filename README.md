# Vercel Project Manager

A modern web application for managing multiple Vercel projects and accounts in one place. Built with Next.js, TypeScript, and Supabase.

## Features

- 🔐 Secure authentication with Supabase
- 🔑 Manage multiple Vercel API tokens
- 📊 View and manage Vercel projects across different accounts
- 🎨 Modern UI with Tailwind CSS and Radix UI components
- ⚡ Fast development with Turbopack
- 🔄 Real-time updates and state management

## Tech Stack

- **Framework:** Next.js 15.1.7
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Radix UI
- **Authentication:** Supabase
- **State Management:** React Hooks
- **Development:** Turbopack

## Prerequisites

- Node.js 18+
- npm or yarn
- A Vercel account
- A Supabase account

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

```
-- Create a new table for multiple tokens
CREATE TABLE user_vercel_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token_value TEXT NOT NULL,
  token_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, token_name)
);
```

## Getting Started

1. Clone the repository:

```bash
git clone https://github.com/yourusername/vercel-project-manager.git
cd vercel-project-manager
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Set up your environment variables as described above.

4. Run the development server:

```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Development

- `npm run dev` - Start the development server with Turbopack
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint for code linting

## Project Structure

```
├── src/
│   ├── app/           # Next.js app directory
│   ├── components/    # React components
│   ├── hooks/        # Custom React hooks
│   └── lib/          # Utility functions and configurations
├── public/           # Static assets
└── ...config files
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

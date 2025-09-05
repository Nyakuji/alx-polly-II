# ALX Polly: A Secure Polling Application

Welcome to ALX Polly, a full-stack polling application built with Next.js, TypeScript, and Supabase. This project serves as a practical learning ground for modern web development concepts, with a comprehensive focus on security best practices and vulnerability remediation.

## About the Application

ALX Polly allows authenticated users to create, share, and vote on polls. It's a robust application that demonstrates key features of modern web development with enterprise-grade security:

-   **Secure Authentication**: Protected user sign-up and login with Supabase Auth
-   **Poll Management**: Users can create, view, edit, and delete their own polls with proper authorization
-   **Fair Voting System**: Secure voting with duplicate prevention and rate limiting
-   **User Dashboard**: A personalized space for users to manage their polls
-   **Security Features**: Comprehensive input validation, rate limiting, and authorization controls

The application is built with a modern, secure tech stack:

-   **Framework**: [Next.js](https://nextjs.org/) (App Router) with Server Actions
-   **Language**: [TypeScript](https://www.typescriptlang.org/) for type safety
-   **Backend & Database**: [Supabase](https://supabase.io/) with Row Level Security
-   **UI**: [Tailwind CSS](https://tailwindcss.com/) with [shadcn/ui](https://ui.shadcn.com/)
-   **State Management**: React Server Components and Client Components
-   **Security**: Custom rate limiting, input validation, and sanitization utilities

### 🚀 **Key Features**

- **Secure Poll Creation**: Create polls with comprehensive input validation and rate limiting
- **Fair Voting System**: Vote on polls with duplicate prevention and bounds checking
- **User Management**: Secure authentication and session management
- **Poll Management**: Edit, delete, and manage your own polls with proper authorization
- **Real-time Updates**: Dynamic poll results and vote counting
- **Responsive Design**: Modern UI that works on all devices
- **Production Ready**: Comprehensive security measures and error handling

---

## 🔒 Security Features & Improvements

This application has undergone a comprehensive security audit and remediation process. All critical vulnerabilities have been identified and fixed, implementing industry-standard security practices:

### ✅ **Security Measures Implemented**

#### **1. Authorization & Access Control**
- **Ownership Verification**: Users can only modify polls they own
- **Route Protection**: Middleware ensures authenticated access to protected routes
- **Session Management**: Secure session handling with Supabase Auth

#### **2. Input Validation & Sanitization**
- **XSS Prevention**: All user inputs are sanitized to prevent script injection
- **Length Validation**: Enforced limits on poll questions (3-500 chars) and options (1-200 chars)
- **Type Checking**: Comprehensive type validation for all inputs
- **Format Validation**: Poll IDs and option indices are validated before processing

#### **3. Rate Limiting & Abuse Prevention**
- **Poll Creation**: Limited to 10 polls per hour per user
- **Voting**: Limited to 5 votes per minute per user
- **General API**: 100 requests per 15 minutes per user/IP
- **Automatic Cleanup**: Expired rate limit entries are automatically removed

#### **4. Secure Voting System**
- **Duplicate Prevention**: Users cannot vote multiple times on the same poll
- **Bounds Checking**: Option indices are validated against actual poll options
- **Fair Voting**: Anonymous voting supported with IP-based rate limiting

#### **5. Error Handling & Information Security**
- **Safe Error Messages**: Generic error messages prevent information leakage
- **Detailed Logging**: Security events are logged server-side for monitoring
- **Graceful Degradation**: Application continues functioning even with errors

### 🛡️ **Security Utilities**

The application includes custom security utilities in `lib/security.ts` and `lib/rate-limit.ts`:

- **Input Sanitization**: `sanitizeInput()` removes dangerous characters
- **Validation Functions**: `isValidPollId()`, `isValidOptionIndex()`, `isValidEmail()`
- **Rate Limiting**: Configurable rate limits with automatic cleanup
- **Secure Token Generation**: Cryptographically secure random tokens
- **Error Handling**: Safe error handling without information exposure

---

## 🚀 Security Audit & Remediation Journey

This application demonstrates a complete security audit and remediation process. Originally built with intentional security vulnerabilities, it has been transformed into a secure, production-ready application through systematic vulnerability identification and remediation.

### 📋 **Vulnerabilities Identified & Fixed**

| Vulnerability | Severity | Status | Impact |
|---------------|----------|--------|---------|
| Authorization Bypass in Poll Deletion | Critical | ✅ Fixed | Prevents unauthorized data destruction |
| Missing Input Validation & Sanitization | High | ✅ Fixed | Prevents XSS and injection attacks |
| Insecure Vote Submission | High | ✅ Fixed | Ensures fair voting and prevents manipulation |
| Middleware Route Protection Bypass | Medium | ✅ Fixed | Ensures consistent authentication |
| Missing Rate Limiting | Medium | ✅ Fixed | Prevents DoS and abuse attacks |

### 🔍 **Security Audit Process**

The security audit followed industry best practices:

1. **Static Code Analysis**: Comprehensive review of all server actions and middleware
2. **Authentication Flow Review**: Verification of user session handling and route protection
3. **Input Validation Assessment**: Analysis of all user input handling points
4. **Authorization Testing**: Verification of ownership-based access controls
5. **Rate Limiting Evaluation**: Assessment of abuse prevention mechanisms

### 🎯 **Learning Objectives Achieved**

This project demonstrates the complete security audit and remediation process:

1.  **Vulnerability Identification** ✅:
    -   Identified critical authorization bypasses in poll deletion
    -   Found missing input validation and sanitization vulnerabilities
    -   Discovered insecure vote submission mechanisms
    -   Located middleware route protection gaps

2.  **Impact Assessment** ✅:
    -   Analyzed potential for unauthorized data destruction
    -   Evaluated XSS and injection attack vectors
    -   Assessed vote manipulation and DoS attack risks
    -   Determined information leakage vulnerabilities

3.  **Secure Implementation** ✅:
    -   Implemented comprehensive input validation and sanitization
    -   Added proper authorization controls with ownership verification
    -   Created rate limiting system to prevent abuse
    -   Enhanced error handling to prevent information exposure

### 📚 **Code Structure & Security Implementation**

The security improvements are implemented across several key areas:

1.  **Server Actions** (`app/lib/actions/`):
    -   `poll-actions.ts`: Comprehensive input validation, authorization checks, and rate limiting
    -   `auth-actions.ts`: Secure authentication with Supabase Auth
    -   All actions include proper error handling and user feedback

2.  **Security Utilities** (`lib/`):
    -   `security.ts`: Input sanitization, validation functions, and secure error handling
    -   `rate-limit.ts`: Configurable rate limiting system with automatic cleanup
    -   `supabase/`: Secure client configuration for server and middleware

3.  **Middleware & Route Protection**:
    -   `middleware.ts`: Route protection ensuring authenticated access
    -   `lib/supabase/middleware.ts`: Session management and user verification

4.  **UI Components**:
    -   Form validation and sanitization on the client side
    -   Secure error message display without information leakage
    -   Rate limit feedback to users

---

## 📖 **Security Documentation**

For detailed information about the security audit process and fixes implemented, see:

- **`SECURITY_FIXES.md`**: Comprehensive documentation of all vulnerabilities found and fixes applied
- **`lib/security.ts`**: Security utility functions and validation helpers
- **`lib/rate-limit.ts`**: Rate limiting implementation and configuration

### 🔍 **Security Testing**

To verify the security improvements:

1. **Authorization Testing**: Try to access polls you don't own - should be blocked
2. **Input Validation**: Submit malicious scripts in poll questions/options - should be sanitized
3. **Rate Limiting**: Submit multiple votes quickly - should be rate limited
4. **Duplicate Voting**: Try to vote twice on the same poll - should be prevented
5. **Route Protection**: Try to access protected routes without authentication - should redirect to login

---

## 🚀 Getting Started

This guide will help you set up ALX Polly on your local machine in just a few minutes!

### 📋 Prerequisites

Before you begin, make sure you have:

- **Node.js** (v20.x or higher) - [Download here](https://nodejs.org/)
- **npm** or **yarn** package manager
- **Git** for version control
- **Supabase account** - [Sign up for free](https://supabase.io/)

### 🛠️ Installation Steps

#### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd alx-polly
```

#### Step 2: Install Dependencies
```bash
npm install
# or
yarn install
```

#### Step 3: Set Up Supabase

1. **Create a Supabase Project:**
   - Go to [supabase.com](https://supabase.com/)
   - Click "Start your project"
   - Create a new project
   - Wait for the project to be ready (2-3 minutes)

2. **Get Your Credentials:**
   - Go to **Settings** → **API**
   - Copy your **Project URL** and **anon/public key**

3. **Create Environment File:**
   ```bash
   # Create .env.local file in the project root
   touch .env.local
   ```

4. **Add Your Credentials:**
   ```env
   # .env.local
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

#### Step 4: Set Up Database Tables

Run these SQL commands in your Supabase SQL editor:

```sql
-- Create polls table
CREATE TABLE polls (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  question TEXT NOT NULL CHECK (length(question) >= 3 AND length(question) <= 500),
  options TEXT[] NOT NULL CHECK (array_length(options, 1) >= 2 AND array_length(options, 1) <= 10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create votes table
CREATE TABLE votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id UUID REFERENCES polls(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  option_index INTEGER NOT NULL CHECK (option_index >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all polls" ON polls FOR SELECT USING (true);
CREATE POLICY "Users can create polls" ON polls FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own polls" ON polls FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own polls" ON polls FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view all votes" ON votes FOR SELECT USING (true);
CREATE POLICY "Users can create votes" ON votes FOR INSERT WITH CHECK (true);
```

#### Step 5: Start the Development Server
```bash
npm run dev
# or
yarn dev
```

🎉 **Success!** Your app is now running at `http://localhost:3000`

### 📁 Project Structure

```
alx-polly/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication pages (login, register)
│   │   ├── login/page.tsx        # Login page component
│   │   └── register/page.tsx     # Registration page component
│   ├── (dashboard)/              # Protected dashboard routes
│   │   ├── create/               # Poll creation
│   │   │   ├── page.tsx          # Create poll page
│   │   │   └── PollCreateForm.tsx # Poll creation form component
│   │   ├── polls/                # Poll management
│   │   │   ├── page.tsx          # User polls dashboard
│   │   │   ├── PollActions.tsx   # Poll card component
│   │   │   └── [id]/             # Individual poll pages
│   │   └── layout.tsx            # Dashboard layout
│   ├── lib/
│   │   ├── actions/              # Server Actions (secure API endpoints)
│   │   │   ├── auth-actions.ts   # Authentication functions
│   │   │   └── poll-actions.ts   # Poll management functions
│   │   ├── context/              # React context providers
│   │   └── types/                # TypeScript type definitions
│   ├── components/               # Reusable UI components
│   └── globals.css               # Global styles
├── lib/                          # Utility libraries
│   ├── security.ts               # Security utilities & validation
│   ├── rate-limit.ts             # Rate limiting implementation
│   └── supabase/                 # Supabase client configuration
├── components/ui/                # shadcn/ui components
├── middleware.ts                 # Next.js middleware for auth
└── SECURITY_FIXES.md             # Security audit documentation
```

## 📖 Usage Examples

### Creating a Poll
1. **Sign up** for an account or **log in**
2. Click **"Create New Poll"** from the dashboard
3. **Enter your question** (3-500 characters)
4. **Add options** (2-10 options, 1-200 characters each)
5. Click **"Create Poll"** to save

### Voting on a Poll
1. **Navigate** to a poll (via shared link or dashboard)
2. **Select** your preferred option
3. Click **"Submit Vote"**
4. **View results** in real-time

### Managing Your Polls
- **View all polls** on your dashboard
- **Edit polls** you own (click "Edit" button)
- **Delete polls** you own (click "Delete" button)
- **Share polls** using the shareable link

## 🧪 Testing the Application

### Manual Testing Checklist

#### Authentication Flow
- [ ] **Registration**: Create new account with valid email/password
- [ ] **Login**: Sign in with existing credentials
- [ ] **Logout**: Sign out and verify redirect to login
- [ ] **Protected Routes**: Try accessing `/polls` without login

#### Poll Creation
- [ ] **Valid Poll**: Create poll with 2+ options
- [ ] **Validation**: Try creating poll with < 2 options
- [ ] **Length Limits**: Test question/option length limits
- [ ] **Rate Limiting**: Create multiple polls quickly

#### Voting System
- [ ] **Valid Vote**: Vote on existing poll
- [ ] **Duplicate Prevention**: Try voting twice (if logged in)
- [ ] **Anonymous Voting**: Vote without being logged in
- [ ] **Invalid Options**: Try voting with invalid option index

#### Security Features
- [ ] **Authorization**: Try editing/deleting others' polls
- [ ] **Input Sanitization**: Submit polls with HTML/script tags
- [ ] **Rate Limiting**: Submit votes rapidly
- [ ] **Error Handling**: Test with invalid data

### Automated Testing
```bash
# Run TypeScript type checking
npm run tsc

# Run ESLint for code quality
npm run lint

# Build the application
npm run build
```

## 🤝 Contributing

We welcome contributions! Here's how to get started:

### Development Workflow
1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Make** your changes with proper documentation
4. **Test** your changes thoroughly
5. **Commit** with clear messages: `git commit -m 'Add amazing feature'`
6. **Push** to your branch: `git push origin feature/amazing-feature`
7. **Open** a Pull Request

### Code Standards
- **Documentation**: Add JSDoc comments for all functions/components
- **TypeScript**: Use proper typing throughout
- **Security**: Follow security best practices
- **Testing**: Test all new functionality
- **Style**: Follow existing code patterns

### Areas for Contribution
- 🐛 **Bug fixes** and improvements
- 🚀 **New features** (poll categories, advanced voting, etc.)
- 📚 **Documentation** improvements
- 🧪 **Test coverage** expansion
- 🎨 **UI/UX** enhancements
- 🔒 **Security** improvements

## 🎉 **Security Audit Complete!**

This application now represents a **production-ready, secure polling system** with:

- ✅ **Zero Critical Vulnerabilities**: All security flaws have been identified and fixed
- ✅ **Industry-Standard Security**: Implements best practices for web application security
- ✅ **Comprehensive Documentation**: Detailed security audit report and implementation guide
- ✅ **Robust Error Handling**: Safe error messages without information leakage
- ✅ **Rate Limiting**: Protection against abuse and DoS attacks
- ✅ **Input Validation**: XSS and injection attack prevention
- ✅ **Authorization Controls**: Proper ownership-based access controls

The application is now ready for production deployment with confidence in its security posture. All security measures have been implemented following industry best practices and are thoroughly documented for future maintenance and enhancement.

**Happy coding with confidence!** 🚀

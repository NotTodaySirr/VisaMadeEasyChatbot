# Layout Components Usage Guide

## Overview
This project includes two main layout components for different user states:
- **GuestLayout**: For non-authenticated users
- **RegisteredLayout**: For authenticated users (placeholder for future implementation)

## GuestLayout

### Basic Usage
```jsx
import GuestLayout from '../../../layout/guest';

const MyPage = () => {
  return (
    <GuestLayout pageType="default">
      <div>
        {/* Your page content here */}
        <h1>Page Title</h1>
        <p>Page content...</p>
      </div>
    </GuestLayout>
  );
};
```

### Props
- `children`: React components/elements to render in the main content area
- `pageType`: (optional) String that determines header styling
  - `"default"` - Default landing page styling
  - `"started"` - Post-start button styling (used in auth pages)
  - `"in-chat"` - Chat page styling

### Available Page Types
1. **default**: For landing page and general content
2. **started**: For pages after user has started interaction (auth pages)
3. **in-chat**: For chat interface pages

### Example Implementations

#### Authentication Pages
```jsx
// Login Page
<GuestLayout pageType="started">
  <div className="auth-content">
    <h1>Welcome Back</h1>
    <AuthForm mode="login" />
  </div>
</GuestLayout>

// Register Page
<GuestLayout pageType="started">
  <div className="auth-content">
    <h1>Create Account</h1>
    <AuthForm mode="register" />
  </div>
</GuestLayout>
```

#### Landing Page
```jsx
<GuestLayout pageType="default">
  <div className="landing-content">
    <section id="hero">
      <h1>Welcome to VisaMadeEasy</h1>
    </section>
    <section id="features">
      <h2>Features</h2>
    </section>
  </div>
</GuestLayout>
```

#### Chat Page (Guest)
```jsx
<GuestLayout pageType="in-chat">
  <div className="chat-content">
    <div className="chat-messages">
      {/* Chat messages */}
    </div>
    <div className="chat-input">
      {/* Chat input */}
    </div>
  </div>
</GuestLayout>
```

## RegisteredLayout (Placeholder)

### Basic Usage
```jsx
import RegisteredLayout from '../../../layout/registered';

const MyAuthenticatedPage = ({ user }) => {
  return (
    <RegisteredLayout pageType="default" user={user}>
      <div>
        {/* Authenticated user content */}
        <h1>Dashboard</h1>
        <p>Welcome back, {user.name}!</p>
      </div>
    </RegisteredLayout>
  );
};
```

### Props
- `children`: React components/elements to render in the main content area
- `pageType`: (optional) Same options as GuestLayout
- `user`: (optional) User object for authenticated user information

## Layout Features

### Responsive Design
Both layouts include responsive design breakpoints:
- Desktop: Full padding and spacing
- Tablet (≤768px): Reduced padding
- Mobile (≤480px): Minimal padding for optimal mobile experience

### Background Styling
Both layouts maintain the consistent light blue background (`#EDF2FB`) across the entire application.

### Header Integration
- Automatically includes the Header component
- Passes appropriate props based on authentication state
- Handles different page types for proper styling

### Main Container
- Uses flexbox for proper layout
- Takes remaining height after header
- Provides consistent padding and spacing
- Handles content overflow appropriately

## Migration from Manual Header Usage

### Before (Manual Header)
```jsx
return (
  <div className="page-container">
    <Header isLoggedIn={false} pageType="started" />
    <main className="main-content">
      {/* content */}
    </main>
  </div>
);
```

### After (Using Layout)
```jsx
return (
  <GuestLayout pageType="started">
    {/* content */}
  </GuestLayout>
);
```

## Benefits
1. **Consistency**: Ensures all pages use the same layout structure
2. **Maintainability**: Single place to update layout logic
3. **Reusability**: Easy to apply to new pages
4. **Responsive**: Built-in responsive design
5. **Clean Code**: Reduces repetitive header and container code
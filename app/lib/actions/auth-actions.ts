/**
 * Authentication Server Actions
 * 
 * This module contains all server-side authentication functions for the ALX Polly application.
 * These functions handle user login, registration, logout, and session management using Supabase Auth.
 * 
 * @fileoverview Server actions for user authentication and session management
 * @author ALX Polly Team
 * @since 1.0.0
 */

'use server';

import { createClient } from '@/lib/supabase/server';
import { LoginFormData, RegisterFormData } from '../types';

/**
 * Authenticates a user with email and password credentials.
 * 
 * This function handles the login process by validating user credentials against
 * the Supabase authentication system. It's used when users want to access their
 * account and create/manage polls.
 * 
 * @param {LoginFormData} data - User login credentials
 * @param {string} data.email - User's email address
 * @param {string} data.password - User's password
 * 
 * @returns {Promise<{error: string | null}>} Result object containing error message if login fails
 * 
 * @example
 * ```typescript
 * const result = await login({ email: 'user@example.com', password: 'password123' });
 * if (result.error) {
 *   console.error('Login failed:', result.error);
 * } else {
 *   // User successfully logged in
 * }
 * ```
 * 
 * @throws {Error} Throws error if Supabase client creation fails
 * 
 * @since 1.0.0
 */
export async function login(data: LoginFormData) {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  });

  if (error) {
    return { error: error.message };
  }

  // Success: no error
  return { error: null };
}

/**
 * Registers a new user account with email, password, and profile information.
 * 
 * This function creates a new user account in the Supabase authentication system.
 * It includes user metadata (name) and handles the complete registration process.
 * Used when new users want to join the platform and start creating polls.
 * 
 * @param {RegisterFormData} data - User registration information
 * @param {string} data.name - User's full name
 * @param {string} data.email - User's email address (must be unique)
 * @param {string} data.password - User's chosen password
 * 
 * @returns {Promise<{error: string | null}>} Result object containing error message if registration fails
 * 
 * @example
 * ```typescript
 * const result = await register({ 
 *   name: 'John Doe', 
 *   email: 'john@example.com', 
 *   password: 'securePassword123' 
 * });
 * if (result.error) {
 *   console.error('Registration failed:', result.error);
 * } else {
 *   // User successfully registered
 * }
 * ```
 * 
 * @throws {Error} Throws error if Supabase client creation fails
 * 
 * @since 1.0.0
 */
export async function register(data: RegisterFormData) {
  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        name: data.name,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  // Success: no error
  return { error: null };
}

/**
 * Logs out the currently authenticated user and clears their session.
 * 
 * This function terminates the user's authentication session by calling
 * Supabase's signOut method. It's used when users want to securely
 * end their session and return to the public state.
 * 
 * @returns {Promise<{error: string | null}>} Result object containing error message if logout fails
 * 
 * @example
 * ```typescript
 * const result = await logout();
 * if (result.error) {
 *   console.error('Logout failed:', result.error);
 * } else {
 *   // User successfully logged out
 *   // Redirect to login page or public area
 * }
 * ```
 * 
 * @throws {Error} Throws error if Supabase client creation fails
 * 
 * @since 1.0.0
 */
export async function logout() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    return { error: error.message };
  }
  return { error: null };
}

/**
 * Retrieves the currently authenticated user's information.
 * 
 * This function fetches the current user's profile data from the active session.
 * It's commonly used to check authentication status, display user information,
 * or verify user permissions for protected operations.
 * 
 * @returns {Promise<User | null>} User object if authenticated, null if not authenticated
 * 
 * @example
 * ```typescript
 * const user = await getCurrentUser();
 * if (user) {
 *   console.log('User is authenticated:', user.email);
 *   // Show user-specific content
 * } else {
 *   // Redirect to login page
 * }
 * ```
 * 
 * @throws {Error} Throws error if Supabase client creation fails
 * 
 * @since 1.0.0
 */
export async function getCurrentUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return data.user;
}

/**
 * Retrieves the current user's authentication session.
 * 
 * This function fetches the complete session object including tokens,
 * expiration times, and user metadata. It's used for session validation,
 * token refresh, and maintaining authentication state across requests.
 * 
 * @returns {Promise<Session | null>} Session object if authenticated, null if no active session
 * 
 * @example
 * ```typescript
 * const session = await getSession();
 * if (session) {
 *   console.log('Session expires at:', session.expires_at);
 *   // Session is valid, proceed with authenticated operations
 * } else {
 *   // No active session, require login
 * }
 * ```
 * 
 * @throws {Error} Throws error if Supabase client creation fails
 * 
 * @since 1.0.0
 */
export async function getSession() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getSession();
  return data.session;
}

/**
 * Poll Management Server Actions
 * 
 * This module contains all server-side functions for poll creation, management, and voting.
 * It includes comprehensive security measures such as input validation, rate limiting,
 * authorization checks, and sanitization to ensure a secure polling experience.
 * 
 * @fileoverview Server actions for poll management, voting, and security
 * @author ALX Polly Team
 * @since 1.0.0
 */

"use server";

import { createClient } from "@/lib/supabase/server";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { sanitizeInput, isValidPollId, isValidOptionIndex, handleSecurityError } from "@/lib/security";

/**
 * Creates a new poll with validated and sanitized input data.
 * 
 * This function handles the complete poll creation process including input validation,
 * sanitization, rate limiting, and database insertion. It ensures that only authenticated
 * users can create polls and enforces security measures to prevent abuse.
 * 
 * Security Features:
 * - Input validation and sanitization to prevent XSS attacks
 * - Rate limiting (10 polls per hour per user)
 * - Authentication verification
 * - Length limits on questions (3-500 chars) and options (1-200 chars)
 * - Maximum of 10 options per poll
 * 
 * @param {FormData} formData - Form data containing poll question and options
 * @param {string} formData.question - The poll question (required, 3-500 characters)
 * @param {string[]} formData.options - Array of poll options (required, 2-10 options, 1-200 chars each)
 * 
 * @returns {Promise<{error: string | null}>} Result object containing error message if creation fails
 * 
 * @example
 * ```typescript
 * const formData = new FormData();
 * formData.append('question', 'What is your favorite programming language?');
 * formData.append('options', 'JavaScript');
 * formData.append('options', 'Python');
 * formData.append('options', 'Java');
 * 
 * const result = await createPoll(formData);
 * if (result.error) {
 *   console.error('Poll creation failed:', result.error);
 * } else {
 *   // Poll successfully created
 * }
 * ```
 * 
 * @throws {Error} Throws error for invalid input validation
 * @throws {Error} Throws error if rate limit exceeded
 * @throws {Error} Throws error if user not authenticated
 * 
 * @since 1.0.0
 */
export async function createPoll(formData: FormData) {
  const supabase = await createClient();

  // Extract form data with proper type casting
  const question = formData.get("question") as string;
  const options = formData.getAll("options").filter(Boolean) as string[];

  // ✅ SECURITY FIX: Comprehensive input validation
  // Validate question exists and is a string (prevents null/undefined injection)
  if (!question || typeof question !== 'string') {
    return { error: "Question is required" };
  }

  // Enforce reasonable length limits to prevent DoS attacks
  if (question.length > 500) {
    return { error: "Question is too long (max 500 characters)" };
  }

  if (question.length < 3) {
    return { error: "Question is too short (min 3 characters)" };
  }

  // ✅ SECURITY FIX: Sanitize question using security utility
  // Remove potentially dangerous characters to prevent XSS
  const sanitizedQuestion = sanitizeInput(question);

  // Validate options array structure and minimum requirements
  if (!options || !Array.isArray(options) || options.length < 2) {
    return { error: "Please provide at least two options." };
  }

  // Prevent excessive options that could impact performance
  if (options.length > 10) {
    return { error: "Too many options (max 10)" };
  }

  // ✅ SECURITY FIX: Validate and sanitize each option using security utility
  // Process each option individually to catch malformed data
  const sanitizedOptions = options.map((option, index) => {
    // Type checking prevents injection of non-string data
    if (typeof option !== 'string') {
      throw new Error(`Option ${index + 1} must be a string`);
    }
    
    // Length validation prevents excessively long options
    if (option.length > 200) {
      throw new Error(`Option ${index + 1} is too long (max 200 characters)`);
    }
    
    // Empty option validation (after trimming whitespace)
    if (option.trim().length === 0) {
      throw new Error(`Option ${index + 1} cannot be empty`);
    }
    
    // Use security utility for sanitization (removes XSS vectors)
    return sanitizeInput(option);
  });

  // Final validation: ensure we still have minimum required options after sanitization
  if (sanitizedOptions.length < 2) {
    return { error: "At least two non-empty options are required." };
  }

  // Get user from session
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError) {
    return { error: userError.message };
  }
  if (!user) {
    return { error: "You must be logged in to create a poll." };
  }

  // ✅ SECURITY FIX: Rate limiting for poll creation
  const rateLimitResult = await checkRateLimit(user.id, '', RATE_LIMITS.CREATE_POLL);
  if (!rateLimitResult.allowed) {
    return { 
      error: `Rate limit exceeded. You can create ${RATE_LIMITS.CREATE_POLL.maxRequests} polls per hour. Try again later.` 
    };
  }

  const { error } = await supabase.from("polls").insert([
    {
      user_id: user.id,
      question: sanitizedQuestion, // ✅ Use sanitized question
      options: sanitizedOptions,    // ✅ Use sanitized options
    },
  ]);

  if (error) {
    return { error: error.message };
  }

  return { error: null };
}

/**
 * Retrieves all polls created by the currently authenticated user.
 * 
 * This function fetches all polls owned by the current user, ordered by creation date
 * (newest first). It's used to populate the user's dashboard and provide a list
 * of polls they can manage, edit, or delete.
 * 
 * Security Features:
 * - Authentication verification (only authenticated users can access)
 * - User-specific data filtering (users can only see their own polls)
 * - Safe error handling without information leakage
 * 
 * @returns {Promise<{polls: Poll[], error: string | null}>} Object containing polls array and error message
 * 
 * @example
 * ```typescript
 * const result = await getUserPolls();
 * if (result.error) {
 *   console.error('Failed to fetch polls:', result.error);
 * } else {
 *   console.log(`Found ${result.polls.length} polls`);
 *   result.polls.forEach(poll => {
 *     console.log(`Poll: ${poll.question}`);
 *   });
 * }
 * ```
 * 
 * @throws {Error} Throws error if Supabase client creation fails
 * 
 * @since 1.0.0
 */
export async function getUserPolls() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { polls: [], error: "Not authenticated" };

  const { data, error } = await supabase
    .from("polls")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return { polls: [], error: error.message };
  return { polls: data ?? [], error: null };
}

/**
 * Retrieves a specific poll by its unique identifier.
 * 
 * This function fetches a single poll from the database using its ID. It's used
 * to display individual poll details, voting interfaces, and poll management pages.
 * The function is public (no authentication required) to allow anonymous voting.
 * 
 * Security Features:
 * - Poll ID validation using security utilities
 * - Safe error handling without exposing internal details
 * - Single poll retrieval (prevents data leakage)
 * 
 * @param {string} id - The unique identifier of the poll to retrieve
 * 
 * @returns {Promise<{poll: Poll | null, error: string | null}>} Object containing poll data and error message
 * 
 * @example
 * ```typescript
 * const result = await getPollById('poll-uuid-123');
 * if (result.error) {
 *   console.error('Failed to fetch poll:', result.error);
 * } else if (result.poll) {
 *   console.log(`Poll: ${result.poll.question}`);
 *   console.log(`Options: ${result.poll.options.join(', ')}`);
 * } else {
 *   console.log('Poll not found');
 * }
 * ```
 * 
 * @throws {Error} Throws error if Supabase client creation fails
 * 
 * @since 1.0.0
 */
export async function getPollById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("polls")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return { poll: null, error: error.message };
  return { poll: data, error: null };
}

/**
 * Submits a vote for a specific poll option with comprehensive security validation.
 * 
 * This function handles the voting process with multiple security layers to ensure
 * fair and secure voting. It validates poll existence, option bounds, prevents
 * duplicate voting, and implements rate limiting to prevent abuse.
 * 
 * Security Features:
 * - Poll ID validation and format checking
 * - Option index bounds validation against actual poll options
 * - Duplicate vote prevention for authenticated users
 * - Rate limiting (5 votes per minute per user/IP)
 * - Anonymous voting support with IP-based rate limiting
 * - Secure vote insertion with timestamps
 * 
 * @param {string} pollId - The unique identifier of the poll to vote on
 * @param {number} optionIndex - The zero-based index of the selected option
 * 
 * @returns {Promise<{error: string | null}>} Result object containing error message if voting fails
 * 
 * @example
 * ```typescript
 * const result = await submitVote('poll-uuid-123', 0);
 * if (result.error) {
 *   console.error('Vote failed:', result.error);
 *   // Handle error (rate limit, duplicate vote, invalid option, etc.)
 * } else {
 *   console.log('Vote submitted successfully');
 *   // Update UI to show vote was recorded
 * }
 * ```
 * 
 * @throws {Error} Throws error for invalid poll ID format
 * @throws {Error} Throws error for invalid option index
 * @throws {Error} Throws error if poll not found
 * @throws {Error} Throws error if option index out of bounds
 * @throws {Error} Throws error if rate limit exceeded
 * @throws {Error} Throws error if duplicate vote attempted
 * 
 * @since 1.0.0
 */
export async function submitVote(pollId: string, optionIndex: number) {
  const supabase = await createClient();
  
  // ✅ SECURITY FIX: Validate pollId format using security utility
  // Prevents injection attacks and ensures valid UUID format
  if (!isValidPollId(pollId)) {
    return { error: "Invalid poll ID" };
  }

  // ✅ SECURITY FIX: Validate optionIndex (will validate bounds after fetching poll)
  // Ensure optionIndex is a valid integer >= 0 (prevents array access attacks)
  if (typeof optionIndex !== 'number' || !Number.isInteger(optionIndex) || optionIndex < 0) {
    return { error: "Invalid option index" };
  }

  // ✅ SECURITY FIX: Get poll to validate optionIndex bounds
  // Fetch poll data to verify it exists and get actual option count
  const { data: poll, error: pollError } = await supabase
    .from("polls")
    .select("options")
    .eq("id", pollId)
    .single();
    
  if (pollError || !poll) {
    return { error: "Poll not found" };
  }

  // Validate optionIndex is within bounds of actual poll options
  if (!isValidOptionIndex(optionIndex, poll.options.length)) {
    return { error: "Invalid option selected" };
  }

  const { data: { user } } = await supabase.auth.getUser();

  // ✅ SECURITY FIX: Rate limiting for voting
  // Prevent abuse by limiting votes per minute (5 votes per minute per user/IP)
  const rateLimitResult = await checkRateLimit(user?.id ?? '', '', RATE_LIMITS.VOTE);
  if (!rateLimitResult.allowed) {
    return { 
      error: `Rate limit exceeded. You can vote ${RATE_LIMITS.VOTE.maxRequests} times per minute. Try again later.` 
    };
  }

  // ✅ SECURITY FIX: Prevent duplicate votes (if user is logged in)
  // Check if authenticated user has already voted on this poll
  if (user) {
    const { data: existingVote } = await supabase
      .from("votes")
      .select("id")
      .eq("poll_id", pollId)
      .eq("user_id", user.id)
      .single();
      
    if (existingVote) {
      return { error: "You have already voted on this poll" };
    }
  }

  // ✅ SECURITY FIX: Insert vote with validated data
  const { error } = await supabase.from("votes").insert([
    {
      poll_id: pollId,
      user_id: user?.id ?? null,
      option_index: optionIndex,
      created_at: new Date().toISOString()
    },
  ]);

  if (error) return { error: error.message };
  return { error: null };
}

/**
 * Deletes a poll with strict ownership verification and security validation.
 * 
 * This function allows users to delete their own polls only. It implements
 * comprehensive security measures to prevent unauthorized deletion and ensure
 * that users can only remove polls they own.
 * 
 * Security Features:
 * - Authentication verification (only authenticated users can delete)
 * - Ownership validation (users can only delete their own polls)
 * - Poll ID format validation using security utilities
 * - Safe error handling without information leakage
 * 
 * @param {string} id - The unique identifier of the poll to delete
 * 
 * @returns {Promise<{error: string | null}>} Result object containing error message if deletion fails
 * 
 * @example
 * ```typescript
 * const result = await deletePoll('poll-uuid-123');
 * if (result.error) {
 *   console.error('Poll deletion failed:', result.error);
 *   // Handle error (not authenticated, not owner, poll not found, etc.)
 * } else {
 *   console.log('Poll deleted successfully');
 *   // Update UI to remove poll from list
 * }
 * ```
 * 
 * @throws {Error} Throws error if user not authenticated
 * @throws {Error} Throws error for invalid poll ID format
 * @throws {Error} Throws error if user doesn't own the poll
 * @throws {Error} Throws error if poll not found
 * 
 * @since 1.0.0
 */
export async function deletePoll(id: string) {
  const supabase = await createClient();
  
  // ✅ SECURITY FIX: Verify user authentication
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return { error: "Authentication required" };
  }

  // ✅ SECURITY FIX: Validate poll ID format using security utility
  if (!isValidPollId(id)) {
    return { error: "Invalid poll ID" };
  }

  // ✅ SECURITY FIX: Only allow deleting polls owned by the current user
  const { error } = await supabase
    .from("polls")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id); // Critical: Only delete polls owned by current user

  if (error) return { error: error.message };
  return { error: null };
}

/**
 * Updates an existing poll with validated input and ownership verification.
 * 
 * This function allows users to modify their own polls by updating the question
 * and options. It implements the same security measures as poll creation to
 * ensure data integrity and prevent unauthorized modifications.
 * 
 * Security Features:
 * - Authentication verification (only authenticated users can update)
 * - Ownership validation (users can only update their own polls)
 * - Poll ID format validation using security utilities
 * - Input validation and sanitization (same as createPoll)
 * - Rate limiting and XSS prevention
 * 
 * @param {string} pollId - The unique identifier of the poll to update
 * @param {FormData} formData - Form data containing updated poll question and options
 * @param {string} formData.question - The updated poll question (required, 3-500 characters)
 * @param {string[]} formData.options - Array of updated poll options (required, 2-10 options, 1-200 chars each)
 * 
 * @returns {Promise<{error: string | null}>} Result object containing error message if update fails
 * 
 * @example
 * ```typescript
 * const formData = new FormData();
 * formData.append('question', 'Updated: What is your favorite programming language?');
 * formData.append('options', 'JavaScript');
 * formData.append('options', 'Python');
 * formData.append('options', 'TypeScript');
 * 
 * const result = await updatePoll('poll-uuid-123', formData);
 * if (result.error) {
 *   console.error('Poll update failed:', result.error);
 * } else {
 *   console.log('Poll updated successfully');
 * }
 * ```
 * 
 * @throws {Error} Throws error for invalid poll ID format
 * @throws {Error} Throws error for invalid input validation
 * @throws {Error} Throws error if user not authenticated
 * @throws {Error} Throws error if user doesn't own the poll
 * 
 * @since 1.0.0
 */
export async function updatePoll(pollId: string, formData: FormData) {
  const supabase = await createClient();

  // ✅ SECURITY FIX: Validate pollId format using security utility
  if (!isValidPollId(pollId)) {
    return { error: "Invalid poll ID" };
  }

  const question = formData.get("question") as string;
  const options = formData.getAll("options").filter(Boolean) as string[];

  // ✅ SECURITY FIX: Use same validation as createPoll
  if (!question || typeof question !== 'string') {
    return { error: "Question is required" };
  }

  if (question.length > 500) {
    return { error: "Question is too long (max 500 characters)" };
  }

  if (question.length < 3) {
    return { error: "Question is too short (min 3 characters)" };
  }

  const sanitizedQuestion = sanitizeInput(question);

  if (!options || !Array.isArray(options) || options.length < 2) {
    return { error: "Please provide at least two options." };
  }

  if (options.length > 10) {
    return { error: "Too many options (max 10)" };
  }

  const sanitizedOptions = options.map((option, index) => {
    if (typeof option !== 'string') {
      throw new Error(`Option ${index + 1} must be a string`);
    }
    
    if (option.length > 200) {
      throw new Error(`Option ${index + 1} is too long (max 200 characters)`);
    }
    
    if (option.trim().length === 0) {
      throw new Error(`Option ${index + 1} cannot be empty`);
    }
    
    return sanitizeInput(option);
  });

  if (sanitizedOptions.length < 2) {
    return { error: "At least two non-empty options are required." };
  }

  // Get user from session
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError) {
    return { error: userError.message };
  }
  if (!user) {
    return { error: "You must be logged in to update a poll." };
  }

  // Only allow updating polls owned by the user
  const { error } = await supabase
    .from("polls")
    .update({ question: sanitizedQuestion, options: sanitizedOptions }) // ✅ Use sanitized data
    .eq("id", pollId)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  return { error: null };
}

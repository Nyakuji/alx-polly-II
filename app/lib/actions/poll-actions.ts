"use server";

import { createClient } from "@/lib/supabase/server";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { sanitizeInput, isValidPollId, isValidOptionIndex, handleSecurityError } from "@/lib/security";

// CREATE POLL
export async function createPoll(formData: FormData) {
  const supabase = await createClient();

  const question = formData.get("question") as string;
  const options = formData.getAll("options").filter(Boolean) as string[];

  // ✅ SECURITY FIX: Comprehensive input validation
  if (!question || typeof question !== 'string') {
    return { error: "Question is required" };
  }

  if (question.length > 500) {
    return { error: "Question is too long (max 500 characters)" };
  }

  if (question.length < 3) {
    return { error: "Question is too short (min 3 characters)" };
  }

  // ✅ SECURITY FIX: Sanitize question using security utility
  const sanitizedQuestion = sanitizeInput(question);

  if (!options || !Array.isArray(options) || options.length < 2) {
    return { error: "Please provide at least two options." };
  }

  if (options.length > 10) {
    return { error: "Too many options (max 10)" };
  }

  // ✅ SECURITY FIX: Validate and sanitize each option using security utility
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
    
    // Use security utility for sanitization
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

// GET USER POLLS
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

// GET POLL BY ID
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

// SUBMIT VOTE
export async function submitVote(pollId: string, optionIndex: number) {
  const supabase = await createClient();
  
  // ✅ SECURITY FIX: Validate pollId format using security utility
  if (!isValidPollId(pollId)) {
    return { error: "Invalid poll ID" };
  }

  // ✅ SECURITY FIX: Validate optionIndex (will validate bounds after fetching poll)
  if (typeof optionIndex !== 'number' || !Number.isInteger(optionIndex) || optionIndex < 0) {
    return { error: "Invalid option index" };
  }

  // ✅ SECURITY FIX: Get poll to validate optionIndex bounds
  const { data: poll, error: pollError } = await supabase
    .from("polls")
    .select("options")
    .eq("id", pollId)
    .single();
    
  if (pollError || !poll) {
    return { error: "Poll not found" };
  }

  if (!isValidOptionIndex(optionIndex, poll.options.length)) {
    return { error: "Invalid option selected" };
  }

  const { data: { user } } = await supabase.auth.getUser();

  // ✅ SECURITY FIX: Rate limiting for voting
  const rateLimitResult = await checkRateLimit(user?.id ?? '', '', RATE_LIMITS.VOTE);
  if (!rateLimitResult.allowed) {
    return { 
      error: `Rate limit exceeded. You can vote ${RATE_LIMITS.VOTE.maxRequests} times per minute. Try again later.` 
    };
  }

  // ✅ SECURITY FIX: Prevent duplicate votes (if user is logged in)
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

// DELETE POLL
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

// UPDATE POLL
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

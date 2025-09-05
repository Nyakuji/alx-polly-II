/**
 * Poll Creation Form Component
 * 
 * This component provides a user-friendly interface for creating new polls.
 * It includes dynamic option management, form validation, error handling,
 * and secure submission to the server actions.
 * 
 * Features:
 * - Dynamic option addition/removal (2-10 options)
 * - Real-time form validation
 * - Secure server action integration
 * - User feedback for success/error states
 * - Automatic redirect after successful creation
 * 
 * @fileoverview Interactive form component for poll creation
 * @author ALX Polly Team
 * @since 1.0.0
 */

"use client";

import { useState } from "react";
import { createPoll } from "@/app/lib/actions/poll-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * Interactive form component for creating new polls.
 * 
 * This component manages the complete poll creation workflow including:
 * - Dynamic option management (add/remove options)
 * - Form state management (loading, error, success states)
 * - Secure form submission using server actions
 * - User feedback and automatic navigation
 * 
 * The form enforces business rules:
 * - Minimum 2 options, maximum 10 options
 * - Required poll question
 * - Server-side validation and sanitization
 * 
 * @returns {JSX.Element} The poll creation form component
 * 
 * @example
 * ```tsx
 * // Used in the create poll page
 * <PollCreateForm />
 * ```
 * 
 * @since 1.0.0
 */
export default function PollCreateForm() {
  // State management for form data and UI feedback
  const [options, setOptions] = useState(["", ""]); // Start with 2 empty options (minimum required)
  const [error, setError] = useState<string | null>(null); // Error message from server
  const [success, setSuccess] = useState(false); // Success state for user feedback

  /**
   * Updates a specific option at the given index.
   * Uses functional state update to ensure immutability.
   * 
   * @param {number} idx - The index of the option to update
   * @param {string} value - The new value for the option
   */
  const handleOptionChange = (idx: number, value: string) => {
    setOptions((opts) => opts.map((opt, i) => (i === idx ? value : opt)));
  };

  /**
   * Adds a new empty option to the poll.
   * Enforces maximum limit of 10 options (business rule).
   */
  const addOption = () => setOptions((opts) => [...opts, ""]);

  /**
   * Removes an option at the given index.
   * Enforces minimum of 2 options (business rule).
   * 
   * @param {number} idx - The index of the option to remove
   */
  const removeOption = (idx: number) => {
    if (options.length > 2) { // Prevent removing below minimum
      setOptions((opts) => opts.filter((_, i) => i !== idx));
    }
  };

  return (
    <form
      action={async (formData) => {
        // Reset UI state before submission
        setError(null);
        setSuccess(false);
        
        // Submit form data to server action (includes validation and security checks)
        const res = await createPoll(formData);
        
        if (res?.error) {
          // Display server-side validation errors to user
          setError(res.error);
        } else {
          // Show success feedback and redirect to polls list
          setSuccess(true);
          setTimeout(() => {
            window.location.href = "/polls"; // Full page reload to pick up new poll
          }, 1200); // Give user time to see success message
        }
      }}
      className="space-y-6 max-w-md mx-auto"
    >
      <div>
        <Label htmlFor="question">Poll Question</Label>
        <Input name="question" id="question" required />
      </div>
      <div>
        <Label>Options</Label>
        {/* Render dynamic options list */}
        {options.map((opt, idx) => (
          <div key={idx} className="flex items-center gap-2 mb-2">
            <Input
              name="options"
              value={opt}
              onChange={(e) => handleOptionChange(idx, e.target.value)}
              required
            />
            {/* Only show remove button if more than minimum options */}
            {options.length > 2 && (
              <Button type="button" variant="destructive" onClick={() => removeOption(idx)}>
                Remove
              </Button>
            )}
          </div>
        ))}
        {/* Add option button (will be disabled by server validation if > 10 options) */}
        <Button type="button" onClick={addOption} variant="secondary">
          Add Option
        </Button>
      </div>
      
      {/* Error feedback from server-side validation */}
      {error && <div className="text-red-500">{error}</div>}
      
      {/* Success feedback with automatic redirect */}
      {success && <div className="text-green-600">Poll created! Redirecting...</div>}
      
      <Button type="submit">Create Poll</Button>
    </form>
  );
} 
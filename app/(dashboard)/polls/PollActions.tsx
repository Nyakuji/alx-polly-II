/**
 * Poll Actions Component
 * 
 * This component renders individual poll cards with management actions.
 * It provides a clickable poll preview and owner-specific action buttons
 * for editing and deleting polls.
 * 
 * Features:
 * - Clickable poll preview (navigates to poll detail page)
 * - Owner-only action buttons (edit/delete)
 * - Confirmation dialog for destructive actions
 * - Responsive design with hover effects
 * - Secure ownership verification
 * 
 * @fileoverview Interactive poll card component with management actions
 * @author ALX Polly Team
 * @since 1.0.0
 */

"use client";

import Link from "next/link";
import { useAuth } from "@/app/lib/context/auth-context";
import { Button } from "@/components/ui/button";
import { deletePoll } from "@/app/lib/actions/poll-actions";

/**
 * Interface defining the structure of a poll object.
 * 
 * @interface Poll
 * @property {string} id - Unique identifier for the poll
 * @property {string} question - The poll question text
 * @property {any[]} options - Array of poll options
 * @property {string} user_id - ID of the user who created the poll
 */
interface Poll {
  id: string;
  question: string;
  options: any[];
  user_id: string;
}

/**
 * Props interface for the PollActions component.
 * 
 * @interface PollActionsProps
 * @property {Poll} poll - The poll object to display and manage
 */
interface PollActionsProps {
  poll: Poll;
}

/**
 * Interactive poll card component with management actions.
 * 
 * This component renders a poll card that users can click to view details,
 * and provides action buttons (edit/delete) for poll owners only.
 * It includes security measures to ensure only poll owners can manage their polls.
 * 
 * Security Features:
 * - Client-side ownership verification using auth context
 * - Confirmation dialog for destructive actions
 * - Server-side ownership validation in delete action
 * 
 * @param {PollActionsProps} props - Component props
 * @param {Poll} props.poll - The poll object to display
 * 
 * @returns {JSX.Element} The poll actions component
 * 
 * @example
 * ```tsx
 * <PollActions poll={pollData} />
 * ```
 * 
 * @since 1.0.0
 */
export default function PollActions({ poll }: PollActionsProps) {
  const { user } = useAuth();
  
  /**
   * Handles poll deletion with user confirmation.
   * 
   * This function shows a confirmation dialog before deleting the poll.
   * It calls the server action which includes additional security checks
   * to ensure only the poll owner can delete it.
   */
  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this poll?")) {
      await deletePoll(poll.id); // Server action includes ownership validation
      window.location.reload(); // Refresh to update the UI
    }
  };

  return (
    <div className="border rounded-md shadow-md hover:shadow-lg transition-shadow bg-white">
      {/* Clickable poll preview - navigates to poll detail page */}
      <Link href={`/polls/${poll.id}`}>
        <div className="group p-4">
          <div className="h-full">
            <div>
              <h2 className="group-hover:text-blue-600 transition-colors font-bold text-lg">
                {poll.question}
              </h2>
              <p className="text-slate-500">{poll.options.length} options</p>
            </div>
          </div>
        </div>
      </Link>
      
      {/* Owner-only action buttons */}
      {user && user.id === poll.user_id && (
        <div className="flex gap-2 p-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/polls/${poll.id}/edit`}>Edit</Link>
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      )}
    </div>
  );
}

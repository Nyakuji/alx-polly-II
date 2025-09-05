/**
 * User Polls Dashboard Page
 * 
 * This server component displays the user's personal poll dashboard.
 * It fetches all polls created by the authenticated user and provides
 * a grid layout for easy management and navigation.
 * 
 * Features:
 * - Server-side data fetching for optimal performance
 * - Responsive grid layout (2 cols on md, 3 cols on lg)
 * - Empty state with call-to-action
 * - Error handling and display
 * - Quick access to poll creation
 * 
 * @fileoverview Server component for user polls dashboard
 * @author ALX Polly Team
 * @since 1.0.0
 */

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getUserPolls } from '@/app/lib/actions/poll-actions';
import PollActions from './PollActions'; 

/**
 * Server component that renders the user's polls dashboard.
 * 
 * This component fetches the authenticated user's polls server-side
 * and renders them in a responsive grid layout. It handles empty states
 * and provides quick access to poll creation and management.
 * 
 * Security Features:
 * - Server-side authentication verification
 * - User-specific data filtering (only shows own polls)
 * - Safe error handling without information leakage
 * 
 * @returns {Promise<JSX.Element>} The polls dashboard page component
 * 
 * @example
 * ```tsx
 * // Rendered automatically when user navigates to /polls
 * <PollsPage />
 * ```
 * 
 * @throws {Error} Throws error if user not authenticated
 * @throws {Error} Throws error if database query fails
 * 
 * @since 1.0.0
 */
export default async function PollsPage() {
  // Fetch user's polls server-side (includes authentication check)
  const { polls, error } = await getUserPolls();

  return (
    <div className="space-y-6">
      {/* Page header with title and create button */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">My Polls</h1>
        <Button asChild>
          <Link href="/create">Create New Poll</Link>
        </Button>
      </div>
      
      {/* Responsive grid layout for poll cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {polls && polls.length > 0 ? (
          // Render poll cards for each user poll
          polls.map((poll) => <PollActions key={poll.id} poll={poll} />)
        ) : (
          // Empty state with call-to-action
          <div className="flex flex-col items-center justify-center py-12 text-center col-span-full">
            <h2 className="text-xl font-semibold mb-2">No polls yet</h2>
            <p className="text-slate-500 mb-6">Create your first poll to get started</p>
            <Button asChild>
              <Link href="/create">Create New Poll</Link>
            </Button>
          </div>
        )}
      </div>
      
      {/* Display server-side errors if any */}
      {error && <div className="text-red-500">{error}</div>}
    </div>
  );
}
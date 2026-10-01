export interface PollingStalledAlertProps {
  /** Resets the failure count and asks for a fresh read at once. */
  onRetry: () => void;
}

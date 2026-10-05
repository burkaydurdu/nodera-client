export interface SendExampleProps {
  /** The whole key, written into the command; null reads it from the shell variable instead. */
  apiKey: string | null;
  from: string;
  to: string;
}

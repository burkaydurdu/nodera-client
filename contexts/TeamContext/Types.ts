import type { Team } from "@/core/team";

export interface TeamContextValues {
  /** Every Team the user belongs to; empty until loaded. */
  teams: Team[];
  /** The selected Team (persisted in localStorage), null while loading or when there is none. */
  currentTeam: Team | null;
  isLoading: boolean;
  /** i18n-resolved message when loading the Teams failed. */
  error: string | null;
  selectTeam: (teamId: string) => void;
  /** Adds a freshly created Team to the list and selects it. */
  addTeam: (team: Team) => void;
  reload: () => Promise<void>;
  /** The Project of this Team last opened or created (persisted); null when none is known. */
  lastProjectId: string | null;
  /** Remembers a Project the moment it is opened or created, before any fetch answers. */
  rememberProject: (projectId: string) => void;
  forgetProject: () => void;
}

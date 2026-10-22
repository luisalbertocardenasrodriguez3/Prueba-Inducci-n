import { User } from 'firebase/auth';
import { getAccessToken, initAuth } from './googleAuth';
import {
  findOrCreateInductionSpreadsheet,
  syncLearnerToSheet,
  SpreadsheetInfo,
} from './googleSheetsService';
import { LearnerProfile, UserGameState } from '../types/induction';

export type AutoSyncStatus = 'idle' | 'syncing' | 'synced' | 'error' | 'unconnected';

export interface AutoSyncState {
  status: AutoSyncStatus;
  lastSyncTime: string | null;
  spreadsheet: SpreadsheetInfo | null;
  currentUser: User | null;
  errorMessage: string | null;
}

// In-memory state
let currentState: AutoSyncState = {
  status: 'idle',
  lastSyncTime: localStorage.getItem('sena_last_autosync_time'),
  spreadsheet: (() => {
    const saved = localStorage.getItem('sena_spreadsheet_info');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  })(),
  currentUser: null,
  errorMessage: null,
};

type Listener = (state: AutoSyncState) => void;
const listeners = new Set<Listener>();

const notifyListeners = () => {
  listeners.forEach((listener) => {
    try {
      listener({ ...currentState });
    } catch (err) {
      console.warn('Error in autoSync listener:', err);
    }
  });
};

export const subscribeAutoSync = (listener: Listener): (() => void) => {
  listeners.add(listener);
  // Initial fire
  listener({ ...currentState });
  return () => {
    listeners.delete(listener);
  };
};

export const getAutoSyncState = (): AutoSyncState => {
  return { ...currentState };
};

export const setAutoSyncSpreadsheet = (sheet: SpreadsheetInfo | null) => {
  currentState.spreadsheet = sheet;
  if (sheet) {
    localStorage.setItem('sena_spreadsheet_info', JSON.stringify(sheet));
  }
  notifyListeners();
};

export const setAutoSyncUser = (user: User | null) => {
  currentState.currentUser = user;
  if (!user) {
    currentState.status = 'unconnected';
  } else if (currentState.status === 'unconnected') {
    currentState.status = 'idle';
  }
  notifyListeners();
};

// Debounce timer reference
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Automatically saves the apprentice record to Google Sheets in the background.
 * Non-blocking, error-handled, and discreet.
 */
export const triggerAutoSync = async (
  learner: LearnerProfile,
  gameState: UserGameState
): Promise<boolean> => {
  // Clear any existing debounce timer
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  return new Promise((resolve) => {
    debounceTimer = setTimeout(async () => {
      try {
        const token = await getAccessToken();
        if (!token) {
          currentState.status = 'unconnected';
          notifyListeners();
          resolve(false);
          return;
        }

        currentState.status = 'syncing';
        currentState.errorMessage = null;
        notifyListeners();

        // 1. Ensure spreadsheet is known or create/fetch it
        let sheet = currentState.spreadsheet;
        if (!sheet || !sheet.id) {
          sheet = await findOrCreateInductionSpreadsheet(token);
          setAutoSyncSpreadsheet(sheet);
        }

        // 2. Perform silent upsert to Google Sheets
        await syncLearnerToSheet(token, sheet.id, learner, gameState);

        const now = new Date();
        const formattedTime = now.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        });

        currentState.status = 'synced';
        currentState.lastSyncTime = formattedTime;
        currentState.errorMessage = null;
        localStorage.setItem('sena_last_autosync_time', formattedTime);
        notifyListeners();
        resolve(true);
      } catch (err: unknown) {
        console.warn('AutoSync background update failed:', err);
        const msg = err instanceof Error ? err.message : 'Error al sincronizar con Google Drive';
        currentState.status = 'error';
        currentState.errorMessage = msg;
        notifyListeners();
        resolve(false);
      }
    }, 400); // 400ms debounce
  });
};

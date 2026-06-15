export {};

declare global {
  interface Window {
    electronAPI: {
      // Auth
      getAccessToken: () => Promise<string | null>;
      setAccessToken: (token: string) => Promise<void>;
      clearTokens: () => Promise<void>;

      // Printing
      printPDF: (html: string) => Promise<void>;
      printThermal: (data: string) => Promise<void>;

      // File dialogs
      saveFile: (buffer: ArrayBuffer, filename: string) => Promise<string | null>;
      openFile: (filters?: Array<{ name: string; extensions: string[] }>) => Promise<string | null>;

      // Updates
      checkForUpdates: () => Promise<{ success: boolean; error?: string }>;
      downloadUpdate: () => Promise<{ success: boolean; error?: string }>;
      installUpdate: () => Promise<void>;
      onUpdateStatus: (callback: (status: string) => void) => void;
      onUpdateAvailable: (callback: (info: { version: string; releaseDate?: string; releaseNotes?: string }) => void) => void;
      onUpdateProgress: (callback: (progress: { percent: number; bytesPerSecond: number; transferred: number; total: number }) => void) => void;
      onUpdateReady: (callback: () => void) => void;
      onUpdateError: (callback: (error: string) => void) => void;

      // Window controls
      minimize: () => Promise<void>;
      maximize: () => Promise<void>;
      close: () => Promise<void>;
    };
  }
}

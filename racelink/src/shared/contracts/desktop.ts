export const windowChannels = {
  minimize: 'window:minimize',
  toggleMaximize: 'window:toggle-maximize',
  close: 'window:close',
  ready: 'window:ready',
  setTheme: 'window:set-theme',
  getZoom: 'window:get-zoom',
  setZoom: 'window:set-zoom',
  resetOverlayZoom: 'window:reset-overlay-zoom',
  getDebugMode: 'window:get-debug-mode',
  factoryReset: 'window:factory-reset',
} as const;

export type DesktopPlatform = 'darwin' | 'linux' | 'win32';
export type DesktopTheme = 'dark' | 'light';

export const minimumMainWindowZoom = 1;
export const maximumMainWindowZoom = 2;
export const mainWindowZoomStep = 0.05;

export type DesktopApi = Readonly<{
  platform: DesktopPlatform;
  minimize: () => void;
  toggleMaximize: () => void;
  close: () => void;
  /** The first frame is painted: the host may show the main window. */
  ready: () => void;
  setTheme: (theme: DesktopTheme) => void;
  getZoom: () => Promise<number>;
  setZoom: (zoom: number) => Promise<number>;
  resetOverlayZoom: () => Promise<void>;
  getDebugMode: () => Promise<boolean>;
  factoryReset: () => Promise<void>;
}>;

import { app, BrowserWindow, Menu } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';

if (started) {
  app.quit();
}

const createWindow = () => {
  /**
   * Note that every role is entirely lower case if exists.
   */
  const menu = Menu.getApplicationMenu()?.items.map(({ role, submenu }) => {
    const subItems = submenu?.items.map(({ role }) => ({ role }));
    return { role, subItems };
  });
  console.log(JSON.stringify(menu, null, 2));

  /**
   * But comparing role with a lower cased string causes the following error because is not compatible with a definition in `electron.d.ts` .
   * ```
   * This comparison appears to be unintentional because the types '"undo" | "redo" | "cut" | "copy" | "paste" | "pasteAndMatchStyle" | "delete" | "selectAll" | "reload" | "forceReload" | "toggleDevTools" | "resetZoom" | "zoomIn" | "zoomOut" | ... 29 more ... | "windowMenu"' and '"viewmenu"' have no overlap.
   * ```
   */
  const viewMenuTypeError = Menu.getApplicationMenu()?.items.find((item) => item.role === "viewmenu");
  console.log(viewMenuTypeError); // Despite type error it displays menu item.

  /**
   * Comparing with "correct" string passes type check but returns `undefined` because the real role name is lower cased.
   */
  const viewMenuUndefined = Menu.getApplicationMenu()?.items.find((item) => item.role === "viewMenu");
  console.log(viewMenuUndefined); // Displays `undefined`

  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  mainWindow.webContents.openDevTools();
};

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

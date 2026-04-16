/**
 * FileSystemDriver.js — Sync driver using the File System Access API.
 * Allows persistent access to a local folder (Chromium-based browsers).
 */

export class FileSystemDriver {
  constructor(directoryHandle) {
    this.handle = directoryHandle;
    this.fileName = 'terminybhp.vault';
  }

  /**
   * Request permission for read/write.
   */
  async requestPermission() {
    const opts = { mode: 'readwrite' };
    if ((await this.handle.queryPermission(opts)) === 'granted') return true;
    if ((await this.handle.requestPermission(opts)) === 'granted') return true;
    return false;
  }

  /**
   * Save a Blob to the local folder.
   */
  async save(blob) {
    if (!(await this.requestPermission())) throw new Error('PERMISSION_DENIED');
    
    // Get file handle (create if not exists)
    const fileHandle = await this.handle.getFileHandle(this.fileName, { create: true });
    
    // Create a writable stream
    const writable = await fileHandle.createWritable();
    
    // Write the contents of the blob to the stream
    await writable.write(blob);
    
    // Close the file and write the contents to disk
    await writable.close();
  }

  /**
   * Load a Blob from the local folder.
   */
  async load() {
    if (!(await this.requestPermission())) throw new Error('PERMISSION_DENIED');

    try {
      const fileHandle = await this.handle.getFileHandle(this.fileName);
      const file = await fileHandle.getFile();
      return file; // File is a specialized Blob
    } catch (e) {
      if (e.name === 'NotFoundError') return null;
      throw e;
    }
  }

  /**
   * Static helper to pick a directory.
   */
  static async pickDirectory() {
    if (!window.showDirectoryPicker) {
      throw new Error('BROWSER_UNSUPPORTED');
    }
    return window.showDirectoryPicker();
  }
}

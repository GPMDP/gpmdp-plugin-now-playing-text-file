import fs from 'fs';
import path from 'path';

class NowPlayingTextFilePlugin {
  static PLUGIN_NAME = 'Now Playing Text File';

  constructor(electronRequire, Emitter, PlaybackAPI, WindowManager, buildDir, additionals) {
    this.require = electronRequire;
    this.Emitter = Emitter;
    this.PlaybackAPI = PlaybackAPI;
    this.WindowManager = WindowManager;
    this.buildDir = buildDir;
    this.additionals = additionals;
    this.isMainProcess = PlaybackAPI !== null;

    if (this.isMainProcess) {
      this.filePath = path.resolve(this.require('electron').app.getPath('userData'), 'now_playing.txt');
    }
  }

  install() {
    fs.writeFileSync(this.filePath, '');
  }

  uninstall() {
    fs.unlinkSync(this.filePath);
    if (this.isMainProcess) {
      this.PlaybackAPI.removeListener('change:track', this._writeFile);
    }
  }

  activate() {
    if (this.isMainProcess) {
      this.PlaybackAPI.on('change:track', this._writeFile);
      this._writeFile();
    }
  }

  _writeFile = () => {
    const track = this.PlaybackAPI.currentSong(true);
    if (track) {
      fs.writeFileSync(this.filePath, `${track.title} - ${track.artist}`);
    } else {
      fs.writeFileSync(this.filePath, '');
    }
  }
}

module.exports = NowPlayingTextFilePlugin;

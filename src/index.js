import fs from 'fs';
import path from 'path';

class NowPlayingTextFilePlugin {
  static PLUGIN_NAME = 'Now Playing Text File';
  static CONFIG = [
    {
      key: 'file_name',
      name: 'File Name',
      default: 'now_playing.txt',
      type: 'text',
    },
    {
      key: 'enabled',
      name: 'Enabled',
      default: true,
      type: 'bool',
    },
  ];

  constructor(electronRequire, Emitter, Settings, PlaybackAPI, WindowManager, buildDir, additionals) {
    this.require = electronRequire;
    this.Emitter = Emitter;
    this.Settings = Settings;
    this.PlaybackAPI = PlaybackAPI;
    this.WindowManager = WindowManager;
    this.buildDir = buildDir;
    this.additionals = additionals;
    this.isMainProcess = PlaybackAPI !== null;
  }

  install() {
    if (this.isMainProcess) {
      fs.writeFileSync(this._getFilePath(), '');
    }
  }

  uninstall() {
    if (this.isMainProcess) {
      fs.unlinkSync(this._getFilePath());
      this.PlaybackAPI.removeListener('change:track', this._writeFile);
    }
  }

  activate() {
    if (this.isMainProcess) {
      this.PlaybackAPI.on('change:track', this._writeFile);
      this._writeFile();
      this.lastPath = this._getFilePath();
      this.Settings.onChange('enabled', (enabled) => {
        if (enabled) {
          this._writeFile();
        } else {
          fs.writeFileSync(this._getFilePath(), '');
        }
      });
      this.Settings.onChange('file_name', (newFileName) => {
        if (fs.existsSync(this.lastPath)) fs.unlinkSync(this.lastPath);
        this.lastPath = this._getFilePath();
        this._writeFile();
      });
    }
  }

  _getFilePath() {
    return path.resolve(this.require('electron').app.getPath('userData'), this.Settings.get('file_name'));
  }

  _writeFile = () => {
    if (!this.Settings.get('enabled')) return;
    const track = this.PlaybackAPI.currentSong(true);
    if (track) {
      fs.writeFileSync(this._getFilePath(), `${track.title} - ${track.artist}`);
    } else {
      fs.writeFileSync(this._getFilePath(), '');
    }
  }
}

module.exports = NowPlayingTextFilePlugin;

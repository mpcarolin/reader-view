'use strict';

var config = {
  callbacks: [] // will be called when prefs are ready
};
config.prefs = {
  'font-size': 13,
  'font': 'sans-serif',
  'width': 600,
  'line-height': 28.8,
  'new-tab': true,
  'faqs': true,
  'version': null,
  'user-css': '', // is used for exporting from old method; do not delete
  'last-update': 0,
  'speech-voice': 'default', // 0 - 2
  'speech-pitch': 1, // 0 - 2
  'speech-rate': 1, // 0.1 - 10,
  'schedule-background': false, // is used to change the reader background color on a timed schedule
  'dark-time': 8,
  'sepia-time': 8,
  'light-time': 8
};

chrome.storage.onChanged.addListener(prefs => {
  Object.keys(prefs).forEach(key => config.prefs[key] = prefs[key].newValue);
});

chrome.storage.local.get(config.prefs, prefs => {
  Object.assign(config.prefs, prefs);
  config.ready = true;
  config.callbacks.forEach(c => c());
});
config.load = c => {
  if (config.ready) {
    c();
  }
  else {
    config.callbacks.push(c);
  }
};

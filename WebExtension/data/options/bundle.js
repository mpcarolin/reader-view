(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
// updates the mode timer options in the options page
function setScheduleOptions() {
  console.log('setting schedule options')
  const makeHourString = (hour) => {
    if ((hour % 12) === 0) return `12:00 ${(hour >= 12) ? "PM" : "AM"}` 
    return `${(hour % 12)}:00 ${(hour >= 12) ? "PM" : "AM"}`
  } 

  const makeOption = (hour, text) => {
    const option = document.createElement('option')
    option.value = hour
    option.textContent = text
    return option
  }

  // generates a 'Never' option with a value of -2 
  document.getElementById('light-time').appendChild(makeOption(-2, "Never")) 
  document.getElementById('dark-time').appendChild(makeOption(-2, "Never"))
  document.getElementById('sepia-time').appendChild(makeOption(-2, "Never")) 

  // generate the time options, one per hour, for the dark, light, and sepia select boxes.
  for (let i = 0; i < 24; i++) {
    let text = makeHourString(i)
    document.getElementById('light-time').appendChild(makeOption(i, text)) 
    document.getElementById('dark-time').appendChild(makeOption(i, text))
    document.getElementById('sepia-time').appendChild(makeOption(i, text)) 
  }
}

// show: boolean
function showScheduleOptions(shouldShow) {
  let styles = ["dark-tr", "sepia-tr", "light-tr"].map(id => document.getElementById(id).style)
  for (let i = 0; i < styles.length; i++) {
    let style = styles[i] 
    style.display = shouldShow ? 'block' : 'none'
  }
}

module.exports = { setScheduleOptions, showScheduleOptions }
},{}],2:[function(require,module,exports){
/* globals config */
'use strict';

const { setScheduleOptions, showScheduleOptions } = require('../mode-switch/mode-switch-options.js')

function save() {
  localStorage.setItem('top-css', document.getElementById('top-style').value || '');
  localStorage.setItem('user-css', document.getElementById('user-css').value || '');
  chrome.runtime.sendMessage({
    cmd: 'update-styling'
  });
  chrome.storage.local.set({
    'user-css': document.getElementById('user-css').value,
    'new-tab': document.getElementById('new-tab').checked,
    'faqs': document.getElementById('faqs').checked,
    'speech-voice': document.getElementById('speech-voice').value,
    'speech-rate': Math.max(Math.min(Number(document.getElementById('speech-rate').value), 3), 0.5),
    'speech-pitch': Math.max(Math.min(Number(document.getElementById('speech-pitch').value), 2), 0),
    'schedule-background': document.getElementById('schedule-background').checked,
    'dark-time': document.getElementById('dark-time').value,
    'sepia-time': document.getElementById('sepia-time').value,
    'light-time': document.getElementById('light-time').value
  }, () => {
    const status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(() => status.textContent = '', 750);
  });
}

// TODO: make this only happen if schedule-background is selected. Hide otherwise!
// create the select box options for the extension's options index page
chrome.storage.local.get(prefs => {
  if (prefs['schedule-background']) {
    setScheduleOptions()
  } else {
    showScheduleOptions(false)
  }
})

document.getElementById('schedule-background').addEventListener('change', ($event) => {
  let isChecked = $event.target.checked
  console.log(`is checked: ${isChecked}`)
  showScheduleOptions(isChecked)
})



speechSynthesis.onvoiceschanged = () => speechSynthesis.getVoices().forEach(o => {
  const option = document.createElement('option');
  option.value = o.voiceURI;
  option.textContent = `${o.name} (${o.lang})`;
  document.getElementById('speech-voice').appendChild(option);
});

function restore() {
  document.getElementById('top-style').value = localStorage.getItem('top-css') || '';
  document.getElementById('user-css').value = localStorage.getItem('user-css') || '';

  chrome.storage.local.get(config.prefs, prefs => {
    document.getElementById('new-tab').checked = prefs['new-tab'];
    document.getElementById('faqs').checked = prefs['faqs'];
    document.getElementById('speech-pitch').value = prefs['speech-pitch'];
    document.getElementById('speech-rate').value = prefs['speech-rate'];
    document.getElementById('speech-voice').value = prefs['speech-voice'];
    document.getElementById('schedule-background').checked = prefs['schedule-background'];
    document.getElementById('dark-time').value = prefs['dark-time'];
    document.getElementById('sepia-time').value = prefs['sepia-time'];
    document.getElementById('light-time').value = prefs['light-time'];
  });
}
config.load(restore);
document.getElementById('save').addEventListener('click', save);

document.getElementById('support').addEventListener('click', () => chrome.tabs.create({
  url: chrome.runtime.getManifest().homepage_url + '?rd=donate'
}));

document.getElementById('reset').addEventListener('click', e => {
  if (e.detail === 1) {
    const status = document.getElementById('status');
    window.setTimeout(() => status.textContent = '', 750);
    status.textContent = 'Double-click to reset!';
  }
  else {
    localStorage.clear();
    chrome.storage.local.clear(() => {
      chrome.runtime.reload();
      window.close();
    });
  }
});

if (navigator.userAgent.indexOf('Firefox') !== -1) {
  document.getElementById('rate').href =
    'https://addons.mozilla.org/en-US/firefox/addon/reader-view/reviews/';
}
else if (navigator.userAgent.indexOf('OPR') !== -1) {
  document.getElementById('rate').href =
    'https://addons.opera.com/en/extensions/details/reader-view-2/#feedback-container';
}

document.getElementById('ref').href = chrome.runtime.getManifest().homepage_url + '#faq5';


},{"../mode-switch/mode-switch-options.js":1}]},{},[2]);

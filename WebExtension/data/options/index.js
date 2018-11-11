/* globals config */
'use strict';

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

// mode: dark, sepia, or light
// hour: 1-24
// modulo function that handles negatives properly.
function realModulo(num, modulo) {
  return ((num % modulo) + modulo) % modulo
}

function getModeTimes(prefs) {
  const darkHour = parseInt(prefs['dark-time'])
  const sepiaHour = parseInt(prefs['sepia-time'])
  const lightHour = parseInt(prefs['light-time'])

  let times = [
    new ModeTime('dark', darkHour),
    new ModeTime('sepia', sepiaHour),
    new ModeTime('light', lightHour)
  ]

  return times
    .filter(mode => (mode.hour > -1))
    .sort((a, b) => a.compareTo(b))
}

function getCurrentMode(modeTimes, currentHour) {
    for (var i = 0; i < times.length; i++) {
      let modeTime = times[i]
      if (modeTime.hour < 0) continue // ignore modes the user selected to be 'never'
      if (modeTime.hour > currentHour)
    }
}

const handleModeAlarm = (alarm) => {
  console.log('handling alarm ' + alarm.name)
  if (alarm.name !== 'mode-timer') return

  const localStorage = chrome.storage.local

  localStorage.get(config.prefs, prefs => {
    if (!prefs['schedule-background']) return
  
    const hour = new Date().getHours()
    let times = getModeTimes(prefs)


    if (hour === darkHour) {
      console.log('setting mode to dark')
      localStorage.set({'mode': 'dark'})
    } else if (hour === sepiaHour) {
      console.log('setting mode to sepia')
      localStorage.set({'mode': 'sepia'})
    } else if (hour === lightHour) {
      console.log('setting mode to light')
      localStorage.set({'mode': 'light'})
    }
  })
}

chrome.alarms.create('mode-timer', { periodInMinutes: 1 }) // check the time once a minute
chrome.alarms.onAlarm.addListener(handleModeAlarm)

function setScheduleOptions() {
  const hourString = (hour) => {
    if ((hour % 12) === 0) return `12:00 ${(hour >= 12) ? "PM" : "AM"}` 
    return `${(hour % 12)}:00 ${(hour >= 12) ? "PM" : "AM"}`
  } 

  function makeOption(hour, text) {
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
    let text = hourString(i)
    document.getElementById('light-time').appendChild(makeOption(i, text)) 
    document.getElementById('dark-time').appendChild(makeOption(i, text))
    document.getElementById('sepia-time').appendChild(makeOption(i, text)) 
  }
}
setScheduleOptions()

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


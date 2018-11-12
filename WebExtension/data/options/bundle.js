(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
// updates each select box's options in the options page for the modes
function setScheduleOptions() {
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

function restoreOptionSelections() {
  chrome.storage.local.get(config.prefs, prefs => {
    document.getElementById('dark-time').value = prefs['dark-time'];
    document.getElementById('sepia-time').value = prefs['sepia-time'];
    document.getElementById('light-time').value = prefs['light-time'];
  });
}

function showScheduleOptions(shouldShow) {
  let styles = ["dark-tr", "sepia-tr", "light-tr"].map(id => document.getElementById(id).style)
  for (let i = 0; i < styles.length; i++) {
    styles[i].display = shouldShow ? 'table-row' : 'none'
  }
  if (shouldShow) {
    setScheduleOptions() 
    restoreOptionSelections()
  }
}

module.exports = { setScheduleOptions, showScheduleOptions }
},{}],2:[function(require,module,exports){
const { ModeTimes } = require('mode-time')

const TIMER_NAME = "mode-timer"

// pulls out the starting hours for each mode, and adds it to the ModeTimes object with a mode name
function getModeTimes(prefs) {
  const darkHour = parseInt(prefs['dark-time'])
  const sepiaHour = parseInt(prefs['sepia-time'])
  const lightHour = parseInt(prefs['light-time'])

  const times = new ModeTimes()
  times.put('dark', darkHour)
  times.put('sepia', sepiaHour)
  times.put('light', lightHour)

  return times
}

// updates the mode using the ModeTimes module, so long as the user checked 'schedule-background'
function updateMode(prefs) {
  if (!prefs['schedule-background']) return

  let modeTimes = getModeTimes(prefs)
  const hour = new Date().getHours()
  const currentMode = modeTimes.getModeByHour(hour)

  console.log(`setting mode to ${currentMode.toString}`)
  localStorage.setItem('mode', currentMode.name);
}

// callback for alarm to update the mode, if the hour has changed to a new mode's time range
const handleModeAlarm = (alarm) => {
  console.log('alarm cb called')
  if (alarm.name === TIMER_NAME) {
    console.log('handling alarm!')
    chrome.storage.local.get(config.prefs, prefs => updateMode(prefs))
  }
}

// creates the alarm that will switch the reader theme modes at the user-defined times
function createModeTimer(alarmPeriodInMinutes) {
  console.log('creating mode timer')
  chrome.alarms.create(TIMER_NAME, { periodInMinutes: alarmPeriodInMinutes }) // check the time once a minute
  chrome.alarms.onAlarm.addListener(handleModeAlarm)
}

// if the user has chosen to schedule theme changes, creates a timer to manage this.
chrome.storage.local.get(config.prefs, prefs => {
  if (prefs['schedule-background']) {
    createModeTimer(1)
  }
})

module.exports = {
  updateMode, getModeTimes
}
},{"mode-time":4}],3:[function(require,module,exports){
/* globals config */
'use strict';

const { setScheduleOptions, showScheduleOptions } = require('../mode-switch/mode-switch-options.js')
const { updateMode } = require('../mode-switch/mode-switch.js')

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

  // immediately set the new mode to run in reader view depending on the time.
  chrome.storage.local.get(config.prefs, prefs => updateMode(prefs))
}

// create the select box options for the extension's options index page
chrome.storage.local.get(config.prefs, prefs => {
  if (prefs['schedule-background']) {
    setScheduleOptions()
  } else {
    showScheduleOptions(false)
  }
})

// event listener on the schedule-background checkbox to show/hide the select boxes
document.getElementById('schedule-background').addEventListener('change', ($event) => {
  let isChecked = $event.target.checked
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


},{"../mode-switch/mode-switch-options.js":1,"../mode-switch/mode-switch.js":2}],4:[function(require,module,exports){
class ModeTime {
	constructor (name, hour) {
		ModeTime.checkHour(hour)
		this.name = name	
		this.hour = hour
	}	

	compareTo (otherMode) {
		return (this.hour - otherMode.hour)
	}

	static checkHour (hour) {
		if (hour < 0 || hour > 23) {
			throw new Error('Hour must be an integer between 0 and 23, inclusive.')
		}
	}

	toString () {
		return 'ModeTime [name: ' + this.name + ', hour: ' + this.hour + ']'
	}
}

class ModeTimes {
	constructor () {
		this.times = {}
	}

	get length () {
		let length = 0
		for (let key in this.times) {
			if (this.times[key]) {
				length++
			}
		}
		return length
	}

	// use this if you want to directly add a modeTime
	putModeTime (modeTime) {
		this.times[modeTime.name] = modeTime
	}

	// easiest way to add a mode and its time. ModeName should be unique.
	put (modeName, scheduledHour) {
		let modeTime = new ModeTime(modeName, scheduledHour)	
		this.putModeTime(modeTime)
	}

	remove (modeName) {
		this.times[modeName] = null
	}

	get (modeName) {
		return this.times[modeName]
	}

	contains (modeName) {
		return (this.times[modeName] != null)
	}

	names () {
		return Object.keys(this.times)
	}

	// returns all inserted ModeTimes, sorted by hour.
	getAll () {
		return Object.values(this.times)
			.filter(modeTime => modeTime) // remove nulls
			.sort((a, b) => a.compareTo(b))
	}

	// returns the scheduled mode to be running at the specified hour (ModeTime object)
	getModeByHour (hour) {
		ModeTime.checkHour(hour)
		if (this.length == 0) {
			throw new Error("Cannot get current mode using an empty ModeTimes collection.")
		}

		let sortedTimes = this.getAll()

	    for (var i = 0; i < sortedTimes.length; i++) {
	      let modeTime = sortedTimes[i]
	      if (modeTime.hour > hour) {
	      	const prev = realModulo(i - 1, sortedTimes.length)
	      	return sortedTimes[prev]
	      }
	    }

		// if we do not find any mode with an hour greater than the currentHour, use the last value with the latest hour
	    return sortedTimes[sortedTimes.length - 1] 
	}

	toString () {
		let allTimes = this.getAll()	
		let start = "ModeTimes [ "
		const reducer = (acc, mt) => acc + "\n\t" + mt.toString()
		return start + allTimes.reduce(reducer, "") + "\n]"
	}
}

// modulo function that accounts for negative values
function realModulo (num, modulo) {
  return ((num % modulo) + modulo) % modulo
}


module.exports = {
	ModeTime, ModeTimes
}
},{}]},{},[3]);

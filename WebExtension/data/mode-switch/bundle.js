(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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
  const currentMode = modeTimes.getModeByTime(hour)

  console.log(`setting mode to ${currentMode.toString()}`)
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
},{"mode-time":2}],2:[function(require,module,exports){
class SimpleTime {
	// hours: 24 hour time notation values 0 - 23 inclusive
	// minutes: integers 0 - 59 inclusive
	constructor (hours, minutes, seconds) {
		this.hours = hours	
		this.minutes = minutes || 0
		this.seconds = seconds || 0
		SimpleTime.checkTime(this)
	}	

	compareTo (other) {
		let hourDiff = (this.hours - other.hours)
		let minuteDiff = (this.minutes - other.minutes)
		let secondsDiff = (this.seconds - other.seconds)
		if (hourDiff !== 0) return hourDiff
		if (minuteDiff !== 0) return minuteDiff
		return secondsDiff
	}

	static compare(st, st2) {
		return st.compareTo(st2)
	}

	static checkTime (time) {
		if (time.hours < 0 || time.hours > 23) {
			throw new Error('Hour must be an integer between 0 and 23, inclusive.')
		}
		if (time.minutes < 0 || time.minutes > 59) {
			throw new Error('Minute must be integer between 0 and 59, inclusive.')
		}
		if (time.seconds < 0 || time.seconds > 59) {
			throw new Error('Seconds must be integer between 0 and 59, inclusive.')
		}
	}
}

class ModeTime {
	// minutes are optional: if ommitted, it will use 00 for minutes.
	constructor (name, hours, minutes, seconds) {
		this.time = new SimpleTime(hours, minutes, seconds)
		this.name = name	
	}	

	get hours () {
		return this.time.hours
	}

	get minutes () {
		return this.time.minutes	
	}

	get seconds () {
		return this.time.seconds
	}

	compareTo (otherMode) {
		return this.time.compareTo(otherMode.time)
	}


	toString () {
		return `ModeTime [name: ${this.name}, hour: ${this.hours}, minutes: ${this.minutes}, seconds: ${this.seconds}]`
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

	putTimeString (modeName, timeString) {
		let comps = timeString.split(":")	
		const getPiece = (comps, idx) => {
			if (idx < comps.length) return parseInt(comps[idx])
			return null
		}
		this.put(modeName, getPiece(comps, 0), getPiece(comps, 1), getPiece(comps, 2))
	}

	// easiest way to add a mode and its time. ModeName should be unique.
	put (modeName, scheduledHour, scheduledMinutes, scheduledSeconds) {
		let modeTime = new ModeTime(modeName, scheduledHour, scheduledMinutes, scheduledSeconds)	
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
	getModeByTime (hour, minutes, seconds) {
		let time = new SimpleTime(hour, minutes, seconds)
		if (this.length == 0) {
			throw new Error("Cannot get current mode using an empty ModeTimes collection.")
		}

		let sortedModeTimes = this.getAll()

	    for (let i = 0; i < sortedModeTimes.length; i++) {
	      let next = sortedModeTimes[i].time
	      if (SimpleTime.compare(next, time) > 0) {
	      	const prev = realModulo(i - 1, sortedModeTimes.length)
	      	return sortedModeTimes[prev]
	      }
	    }

		// if we do not find any mode with an hour greater than the currentHour, use the last value with the latest hour
	    return sortedModeTimes[sortedModeTimes.length - 1] 
	}

	toString () {
		let allTimes = this.getAll()	
		const reducer = (acc, mt) => acc + "\n\t" + mt.toString()
		return "ModeTimes [ " + allTimes.reduce(reducer, "") + "\n]"
	}
}

// modulo function that accounts for negative values
function realModulo (num, modulo) {
  return ((num % modulo) + modulo) % modulo
}


module.exports = {
	SimpleTime, ModeTime, ModeTimes
}
},{}]},{},[1]);

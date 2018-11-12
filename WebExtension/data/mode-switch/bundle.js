(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const { ModeTimes } = require('mode-time')

let timerName = ""

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

const handleModeAlarm = (alarm) => {
  console.log(`handling alarm ${alarm.name}`)
  console.log('looking for timer with name ' + timerName)
  if (alarm.name !== timerName) return

  chrome.storage.local.get(config.prefs, prefs => {
    if (!prefs['schedule-background']) return

    let modeTimes = getModeTimes(prefs)
    const hour = new Date().getHours()
    const currentMode = modeTimes.getModeByHour(hour)

    console.log('setting mode in localStorage to ' + currentMode.toString())
    // chrome.storage.local.set({'mode': currentMode.name})
    localStorage.setItem('mode', currentMode.name);
  })
}

// creates the alarm that will switch the reader theme modes at the user-defined times
function createModeTimer(name, alarmPeriodInMinutes) {
  console.log(`creating a mode timer with name ${name} and period ${alarmPeriodInMinutes}`)
  chrome.alarms.create(name, { periodInMinutes: alarmPeriodInMinutes }) // check the time once a minute
  chrome.alarms.onAlarm.addListener(handleModeAlarm)
  timerName = name
}

// if the user has chosen to schedule theme changes, creates a timer to manage this.
chrome.storage.local.get(prefs => {
  if (prefs['schedule-background']) {
    createModeTimer('mode-timer', 1)
    console.log('mode timer set!')
  }
})
},{"mode-time":2}],2:[function(require,module,exports){
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
},{}]},{},[1]);

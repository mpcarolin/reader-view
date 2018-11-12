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
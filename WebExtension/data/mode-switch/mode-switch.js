const { ModeTimes } = require('mode-time')

const TIMER_NAME = "mode-timer"

// extracts each mode's starting time, and adds it to the ModeTimes object with a unique key
function getModeTimes(prefs) {
  const darkTime = parseInt(prefs['dark-time'])
  const sepiaTime = parseInt(prefs['sepia-time'])
  const lightTime = parseInt(prefs['light-time'])

  const times = new ModeTimes()
  times.putTimeString('dark', darkTime)
  times.putTimeString('sepia', sepiaTime)
  times.putTimeString('light', lightTime)

  return times
}

// updates the mode if a different mode should be active, so long as the user checked 'schedule-background'
function updateMode(prefs) {
  if (!prefs['schedule-background']) return

  const modeTimes = getModeTimes(prefs)
  const date = new Date()
  const hour = date.getHours()
  const minutes = date.getMinutes()
  const currentMode = modeTimes.getModeByTime(hour, minutes)

  console.log(`setting mode to ${currentMode.toString()}`)
  localStorage.setItem('mode', currentMode.name);


// callback for alarm to update the mode, if the current time is covered by a different mode's time range
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
  chrome.alarms.create(TIMER_NAME, { periodInMinutes: alarmPeriodInMinutes })
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
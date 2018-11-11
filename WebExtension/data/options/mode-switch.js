const { ModeTimes } = require('mode-time')

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
  if (alarm.name !== 'mode-timer') return

  chrome.storage.local.get(config.prefs, prefs => {
    if (!prefs['schedule-background']) return

    let modeTimes = getModeTimes(prefs)
    const hour = new Date().getHours()
    const currentMode = modeTimes.getModeByHour(hour)

    console.log('setting mode to ' + currentMode.toString())
    localStorage.set({'mode': currentMode.name})
  })
}

function createModeTimer (name, alarmPeriodInMinutes) {
  chrome.alarms.create(name, { periodInMinutes: alarmPeriodInMinutes }) // check the time once a minute
  chrome.alarms.onAlarm.addListener(handleModeAlarm)
}

module.exports = { createModeTimer }

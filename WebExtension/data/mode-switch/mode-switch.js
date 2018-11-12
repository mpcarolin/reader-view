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
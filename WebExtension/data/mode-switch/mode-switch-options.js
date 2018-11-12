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
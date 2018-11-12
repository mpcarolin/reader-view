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
  if (shouldShow) {
    setScheduleOptions() 
  }
}

module.exports = { setScheduleOptions, showScheduleOptions }
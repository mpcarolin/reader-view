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
    restoreOptionSelections()
  }
}

module.exports = { setScheduleOptions, showScheduleOptions }
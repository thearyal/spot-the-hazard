document.getElementById('playBtn').addEventListener('click', function(){
  window.location.href = 'game.html';
});
document.getElementById('howToPlayBtn').addEventListener('click', function(){
  document.getElementById('rulesPanel').classList.toggle('hidden');
});

// Settings Modal Logic
const settingsModal = document.getElementById('settingsModal');
const settingsBtnHome = document.getElementById('settingsBtnHome');
const closeSettingsBtn = document.getElementById('closeSettingsBtn');
const sensSlider = document.getElementById('sensSlider');

if(settingsBtnHome) {
  settingsBtnHome.addEventListener('click', () => {
    sensSlider.value = localStorage.getItem('hh_sens') || '1.0';
    settingsModal.classList.remove('hidden');
  });
}

if(closeSettingsBtn) {
  closeSettingsBtn.addEventListener('click', () => {
    localStorage.setItem('hh_sens', sensSlider.value);
    settingsModal.classList.add('hidden');
  });
}

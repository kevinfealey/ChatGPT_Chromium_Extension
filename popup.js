document.getElementById('addNewApiKey').addEventListener('click', function() {
  const apiKeyName = prompt("Enter a name for the API Key:");
  const apiKeyValue = prompt("Enter the API Key value:");
  if (apiKeyName && apiKeyValue) {
    chrome.storage.local.set({ [apiKeyName]: apiKeyValue }, function() {
      populateApiKeysDropdown();
    });
  }
});

document.getElementById('renameApiKey').addEventListener('click', function() {
  const selectedKey = document.getElementById('apiKeysDropdown').selectedOptions[0].text;
  const newKeyName = prompt("Enter a new name for the API Key:", selectedKey);
  if (newKeyName && selectedKey !== newKeyName) {
    chrome.storage.local.get(selectedKey, function(data) {
      const apiKeyValue = data[selectedKey];
      chrome.storage.local.remove(selectedKey, function() {
        chrome.storage.local.set({ [newKeyName]: apiKeyValue }, function() {
          populateApiKeysDropdown();
        });
      });
    });
  }
});

document.getElementById('removeApiKey').addEventListener('click', function() {
  const selectedKey = document.getElementById('apiKeysDropdown').selectedOptions[0].text;
  const confirmDelete = confirm(`Are you sure you want to delete the API Key named "${selectedKey}"?`);
  if (confirmDelete) {
    chrome.storage.local.remove(selectedKey, function() {
      populateApiKeysDropdown();
    });
  }
});

document.getElementById('modelDropdown').addEventListener('change', function() {
  const selectedModel = document.getElementById('modelDropdown').value;
  chrome.storage.local.set({ 'selected_model': selectedModel });
});

function populateApiKeysDropdown() {
  chrome.storage.local.get(null, function(items) {
    const apiKeyNames = Object.keys(items).filter(key => key !== 'selected_model');
    const dropdown = document.getElementById('apiKeysDropdown');
    dropdown.innerHTML = '';
    apiKeyNames.forEach(keyName => {
      const option = document.createElement('option');
      option.text = keyName;
      option.value = items[keyName];
      dropdown.add(option);
    });
  });
}

function loadSelectedModel() {
  chrome.storage.local.get('selected_model', function(data) {
    if (data.selected_model) {
      document.getElementById('modelDropdown').value = data.selected_model;
    }
  });
}

populateApiKeysDropdown();
loadSelectedModel();

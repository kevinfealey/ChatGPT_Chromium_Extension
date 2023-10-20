document.addEventListener('DOMContentLoaded', function() {
  const submitButton = document.getElementById('submitToGPT');
  if (submitButton) {
    submitButton.addEventListener('click', function() {
      const userPrompt = document.getElementById('userPrompt').value;
      const selectedText = document.getElementById('selectedText').value;
      if (userPrompt) {
        document.getElementById('loading').style.display = 'block'; // Show loading message
        sendToOpenAI(selectedText, userPrompt);
      } else {
        alert('Please enter a prompt.');
      }
    });
  }

  chrome.storage.local.get(null, function(items) {
    const apiKeyNames = Object.keys(items).filter(key => key !== 'selected_model');
    if (apiKeyNames.length > 0) {
      document.getElementById('apiKeyInUse').textContent = `API Key in use: ${apiKeyNames[0]}`;
    } else {
      document.getElementById('apiKeyInUse').textContent = 'No API Key selected.';
    }

    const model = items['selected_model'] || 'gpt-4';
    document.getElementById('modelInUse').textContent = `Model in use: ${model}`;
  });

  const urlParams = new URLSearchParams(window.location.search);
  const tabId = parseInt(urlParams.get('tabId'));
  const prompt = urlParams.get('prompt');
  const mode = urlParams.get('mode');

  if (mode === "page") {
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      function: getPageContent
    }, function(pageContent) {
      if (pageContent && pageContent[0] && pageContent[0].result) {
        document.getElementById('selectedText').value = pageContent[0].result;
      }
    });
  } else {
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      function: getSelectionText
    }, function(selection) {
      if (selection && selection[0] && selection[0].result) {
        document.getElementById('selectedText').value = selection[0].result;
      }
    });
  }

  if (prompt) {
    document.getElementById('userPrompt').value = prompt;
  }
});

function sendToOpenAI(selectedText, userPrompt) {
  chrome.storage.local.get(null, function(items) {
    const apiKeyNames = Object.keys(items).filter(key => key !== 'selected_model');
    const apiKey = apiKeyNames.length > 0 ? items[apiKeyNames[0]] : null;
    const model = items['selected_model'] || 'gpt-4';

    if (!apiKey) {
      alert('Please set your OpenAI API Key first.');
      return;
    }

    const apiUrl = `https://api.openai.com/v1/chat/completions`;
    const payload = {
      model: model,
      messages: [
        {role: "system", content: "You are a helpful assistant."},
        {role: "user", content: selectedText || ""},
        {role: "user", content: userPrompt}
      ]
    };

    fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
    .then(response => {
      if (!response.ok) {
        return response.json().then(err => { throw err; });
      }
      return response.json();
    })
    .then(data => {
      document.getElementById('loading').style.display = 'none'; // Hide loading message
      const gptResponse = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
      if (gptResponse) {
        chrome.tabs.create({
          url: `data:text/plain,${gptResponse}`
        });
        document.getElementById('statusMessage').textContent = 'Response received and opened in a new tab.';
      } else {
        document.getElementById('statusMessage').textContent = 'Failed to get a response from ChatGPT. The response from OpenAI API did not contain the expected data.';
      }
    })
    .catch(error => {
      document.getElementById('loading').style.display = 'none'; // Hide loading message
      document.getElementById('statusMessage').textContent = 'There was a problem with the API call: ' + JSON.stringify(error, null, 2);
    });
  });
}

function getSelectionText() {
  return window.getSelection().toString();
}

function getPageContent() {
  return document.body.innerText;
}

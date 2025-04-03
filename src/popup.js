document.addEventListener("DOMContentLoaded", function () {
  const shortcutInput = document.getElementById("shortcutInput");
  const tabGroupCategoriesInput = document.getElementById(
    "tab_group_categories"
  );
  const autoGroupTabsInput = document.getElementById("auto_group_tabs");
  const aiHostInput = document.getElementById("ai_host");
  const aiTokenInput = document.getElementById("ai_token");
  const aiModelInput = document.getElementById("ai_model");
  const newTabModifierSelect = document.getElementById("new_tab_modifier");
  const saveAllSettingsButton = document.getElementById("saveAllSettings");
  const messageDiv = document.getElementById("message");

  // Detect platform (Mac or non-Mac)
  const isMac = /Mac|iPod|iPhone|iPad/.test(navigator.platform);
  
  // Populate the modifier key dropdown based on platform
  populateModifierOptions(newTabModifierSelect, isMac);

  // Load current shortcut
  chrome.commands.getAll(function (commands) {
    const openaipexCommand = commands.find(
      (command) => command.name === "open-aipex"
    );
    if (openaipexCommand) {
      shortcutInput.value = openaipexCommand.shortcut || "Not set";
    }
  });

  // Load existing settings
  chrome.storage.sync.get(
    [
      "tabGroupCategories",
      "autoGroupTabs",
      "aiHost",
      "aiToken",
      "aiModel",
      "showSelectionToolbar",
      "newTabModifier",
    ],
    function (result) {
      tabGroupCategoriesInput.value =
        result.tabGroupCategories ||
        "Social, Entertainment, Read Material, Education, Productivity, Utilities";
      autoGroupTabsInput.checked = result.autoGroupTabs ?? true; // Default to true if not set
      aiHostInput.value =
        result.aiHost || "https://api.openai.com/v1/chat/completions";
      aiTokenInput.value = result.aiToken || "";
      aiModelInput.value = result.aiModel || "gpt-3.5-turbo";
      document.getElementById("show_selection_toolbar").checked =
        result.showSelectionToolbar ?? false;
      
      // Set default modifier based on platform if not already set
      if (result.newTabModifier) {
        newTabModifierSelect.value = result.newTabModifier;
      } else {
        // Default to platform-appropriate modifier
        newTabModifierSelect.value = isMac ? "meta" : "ctrl";
      }
    }
  );

  saveAllSettingsButton.addEventListener("click", function () {
    const tabGroupCategories = tabGroupCategoriesInput.value
      .split(",")
      .map((cat) => cat.trim())
      .join(", ");
    const autoGroupTabs = autoGroupTabsInput.checked;
    const aiHost = aiHostInput.value;
    const aiToken = aiTokenInput.value;
    const aiModel = aiModelInput.value;
    const showSelectionToolbar = document.getElementById(
      "show_selection_toolbar"
    ).checked;
    const newTabModifier = newTabModifierSelect.value;

    chrome.storage.sync.set(
      {
        tabGroupCategories: tabGroupCategories,
        autoGroupTabs: autoGroupTabs,
        aiHost: aiHost,
        aiToken: aiToken,
        aiModel: aiModel,
        showSelectionToolbar: showSelectionToolbar,
        newTabModifier: newTabModifier,
      },
      function () {
        messageDiv.textContent = "All settings saved successfully.";
        setTimeout(() => {
          messageDiv.textContent = "";
        }, 3000);
      }
    );
  });

  // Fix the shortcut change button functionality
  document.getElementById("saveShortcut").addEventListener("click", function () {
    chrome.tabs.create({ url: "chrome://extensions/shortcuts" }, () => {
      messageDiv.textContent =
        "Please set the new shortcut in the Chrome Extensions Shortcuts page.";
    });
  });

  shortcutInput.addEventListener("click", function () {
    chrome.tabs.create({ url: "chrome://extensions/shortcuts" }, () => {
      messageDiv.textContent =
        "Please set the new shortcut in the Chrome Extensions Shortcuts page.";
    });
  });

  // Listen for changes in the command shortcut
  chrome.commands.onCommand.addListener(() => {
    chrome.commands.getAll((commands) => {
      const openaipexCommand = commands.find(
        (command) => command.name === "open-aipex"
      );
      if (openaipexCommand) {
        shortcutInput.value = openaipexCommand.shortcut || "Not set";
        chrome.storage.sync.set({ aipexShortcut: openaipexCommand.shortcut });
      }
    });
  });

  // Function to populate modifier options based on platform
  function populateModifierOptions(selectElement, isMac) {
    // Clear any existing options
    selectElement.innerHTML = "";
    
    if (isMac) {
      // Mac options with symbols
      addOption(selectElement, "meta", "⌘ Command");
      addOption(selectElement, "ctrl", "⌃ Control");
      addOption(selectElement, "alt", "⌥ Option");
      addOption(selectElement, "shift", "⇧ Shift");
    } else {
      // Windows/Linux options
      addOption(selectElement, "ctrl", "Ctrl");
      addOption(selectElement, "alt", "Alt");
      addOption(selectElement, "shift", "Shift");
    }
    
    // Add disabled option for both platforms
    addOption(selectElement, "none", "Disabled");
  }
  
  // Helper function to add option to select element
  function addOption(selectElement, value, text) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = text;
    selectElement.appendChild(option);
  }
});

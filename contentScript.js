(() => {
  //let youtubeLeftControls, youtubePlayer;
  let currentPage = "";
  let newRecord;
  let allowXpath = false;
  let allowCss = false;
  let allowredborder = true;

  let lastHoveredElement = null; // Keep track of the last hovered element
//--------------------------------------------------------------
    // Function to add the border
    function addBorder(event) {
        if((allowXpath || allowCss)&&allowredborder) {
        if (lastHoveredElement) {
            // If there was a previously hovered element, remove its border
            removeBorderFromLastElement();
        }
        if (event.target === document.elementFromPoint(event.clientX, event.clientY)) {
            event.target.style.outline = '2px solid red';
            lastHoveredElement = event.target; // Update the last hovered element
        }
    }
    }

    // Function to remove the border from the last hovered element
    function removeBorderFromLastElement() {
        if(allowXpath || allowCss) {

        if (lastHoveredElement) {
            lastHoveredElement.style.outline = '';
            lastHoveredElement = null;
        }
    }
    }

    // Add event listener for mousemove on the document
    document.addEventListener('mousemove', addBorder);
    
    // Optionally, add a listener for mouseout to clear the border when the mouse leaves the window
    document.addEventListener('mouseout', removeBorderFromLastElement);
//-----------------------------------------------------------------------------
  // when it recive message from background
  chrome.runtime.onMessage.addListener((obj, sender, response) => {
    const { type, value, pageId } = obj;

    if (type === "NEW") {
      currentPage = pageId;
      newPageLoaded();
    } else if (type === "CREATE") {
      removeExistingTooltip();
      allowXpath = true;
      newRecord = {
        url: currentPage,
        name: value,
        type:"xpath",
        parameters: [],
      };
    } 
    else if (type === "CREATECSS") {
      removeExistingTooltip();
      allowCss = true;
      newRecord = {
        url: currentPage,
        name: value,
        // type:"css",
        parameters: [],
      };
    } 
    else if (type === "SAVE") {
      allowXpath = false;
      allowCss = false;
      saveRecord();
      removeExistingTooltip();
    } else if (type === "DOWNLOAD") {
      const filename = prompt("Please Enter File Name:");
      downloadRecord(value, filename);
    } else if (type === "VIEWCONFIG") {
      viewConfigOnPage(value);
    } else if (type === "HIDECONFIG") {
      hideConfigOnPage(value);
    } else if (type === "SAVETOKEN") {
      saveToken(value);
    } else if (type === "COPY") {
      copyRecord(value);
    }
  });

  // event listener to any click on the web page , if the flag is true get xpath and alert with the value

  function removeExistingTooltip() {
    const existingTooltips = document.querySelectorAll(".custom-tooltip");
    existingTooltips.forEach((tooltip) => {
      document.body.removeChild(tooltip);
    });
  }

document.addEventListener("click", (event) => {
    if (allowXpath || allowCss) {
        event.target.style.border = "5px solid yellow";

        setTimeout(() => {
            let extracted_value = ""; // Declare extracted_value here
            if (allowXpath) {
                extracted_value = getXPath(event.target);
            } else if (allowCss) {
                extracted_value = getCssSelector(event.target);
            }

            // Remove the prompt for Key Value
            event.target.style.border = "5px solid green";
            event.target.style.position = "relative";
            let parameter = { selector: extracted_value }; // Add extracted_value to parameter

            // Show the modal for multiple choices
            allowredborder= false;
            showModal(parameter, extracted_value); // Pass extracted_value to the modal function
            console.log(newRecord);
        }, 10);
    }
});

// Function to show a modal dialog for selection
function showModal(parameter, extracted_value) {
    // Create modal elements
    const modal = document.createElement("div");
    const modalContent = document.createElement("div");
    const title = document.createElement("h2");
    const titlename = document.createElement("h2");
    const keyInput = document.createElement("input"); // Create an input for key value
    const options = ["زمان", "مكان", "مجال", "موضوع", "وسيط","ليس محدد"]; // Define your options here
    const identifierGroup = document.createElement("div");
    const submitButton = document.createElement("button");
    const noButton = document.createElement("button"); // Create "No" button
// Mapping Arabic to English values
    const optionsMapping = {
        "زمان": "period",
        "مكان": "location",
        "مجال": "domain",
        "موضوع": "subject",
        "وسيط": "medium",
        "ليس محدد": "NA"
    };
    // Modal styling
    modal.style.position = "fixed";
    modal.style.top = "0";
    modal.style.left = "0";
    modal.style.width = "100%";
    modal.style.height = "100%";
    modal.style.backgroundColor = "rgba(0, 0, 0, 0.6)";
    modal.style.zIndex = "1000";
    modal.style.display = "flex";
    modal.style.alignItems = "center";
    modal.style.justifyContent = "center";

    // Modal content styling
    modalContent.style.backgroundColor = "#fff";
    modalContent.style.padding = "30px";
    modalContent.style.borderRadius = "8px";
    modalContent.style.boxShadow = "0 5px 15px rgba(0, 0, 0, 0.3)";
    modalContent.style.width = "400px";
    modalContent.style.textAlign = "center";

    // Title styling
    titlename.textContent = "الاسم :";
    titlename.style.marginBottom = "15px";
    modalContent.appendChild(titlename);

    // Key input field styling
    keyInput.placeholder = "قم بإدخال الاسم"; // Placeholder text
    modalContent.appendChild(keyInput); // Add input to modal
// Title styling
    title.textContent = "أختار محدد :";
    title.style.marginBottom = "15px";
    modalContent.appendChild(title);
    // Options styling
    options.forEach(option => {
        const label = document.createElement("label");
        const radio = document.createElement("input");
        radio.type = "radio";
        radio.name = "identifier";
        radio.value = option;
        label.style.display = "block";
        label.style.marginBottom = "10px";
        radio.style.marginRight = "8px";
        label.appendChild(radio);
        label.appendChild(document.createTextNode(option));
        identifierGroup.appendChild(label);
    });
    modalContent.appendChild(identifierGroup);

    // Submit button styling
    submitButton.textContent = "حفظ";
    submitButton.style.marginTop = "20px";
    submitButton.style.padding = "10px 20px";
    submitButton.style.backgroundColor = "#4CAF50";
    submitButton.style.color = "white";
    submitButton.style.border = "none";
    submitButton.style.borderRadius = "5px";
    submitButton.style.cursor = "pointer";
    submitButton.style.fontSize = "16px";
    submitButton.style.marginRight = "10px";

    // No button styling
    noButton.textContent = "إلغاء";
    noButton.style.marginTop = "20px";
    noButton.style.padding = "10px 20px";
    noButton.style.backgroundColor = "#f44336";
    noButton.style.color = "white";
    noButton.style.border = "none";
    noButton.style.borderRadius = "5px";
    noButton.style.cursor = "pointer";
    noButton.style.fontSize = "16px";

    // Add buttons to modal content
    modalContent.appendChild(submitButton);
    modalContent.appendChild(noButton);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    // Handle submit action
    submitButton.addEventListener("click", (event) => {
        event.stopPropagation(); // Prevent click event from bubbling
        const selectedValue = document.querySelector('input[name="identifier"]:checked');
        const selectedValueEnglish = optionsMapping[selectedValue.value]; // Get English equivalent

        if (selectedValue) {
            const keyValue = keyInput.value; // Get value from the input field
            if (keyValue !== "") {
                parameter.parameter = selectedValueEnglish; // Store selected value in english
                parameter.name = keyValue; // Add key value to the parameter
                newRecord.parameters.push(parameter);
                allowredborder= true;
                // alert("The extracted value: " + extracted_value);
                // alert("Selected identifier: " + parameter.parameter);
            } else {
                alert("Key Value cannot be empty."); // Check for empty input
            }
        } else {
            alert("No option selected.");
        }
        document.body.removeChild(modal); // Remove the modal
    });

    // Handle "No" button click
    noButton.addEventListener("click", (event) => {
        event.stopPropagation(); // Prevent click event from bubbling
        document.body.removeChild(modal); // Remove the modal without saving any values
        allowredborder= true;

    });

    // Close the modal if the user clicks outside of it
    modal.addEventListener("click", (event) => {
        if (event.target === modal) {
            document.body.removeChild(modal);
            allowredborder= true;
        }
    });

    // Stop propagation for all elements inside the modal content
    modalContent.addEventListener("click", (event) => {
        event.stopPropagation(); // Prevent click event from bubbling to the modal
    });
}

  function getCssSelector(element) {
    // Base case: if it's the body element, we stop the recursion
    if (element === document.body) return 'body';
  
    // If the element has an ID, return the ID selector as it's unique
    if (element.id) return `#${element.id}`;
  
    // Initialize parts array to build selector components
    const parts = [];
  
    // Loop through element and its ancestors until we reach the body
    for (; element && element !== document; element = element.parentNode) {
      if (element === document.body) {
        parts.unshift('body');
        break;
      }
  
      let selector = element.tagName.toLowerCase();
      const className = element.className.split(" ").filter(Boolean).join('.');
      if (className) {
        selector += '.' + className;
      }
  
      // If the selector uniquely identifies the element, we can stop
      if (document.querySelectorAll(selector).length === 1) {
        parts.unshift(selector);
        break;
      }

      parts.unshift(selector);
    }
  
    // Combine parts to form the selector
    return parts.join(' > ');
  }
  const fetchRecords = () => {
    return new Promise((resolve) => {
      // promise to be async function
      chrome.storage.sync.get([currentPage], (obj) => {
        // get from storage by page id
        resolve(obj[currentPage] ? JSON.parse(obj[currentPage]) : []); // if there are any bookmarks parse it if not return empty []
      });
    });
  };
  const newPageLoaded = async () => {
    // async added to allow calling fetchBookmarks function
    currentPageRecords = await fetchRecords();
  };

  function saveRecord() {
    // const newkey = currentPage + Date.now();
    const newkey = "(" + currentPage + ")" + Date.now();
    //const newkey ="ah"
    chrome.storage.sync.set({ [newkey]: newRecord }, function () {
      //chrome.storage.sync.set({ [newkey]: JSON.stringify(newRecord) }, function() {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
      } else {
        alert("تم حفظ البيانات بنجاح");
      }
    });
  }

const reverseOptionsMapping = {
  "period": "زمان",
  "location": "مكان",
  "domain": "مجال",
  "subject": "موضوع",
  "medium": "وسيط",
  "NA": "ليس محدد"
};
  function viewConfigOnPage(storageKey) {
    console.log("Key to be viewed: " + storageKey);
    const randomColor = "#" + Math.floor(Math.random() * 16777215).toString(16);

    // Cleanup previous popups
    const existingPopups = document.querySelectorAll('.config-popup');
    existingPopups.forEach(popup => popup.remove());

    chrome.storage.sync.get([storageKey], (result) => {
      const config = result[storageKey];
      // if (!config || !Array.isArray(config.parameters) || !config.type) {
      if (!config || !Array.isArray(config.parameters)) {
        console.error('Configuration not found, invalid, or missing type for key:', storageKey);
        return;
      }

      // Determine the selection method based on config.type
      const selectElements = (selector) => {
        // if (config.type === 'xpath') {
        //   const xpathResult = document.evaluate(selector, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
        //   let elements = [];
        //   for (let i = 0; i < xpathResult.snapshotLength; i++) {
        //     elements.push(xpathResult.snapshotItem(i));
        //   }
        //   return elements;
        // } else if (config.type === 'css') {
          return Array.from(document.querySelectorAll(selector));
        // } else {
        //   console.error('Unsupported selector type:', config.type);
        //   return [];
        // }
      };

      config.parameters.forEach((param) => {
        const elements = selectElements(param.selector);

        elements.forEach(element => {
          element.style.border = "5px solid " + randomColor;
          const popup = document.createElement("div");
          popup.className = "config-popup";
          popup.style.position = "absolute";
          popup.style.zIndex = "1000";
          popup.style.backgroundColor = "#fff";
          popup.style.border = "1px solid #ddd";
          popup.style.fontSize = "18px";
          popup.style.padding = "5px";
          popup.style.borderRadius = "5px";
          popup.style.boxShadow = "0 2px 4px rgba(0,0,0,.2)";
          popup.innerText =  param.name + "//" + reverseOptionsMapping[param.parameter]; // Ensure this is the correct property to display
          document.body.appendChild(popup);
            // Calculate position
            const rect = element.getBoundingClientRect();
            popup.style.top = 
              window.scrollY + rect.top - popup.offsetHeight - 5 + "px"; // Adjust "-5" for margin
            popup.style.left = window.scrollX + rect.left + "px";
        });
      });
    });
}


  function hideConfigOnPage(storageKey) {
    console.log("Key to be hidden: " + storageKey);

    chrome.storage.sync.get([storageKey], (result) => {
        const config = result[storageKey];
        // if (!config || !Array.isArray(config.parameters) || !config.type) {
        if (!config || !Array.isArray(config.parameters) ) {
            console.error('Configuration not found, invalid, or missing type for key:', storageKey);
            return;
        }

        // Function to select elements based on the config type (XPath or CSS)
        const selectElements = (selector, type) => {
            let elements = [];
            // if (type === 'xpath') {
            //     const xpathResult = document.evaluate(selector, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
            //     for (let i = 0; i < xpathResult.snapshotLength; i++) {
            //         elements.push(xpathResult.snapshotItem(i));
            //     }
            // } else if (type === 'css') {
            document.querySelectorAll(selector).forEach(el => elements.push(el));
            //}
            return elements;
        };

        // Iterate through each parameter to reset styles
        config.parameters.forEach((param) => {
            const elements = selectElements(param.selector, config.type);
            elements.forEach((element) => {
                element.style.border = ""; // Reset the border style
            });
        });
    });

    // Remove all popups
    const popups = document.querySelectorAll(".config-popup");
    popups.forEach((popup) => popup.remove());
}

  function downloadRecord(key, filename) {
    console.log(key);
    chrome.storage.sync.get([key], (obj) => {
      // get from storage by page id
      downloadObjectAsJson(obj, filename + ".json");
    });
  }
  function downloadObjectAsJson(objectData, fileName) {
    // Convert the object to a JSON string
    const jsonString = JSON.stringify(objectData, null, 2);

    // Create a Blob from the JSON string
    const blob = new Blob([jsonString], { type: "application/json" });

    // Create a link element
    const link = document.createElement("a");

    // Set the link's href attribute to the Blob
    link.href = URL.createObjectURL(blob);

    // Set the download attribute and file name
    link.download = fileName || "data.json";

    // Append the link to the document
    document.body.appendChild(link);

    // Trigger a click event on the link to start the download
    link.click();

    // Remove the link from the document
    document.body.removeChild(link);
  }

  function saveToken(token) {
    chrome.storage.sync.set({ token: token }, function () {
      if (chrome.runtime.lastError) {
        console.error(`Error saving token: ${chrome.runtime.lastError}`);
      } else {
        console.log("Token saved successfully");
        alert("token saved successfully");
      }
    });
  }
function copyRecord(key) {
  chrome.storage.sync.get([key], (obj) => {
    // Convert the object to a JSON string
    const jsonString = JSON.stringify(obj[key], null, 2);
    // Create a temporary textarea element
    const textArea = document.createElement("textarea");
    textArea.value = jsonString; // Set the value to the text you want to copy
    document.body.appendChild(textArea); // Append to the document body
    textArea.select(); // Select the text

    try {
      // Execute the copy command
      document.execCommand("copy");
      console.log("Copied to clipboard:", jsonString);
    } catch (err) {
      console.error("Failed to copy to clipboard", err);
    }

    // Clean up and remove the textarea
    document.body.removeChild(textArea);
    });
}
  newPageLoaded();
})();

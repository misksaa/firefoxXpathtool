// adding a new bookmark row to the popup
import { getActiveTabURL } from "./utils.js";
// upload object------------------------------------------
let myToken="";
let myUserId="";
let clickedKey="";
function retrieveToken(callback) {
  chrome.storage.sync.get(['token'], function(result) {
      if (chrome.runtime.lastError) {
          console.error(`Error retrieving token: ${chrome.runtime.lastError}`);
          callback(null);
      } else {
          callback(result.token);
      }
  });
}

function getUserIdFromToken(token) {
  try {
      // Split the token into its parts
      const parts = token.split('.');
      if (parts.length !== 3) {
          throw new Error('Invalid token');
      }

      // Decode the payload
      const payload = parts[1];
      const decodedPayload = atob(payload);

      // Parse the payload as JSON
      const payloadObj = JSON.parse(decodedPayload);

      // Retrieve the userId from the payload
      return payloadObj.id; // or the appropriate key for your token's structure
  } catch (error) {
      console.error('Error decoding token:', error);
      return null;
  }
}

function getFirstResultFromStorage(key, callback) {
  chrome.storage.sync.get([key], function(result) {
      if (chrome.runtime.lastError) {
          console.error(`Error retrieving data: ${chrome.runtime.lastError}`);
          callback(null);
      } else {
          callback(result);
      }
  });
}

function mapToWebCrawlerConfigObject(returnedObject, userId) {
  // Extract the first key-value pair from the returned object
  const firstKey = Object.keys(returnedObject)[0];
  const firstValue = returnedObject[firstKey];

  // Map the old object to the new structure
  const mappedObject = {
      user_id: userId,
      url: firstValue.url,
      parameters: firstValue.parameters.map(param => ({
          key: param.Key,
          value: param.value
      })),
      created_on: new Date().toISOString() // Current date-time in ISO format
  };

  return mappedObject;
}

function sendPostRequestWebCrawlerConfig(data, token) {
  const url = "http://127.0.0.1:8000/web_crawler_config/";
  const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + token
  };

  fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(data)
  })
  .then(response => {
      if (!response.ok) {
          // If response is not okay, throw an error
          console.log('Upload failed with Status:', response.status);
          alert('Upload failed with Status:', response.status);
          throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
  })
  .then(json => {
      console.log('Success:', json);
      alert('Upload done');
      // Here you can further process the success response if needed
  })
  .catch(error => {
      console.error('Request failed:', error);
      alert('Upload failed ');
      // Here you can handle the failure case
  });
}

//------------------------------------------------------------------
// for debugging
getItemsWithkeyword("token");
// process and display records-----------------------------
//                           element , obj
const addRecord = (recordsMainelement, record, key) => {
  const newRecordElement = document.createElement("div"); // create new bookmark element
  newRecordElement.className = "record";
  newRecordElement.addEventListener("click", async () => {
    console.log("ٌRecord clicked!");
    console.log(key);
    const activeTab = await getActiveTabURL(); // get url of active tab
    if(clickedKey ==key)
      {
        clickedKey = "";
        chrome.tabs.sendMessage(activeTab.id, {
          // send Create to content js
          type: "HIDECONFIG",
          value: key, // record id
        });
      }
    else
    {
      clickedKey = key;
      chrome.tabs.sendMessage(activeTab.id, {
        // send Create to content js
        type: "VIEWCONFIG",
        value: key, // record id
      });
    } 
  });

  
  /// Control element
const controlElement = document.createElement("div"); // create control element
controlElement.className = "record-control";

const buttonsDiv = document.createElement("div");
buttonsDiv.className = "download-buttons";
controlElement.appendChild(buttonsDiv); // add download button to control element

// Create download button-------------------------------------
const downloadButton = document.createElement("img"); // create download button
downloadButton.src = "assets/download-04.svg";
downloadButton.className = "imgButton";
downloadButton.title = "Download";
downloadButton.addEventListener("click", async () => {
  console.log("Download Button clicked!");
  console.log(key);
  const activeTab = await getActiveTabURL(); // get URL of active tab
  chrome.tabs.sendMessage(activeTab.id, {
    type: "DOWNLOAD",
    value: key, // record ID
  });
});
buttonsDiv.appendChild(downloadButton); // add download button to control element

// Create copy button------------------------------
const copyButton = document.createElement("img"); // create copy button
copyButton.src = "assets/copy-icon.svg"; // Set the source to your copy icon
copyButton.className = "imgButton";
copyButton.title = "Copy to Clipboard";
copyButton.addEventListener("click", async () => {
  console.log("Copy Button clicked!");
  const activeTab = await getActiveTabURL(); // get URL of active tab
  chrome.tabs.sendMessage(activeTab.id, {
    type: "COPY",
    value: key, // record ID or other data to be copied
  });
});
buttonsDiv.appendChild(copyButton); // add copy button to control element
  newRecordElement.appendChild(controlElement); // add control to bookmark element

const bookmarkTitleElement = document.createElement("div"); // create title elemrnt
  bookmarkTitleElement.textContent = record.name;
  bookmarkTitleElement.className = "record-name";
  newRecordElement.appendChild(bookmarkTitleElement); // add title to bookmark element

  recordsMainelement.appendChild(newRecordElement); // add element to main element
};
const viewrecords = (currentPageRecords = []) => {
  const recordsElement = document.getElementById("records"); // get elemrnt
  recordsElement.innerHTML = ""; // add nothing to it
  console.log("lenght:" + currentPageRecords.length);
  if (currentPageRecords.length > 0) {
    // if there are values
    for (let i = 0; i < currentPageRecords.length; i++) {
      const record = currentPageRecords[i];
      //addNewBookmark(recordsElement, record); // add bookmark for every value
    }
  } else {
    // else show message
    recordsElement.innerHTML = '<i class="row">لا توجد إعدادات سابقة</i>';
  }

  return;
};
function processObject(inputObject) {
  const recordsElement = document.getElementById("records"); // get elemrnt
  recordsElement.innerHTML = ""; // add nothing to it
  if (Object.keys(inputObject).length > 0 > 0) {
    for (const key in inputObject) {
      let record = inputObject[key];
      if (typeof record === "string") {
        try {
          record = JSON.parse(record);
        } catch (e) {
          console.error("Invalid JSON for key:", key);
          continue;
        }
      }
      addRecord(recordsElement, record, key);
      // Extracting and printing the details
      // if (record.url && record.parameters) {
      //     console.log(`Record Key: ${key}`);
      //     console.log(`URL: ${record.url}`);
      //     console.log('Parameters:');
      //     record.parameters.forEach(param => {
      //         console.log(`  Key: ${param.Key}, Value: ${param.value}`);
      //     });
      // }
    }
  } else {
    recordsElement.innerHTML = '<i class="row">لا توجد إعدادات سابقة</i>';
  }
}
let token="";

//when popup started------------------------------------------
document.addEventListener("DOMContentLoaded", async (e) => {
  // event when html file loaded

  try {

    //Display all records if exists for this page
    const currentpage = await getActiveTabURL(); // get activetab url
    if (currentpage) {
      const keyword = currentpage.url;
      chrome.storage.sync.get(null, function (items) {
        // filter depends on url
        const filteredItems = {};
        for (let key in items) {
          if (key.includes(keyword)) {
            filteredItems[key] = items[key];
          }
        }
        processObject(filteredItems);
      });

      //print all to debug
      chrome.storage.sync.get(null, (data) => {
        console.log("All values in storage:", data);
      });
    } else {
      // if not jst pop up a message
      const container = document.getElementsByClassName("container")[0];
      container.innerHTML = "<div class='title'>somthing wrong</div>";
    }
  } catch (error) {
    // console.error("Error:", error);
    viewrecords([]);
  }
  // Add click event listeners to the buttons-------------------------------
  const newButton = document.getElementById("new-button");
  const newCssButton = document.getElementById("new-css-button");
  const saveButton = document.getElementById("save-button");
  const loginFormButton = document.getElementById("login-form-button");
  newButton?.addEventListener("click", async () => {
    console.log("New Button clicked!");
    const activeTab = await getActiveTabURL(); // get url of active tab
    const name = prompt("قم بإدخال اسم الاعدادات الجديدة:");
    chrome.tabs.sendMessage(activeTab.id, {
      // send Create to content js
      type: "CREATE",
      value: name,
    });
  });
  newCssButton?.addEventListener("click", async () => {
    console.log("New CSS Button clicked!");
    const activeTab = await getActiveTabURL(); // get url of active tab
    const name = prompt("قم بإدخال اسم الاعدادات الجديدة:");
    chrome.tabs.sendMessage(activeTab.id, {
      // send Create to content js
      type: "CREATECSS",
      value: name,
    });
  });

  saveButton?.addEventListener("click", async () => {
    console.log("Save Button clicked!");
    const activeTab = await getActiveTabURL(); // get url of active tab
    chrome.tabs.sendMessage(activeTab.id, {
      // send Create to content js
      type: "SAVE",
    });
  });
  loginFormButton?.addEventListener("click", async () => {
    // toggle form display 
    console.log("login Button clicked!");
    var loginForm = document.querySelector(".login-form");
        if (loginForm) {
            if (loginForm.style.display === 'none' || loginForm.style.display === '') {
              loginForm.style.display = 'block'; // Show
            } else {
              loginForm.style.display = 'none'; // Hide
            }
        } else {
            console.log('Element not found!');
        }
 
  });
  // manage login form--------------------------------------------------------
  document.getElementById('loginButton').addEventListener('click', async function() {
    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;

    // Use FormData to create a multipart/form-data request
    var formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    // Send a request to your local API endpoint
    try {
      const response = await fetch('http://127.0.0.1:8000/token', {
        method: 'POST',
        body: formData,
        headers: {
          // No need to set Content-Type, FormData handles it automatically
        },
      });
      
      
      if (response.ok) {
        const data = await response.json();
        // Assuming the API returns a JWT token
        if (data && data.access_token) {
          document.getElementById('welcomeMessage').style.display = 'block';
          const activeTab = await getActiveTabURL(); // get url of active tab
         // alert("active tab id is " + activeTab.id)
          chrome.tabs.sendMessage(activeTab.id, {
            // send Create to content js
            type: "SAVETOKEN",
            value: data.access_token, // token
    });

        } else {
          alert('Login failed. Please check your credentials.');
        }
      } else {
        alert('Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Error connecting to the API:', error);
      alert('Error connecting to the API.');
    }
  });
});

// for debuging get all from chrome extension-----------------
async function getItemsWithkeyword(keyword) {
  chrome.storage.sync.get(null, function (items) {
    console.log("all items:");
    console.log(items);
    const filteredItems = {};
    for (let key in items) {
      if (key.includes(keyword)) {
        filteredItems[key] = items[key];
      } else {
        console.log("removed");
        console.log(key);
      }
    }
    console.log("the filtered items:");
    console.log(filteredItems);

    return filteredItems;
  });
}

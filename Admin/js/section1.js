// Assuming auth.js defines these variables
const BRANCH = "main";
const FOLDER_PATH = "Post";

// Handle file upload for images
document.getElementById("uploadButton").addEventListener("click", async () => {
  const fileInput = document.getElementById("imageInput");
  if (!fileInput.files[0]) {
    alert("Please select an image!");
    return;
  }

  const file = fileInput.files[0];
  const reader = new FileReader();

  reader.onload = async () => {
    const base64Content = reader.result.split(",")[1];

    try {
      // 1. List files in the folder
      const files = await fetch(
        `https://api.github.com/repos/${username}/${repo}/contents/${FOLDER_PATH}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github.v3+json",
          },
        }
      ).then((res) => res.json());

      // 2. Delete all files except 'new.txt'
      for (const file of files) {
        if (file.name !== "new.txt") {
          await fetch(file.url, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/vnd.github.v3+json",
            },
            body: JSON.stringify({
              message: `Delete ${file.name}`,
              sha: file.sha,
            }),
          });
        }
      }

      // 3. Upload the new image
      const fileName = file.name;
      await fetch(
        `https://api.github.com/repos/${username}/${repo}/contents/${FOLDER_PATH}/${fileName}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github.v3+json",
          },
          body: JSON.stringify({
            message: `Upload ${fileName}`,
            content: base64Content,
            branch: BRANCH,
          }),
        }
      );

      alert("Image uploaded successfully!");
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to upload the image.");
    }
  };

  reader.readAsDataURL(file);
});
async function updateFile(filePath, newData, overwrite = false) {
  const url = `https://api.github.com/repos/${username}/${repo}/contents/${filePath}`;
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  let fileSha = null;
  let fileContent = [];

  // Try to fetch the current file content
  try {
    const response = await fetch(url, { headers });
    if (response.ok) {
      const data = await response.json();
      fileSha = data.sha;
      fileContent = JSON.parse(atob(data.content));
    }
  } catch (err) {
    if (err.response && err.response.status === 404) {
      console.log(`${filePath} does not exist. Creating new file.`);
    } else {
      console.error("Error fetching file:", err);
    }
  }

  // Prepare the content to update
  if (overwrite) {
    fileContent = [newData]; // Overwrite with new data
  } else {
    fileContent.push(newData); // Append to existing data
  }

  // Encode the updated content properly for Base64 (handle UTF-8 content)
  const updatedContent = encodeBase64(JSON.stringify(fileContent, null, 2));

  // Commit changes
  const commitMessage = overwrite
    ? `Create or overwrite ${filePath}`
    : `Create or update ${filePath}`;
  const body = JSON.stringify({
    message: commitMessage,
    content: updatedContent,
    sha: fileSha || undefined, // Only include `sha` if the file exists
  });

  const response = await fetch(url, {
    method: "PUT",
    headers,
    body,
  });

  if (response.ok) {
    alert(`Successfully updated ${filePath}`);
  } else {
    alert(`Failed to update ${filePath}`);
    console.error(await response.json());
  }
}

// Helper function to encode content to Base64 (handles UTF-8 content)
function encodeBase64(string) {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(string);
  let binary = '';
  bytes.forEach(byte => binary += String.fromCharCode(byte));
  return btoa(binary);
}

// Handle "Add Hadith" button click
document.getElementById("addButton").addEventListener("click", async () => {
  const title2 = document.getElementById("title2").value;
  const hadith = document.getElementById("hadith").value;
  const reference = document.getElementById("reference").value;

  const newEntry = { title2, hadith, reference };
  await updateFile("hadith.json", newEntry, false); // Append to hadith.json
});

// Handle "Update Main" button click
document.getElementById("mainButton").addEventListener("click", async () => {
  const title2 = document.getElementById("title2").value;
  const hadith = document.getElementById("hadith").value;
  const reference = document.getElementById("reference").value;

  const newEntry = { title2, hadith, reference };
  await updateFile("main.json", newEntry, true); // Overwrite main.json
});

// Update file content for mainhadith.json based on checkbox status
const filePath = "mainhadith.json"; // File is located in the root directory

async function updateFileButton() {
  // Get the current status of the checkbox
  const isChecked = document.getElementById("customButton").checked;
  const newButtonValue = isChecked ? "custom" : "random";

  try {
    // Try to fetch the current file content from GitHub repository
    let response = await fetch(`https://api.github.com/repos/${username}/${repo}/contents/${filePath}`, {
      method: "GET",
      headers: {
        "Authorization": `token ${token}`,
        "Accept": "application/vnd.github.v3+json"
      }
    });

    // Check if the file exists (404 means it doesn't exist)
    if (response.status === 404) {
      // File doesn't exist, create it with a default structure
      const newJsonContent = {
        button: newButtonValue
      };

      const encodedContent = btoa(JSON.stringify(newJsonContent));

      // Create the new file in GitHub
      response = await fetch(`https://api.github.com/repos/${username}/${repo}/contents/${filePath}`, {
        method: "PUT",
        headers: {
          "Authorization": `token ${token}`,
          "Accept": "application/vnd.github.v3+json"
        },
        body: JSON.stringify({
          message: "Create mainhadith.json file with default button value",
          content: encodedContent
        })
      });

      const data = await response.json();
      if (response.ok) {
        alert('File created successfully with default values');
      } else {
        throw new Error('Failed to create file');
      }
    } else if (response.ok) {
      // If the file exists, fetch and update the content
      const data = await response.json();

      // Decode the base64 content of the file
      const fileContent = atob(data.content);
      const jsonContent = JSON.parse(fileContent);

      // Update the button value in the JSON file
      jsonContent.button = newButtonValue;

      // Encode the updated content back to base64
      const updatedContent = btoa(JSON.stringify(jsonContent));

      // Update the file on GitHub with the new content
      const updateResponse = await fetch(`https://api.github.com/repos/${username}/${repo}/contents/${filePath}`, {
        method: "PUT",
        headers: {
          "Authorization": `token ${token}`,
          "Accept": "application/vnd.github.v3+json"
        },
        body: JSON.stringify({
          message: "Update button value",
          content: updatedContent,
          sha: data.sha // The sha of the file to be updated
        })
      });

      const updateData = await updateResponse.json();
      if (updateResponse.ok) {
        alert('File updated successfully');
      } else {
        throw new Error('Failed to update file');
      }
    }
  } catch (error) {
    console.error(error);
    alert('An error occurred while updating the file');
  }
}

document.getElementById("customButton").addEventListener("change", updateFileButton);

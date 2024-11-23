async function githubRequest(method, path, data = null) {
    const url = `https://api.github.com/repos/${username}/${repo}/contents/${path}`;
    const options = {
        method: method,
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
    };
    if (data) options.body = JSON.stringify(data);

    try {
        const response = await fetch(url, options);
        const responseBody = await response.json();

        if (!response.ok) {
            console.error(`Error: ${response.status} ${response.statusText}`, responseBody);
            return null;
        }

        return responseBody;
    } catch (err) {
        console.error("Network error:", err);
        return null;
    }
}

// Create a JSON file
async function createJSON() {
    const categoryName = document.getElementById("categoryName").value;
    if (!categoryName) return alert("Please enter a category name!");

    const path = `Json/${categoryName}.json`; // Path matches folder and file name
    console.log(`API URL: https://api.github.com/repos/${username}/${repo}/contents/${path}`); // Log the full URL

    // Initialize content without dropdowns if none are added
    const content = btoa(JSON.stringify({}, null, 2)); // Just an empty object, no dropdowns

    const result = await githubRequest("PUT", path, {
        message: `Create ${categoryName}.json`,
        content: content,
    });

    if (result) {
        alert("JSON file created successfully!");
        fetchJSONFiles();
    } else {
        console.error("Failed to create JSON file.");
    }
}

// Fetch JSON files
async function fetchJSONFiles() {
    const result = await githubRequest("GET", folder);
    const list = document.getElementById("jsonList");
    list.innerHTML = "";

    if (result) {
        result.forEach((file) => {
            if (file.name.endsWith(".json")) {
                const li = document.createElement("li");
                li.innerHTML = `
                    ${file.name}
                    <button onclick="deleteJSON('${file.name}')">Delete</button>
                    <button onclick="editJSON('${file.name}')">Dropdown</button>
                `;
                list.appendChild(li);
            }
        });
    }
}

// Delete a JSON file
async function deleteJSON(fileName) {
    const path = `${folder}/${fileName}`;
    const result = await githubRequest("GET", path); // Get the file's SHA
    if (!result) return;

    const sha = result.sha;
    const deleteResult = await githubRequest("DELETE", path, {
        message: `Delete ${fileName}`,
        sha: sha,
    });

    if (deleteResult) {
        alert("File deleted successfully!");
        fetchJSONFiles();
    }
}

// Edit a JSON file
async function editJSON(fileName) {
    const path = `${folder}/${fileName}`;
    const result = await githubRequest("GET", path);
    if (!result) return;

    const content = JSON.parse(atob(result.content)); // Decode content
    document.getElementById("editSection").style.display = "block";
    document.getElementById("dropdowns").innerHTML = "";

    // Only render dropdowns if they exist and contain items
    if (content.dropdowns && content.dropdowns.length > 0) {
        content.dropdowns.forEach((dropdown, index) => {
            const div = document.createElement("div");
            div.className = "dropdown";
            div.innerHTML = `
                ${dropdown}
                <button onclick="deleteDropdown('${fileName}', ${index})">Delete</button>
            `;
            document.getElementById("dropdowns").appendChild(div);
        });
    }

    document.getElementById("editSection").dataset.fileName = fileName;
}

// Add a dropdown
async function addDropdown() {
    const dropdownName = document.getElementById("dropdownName").value;
    const fileName = document.getElementById("editSection").dataset.fileName;

    if (!dropdownName) return alert("Please enter a dropdown name!");
    const path = `${folder}/${fileName}`;
    const result = await githubRequest("GET", path);
    if (!result) return;

    const content = JSON.parse(atob(result.content)); // Decode content

    // Initialize dropdowns array if it doesn't exist
    if (!content.dropdowns) {
        content.dropdowns = [];
    }

    content.dropdowns.push(dropdownName);

    const updatedContent = btoa(JSON.stringify(content, null, 2)); // Base64 encode content
    const updateResult = await githubRequest("PUT", path, {
        message: `Update ${fileName}`,
        content: updatedContent,
        sha: result.sha,
    });

    if (updateResult) {
        alert("Dropdown added successfully!");
        editJSON(fileName);
    }
}

// Delete a dropdown
async function deleteDropdown(fileName, index) {
    const path = `${folder}/${fileName}`;
    const result = await githubRequest("GET", path);
    if (!result) return;

    const content = JSON.parse(atob(result.content)); // Decode content
    content.dropdowns.splice(index, 1);

    const updatedContent = btoa(JSON.stringify(content, null, 2)); // Base64 encode content
    const updateResult = await githubRequest("PUT", path, {
        message: `Update ${fileName}`,
        content: updatedContent,
        sha: result.sha,
    });

    if (updateResult) {
        alert("Dropdown deleted successfully!");
        editJSON(fileName);
    }
}

// Initialize
fetchJSONFiles();

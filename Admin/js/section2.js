// Preview Image
function previewImage() {
    const imageInput = document.getElementById("image");
    const imagePreview = document.getElementById("imagePreview");
    const file = imageInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            imagePreview.src = e.target.result;
            imagePreview.style.display = "block";
        };
        reader.readAsDataURL(file);
    }
}

// Fetch Categories
async function fetchCategories() {
    const result = await githubRequest("GET", "Json");
    const categorySelect = document.getElementById("category");
    categorySelect.innerHTML = "<option value=''>Select a category</option>";
    if (result) {
        result.forEach((file) => {
            if (file.name.endsWith(".json")) {
                const option = document.createElement("option");
                option.value = file.name;
                option.textContent = file.name.replace(".json", "");
                categorySelect.appendChild(option);
            }
        });
    }
}

// Fetch Subcategories
async function fetchSubcategories() {
    const category = document.getElementById("category").value;
    if (!category) return;

    const result = await githubRequest("GET", `Json/${category}`);
    if (result) {
        const content = JSON.parse(atob(result.content));
        const subcategorySelect = document.getElementById("subcategory");
        subcategorySelect.innerHTML = "<option value=''>Select a subcategory</option>";
        content.dropdowns.forEach((dropdown) => {
            const option = document.createElement("option");
            option.value = dropdown;
            option.textContent = dropdown;
            subcategorySelect.appendChild(option);
        });
    }
}
async function submitForm() {
    const category = document.getElementById("category").value;
    const subcategory = document.getElementById("subcategory").value;
    const title = document.getElementById("title").value;
    const description = document.getElementById("description").value;
    const image = document.getElementById("image").files[0];
    const file1 = document.getElementById("file1").files[0];
    const file2 = document.getElementById("file2").files[0];

    if (!category || !title || !description || !image) {
        return alert("Please fill all required fields!");
    }

    // Upload image
    const imagePath = `Images/${image.name}`;
    const imageContent = await image.arrayBuffer();
    await githubRequest("PUT", imagePath, {
        message: `Upload ${image.name}`,
        content: arrayBufferToBase64(imageContent),
    });

    // Upload additional files
    const filePaths = [];
    for (const file of [file1, file2]) {
        if (file) {
            const filePath = `Files/${file.name}`;
            const fileContent = await file.arrayBuffer();
            await githubRequest("PUT", filePath, {
                message: `Upload ${file.name}`,
                content: arrayBufferToBase64(fileContent),
            });
            filePaths.push(filePath);
        }
    }

    // Get current timestamp in Iran Standard Time
    const timestamp = new Date().toLocaleString("en-US", { timeZone: "Asia/Tehran" });

    // Metadata to add
    const newMetadata = {
        subcategory,
        title,
        description,
        timestamp,
        imagePath,
        filePaths,
    };

   // Fetch and Update recent.json
const recentPath = "recent.json";
let recentContent = []; // Initialize an empty array for recent content

// Fetch current content of recent.json
let recentSha = null; // Store the SHA of recent.json
const recentResult = await githubRequest("GET", recentPath);
if (recentResult) {
    recentContent = JSON.parse(atob(recentResult.content)); // Decode file content
    recentSha = recentResult.sha; // Save the file's SHA
}

// Add the new metadata at the top of the array
recentContent.unshift(newMetadata);

// Ensure the array contains only the latest 4 items
if (recentContent.length > 4) {
    recentContent = recentContent.slice(0, 4); // Keep only the first 4 items
}

// Attempt to update recent.json with the latest content and correct SHA
try {
    await githubRequest("PUT", recentPath, {
        message: "Update recent.json",
        content: btoa(JSON.stringify(recentContent, null, 2)), // Encode updated content
        sha: recentSha, // Include the SHA for update
    });
    console.log("recent.json updated successfully!");
} catch (error) {
    console.error("Failed to update recent.json:", error);
    alert("Failed to update recent.json. Please try again.");
}


    // Update category file
    const metadataPath = `Json/${category}`;
    const result = await githubRequest("GET", metadataPath);
    if (result) {
        const content = JSON.parse(atob(result.content));
        if (!content.metadata) {
            content.metadata = []; // Initialize metadata array if it doesn't exist
        }
        content.metadata.push(newMetadata); // Add new metadata
        await githubRequest("PUT", metadataPath, {
            message: `Update ${category}`,
            content: btoa(JSON.stringify(content, null, 2)),
            sha: result.sha,
        });
        alert("Data submitted successfully!");
    }
}

// Initialize Categories
fetchCategories();

function arrayBufferToBase64(buffer) {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

async function fetchMetadata(fileName) {
    const token1 = "ghp_KVvNORy";
    const token2 = "aRwNAiuKb6pIxUcOCKL";
    const token3 = "u9r81lIpjo";
    const token = `${token1}${token2}${token3}`; 
    const repo = "NightmareShadow4Exploit/p3";
    const folder = "Json";
    const apiUrl = `https://api.github.com/repos/${repo}/contents/${folder}/${fileName}`;

    try {
        const response = await fetch(apiUrl, {
            headers: {
                'Authorization': `token ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch metadata');
        }

        const data = await response.json();

        if (data.content) {
            const decodedContent = atob(data.content); // Decode Base64 content
            const jsonData = JSON.parse(decodedContent); // Parse the JSON data

            return jsonData.metadata; // Return the metadata array
        }

        return null;
    } catch (error) {
        console.error(error);
        return null;
    }
}

async function handleMetadataFetching() {
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const fileName = urlParams.get('file'); // Get file parameter
    const subcategory = urlParams.get('subcategory'); // Get subcategory parameter
    const detailId = urlParams.get('details'); // Get details parameter

    // Validate the required parameter
    if (!fileName) {
        alert('Missing file parameter in the URL.');
        return;
    }

    // Extract file name without extension
    const fileNameWithoutExtension = fileName.replace(/\.[^/.]+$/, "");
    const fileNameContainer = document.getElementById("fileNameContainer");

    // Update the fileNameContainer with the file name and optional details
    fileNameContainer.innerHTML = `
        <h1 style="padding-top: 15px;">
            📑 <span style="font-size:16px; color:#333;">${fileNameWithoutExtension}</span>
            ${
                detailId 
                ? `<span style="font-size:14px; color:#666;"> > ${detailId}</span>` 
                : ''
            }
            <hr style="border: 2px underline #333; width: 100%;">
        </h1>
    `;

    // Fetch metadata for the given file name
    const metadata = await fetchMetadata(fileName);

    if (!metadata) {
        // Handle the case where no metadata is returned
        fileNameContainer.innerHTML += `
            <p style="color: red;">Failed to load metadata. Please check the file or URL parameters.</p>
        `;
        return;
    }

    // If a specific detail is requested, display that directly
    if (detailId) {
        const selectedItem = metadata.find(
            item => item.id === detailId || item.title === detailId
        ); // Find the item by ID or title
        if (selectedItem) {
            showDetailedView(selectedItem); // Show detailed view of the item
            return;
        } else {
            // If the requested detail doesn't exist, show an error message
            fileNameContainer.innerHTML += `
                <p style="color: red;">Detail "${detailId}" not found in metadata.</p>
            `;
        }
    }

    // Display metadata based on subcategory or all metadata
    if (subcategory) {
        displayMetadata(metadata, subcategory); // Show filtered items by subcategory
    } else {
        displayAllMetadata(metadata); // Show all metadata
    }
}

function showDetailedView(item) {
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set('details', item.id || item.title); // Add the 'details' parameter to the URL
    history.pushState(null, '', '?' + urlParams.toString());

    const contentContainer = document.getElementById('contentContainer');
    contentContainer.innerHTML = ''; // Clear previous content

    const detailedView = document.createElement("div");
    detailedView.classList.add("detailed-view");

    const title = document.createElement("h3");
    title.innerText = item.title;

    const description = document.createElement("p");
    description.innerText = item.description;

    const image = document.createElement("img");
    image.src = `https://raw.githubusercontent.com/NightmareShadow4Exploit/p3/main/${item.imagePath}`;
    image.alt = item.title;
    image.style.width = "400px";
    image.style.height = "auto";

    const timestamp = document.createElement("p");
    timestamp.innerText = `Timestamp: ${item.timestamp}`;

    const downloadTitle = document.createElement("h4");
    downloadTitle.innerText = "Files:";

    detailedView.appendChild(title);
    detailedView.appendChild(timestamp);
    detailedView.appendChild(image);
    detailedView.appendChild(downloadTitle);

    item.filePaths.forEach(filePath => {
        const fileLink = document.createElement("a");
        fileLink.href = `https://raw.githubusercontent.com/NightmareShadow4Exploit/p3/main/${filePath}`;
        fileLink.download = filePath.split('/').pop();
        fileLink.innerText = filePath.split('/').pop();
        detailedView.appendChild(fileLink);
        detailedView.appendChild(document.createElement("br"));
    });

    detailedView.appendChild(description);

    contentContainer.appendChild(detailedView);
}


function truncateText(text, maxLength) {
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
}

function displayMetadata(metadata, subcategory) {
    const contentContainer = document.getElementById('contentContainer');
    contentContainer.innerHTML = ''; // Clear previous content

    const filteredItems = metadata.filter(item => item.subcategory === subcategory);

    if (filteredItems.length === 0) {
        contentContainer.innerHTML = '<p>No items found for the selected subcategory.</p>';
        return;
    }

    filteredItems.forEach(item => createMetadataItem(item, contentContainer));
}

function displayAllMetadata(metadata) {
    const contentContainer = document.getElementById('contentContainer');
    contentContainer.innerHTML = ''; // Clear previous content

    metadata.forEach(item => createMetadataItem(item, contentContainer));
}

function createMetadataItem(item, container) {


    const itemElement = document.createElement("div");
    itemElement.classList.add("list_blog_item");

    // Image
    const image = document.createElement("img");
    image.src = `https://raw.githubusercontent.com/NightmareShadow4Exploit/p3/main/${item.imagePath}`;
    image.alt = item.title;

    const textContainer = document.createElement("div");
    textContainer.classList.add("textContainer");

    // Block Title
    const blockTitle = document.createElement("div");
    // blockTitle.classList.add("block-title");

    // Title
    const title = document.createElement("div");
    title.classList.add("title");
    title.innerText = item.title;

    // Title URL
    const titleUrl = document.createElement("div");
    titleUrl.classList.add("title_url");
    titleUrl.innerText = "View More"; // You can adjust this to reflect dynamic content

    // const titleLink = document.createElement("a");
    // titleLink.href = "#";
    // titleLink.innerText = item.title;
    // title.appendChild(titleLink);

    // Description
    const description = document.createElement("p");
    description.classList.add("desc");
    description.innerText = truncateText(item.description, 63);

    // Post Meta
    const postMeta = document.createElement("div");
    postMeta.classList.add("post_meta");

    // Post Date
    const postDate = document.createElement("div");
    postDate.classList.add("post_date");
    postDate.style.direction = "ltr";
    postDate.style.textAlign = "left";

    // const clockIcon = document.createElement("i");
    // clockIcon.classList.add("fal", "fa-clock");
    // postDate.appendChild(clockIcon);

    const publishDateText = document.createElement("font");
    publishDateText.setAttribute("mstmutation", "1");
    publishDateText.setAttribute("msttexthash", "519545");
    publishDateText.setAttribute("msthash", "80");
    publishDateText.innerHTML = `Publish Date<span mstmutation="1" _istranslated="1">: ${item.timestamp}</span>`;
    
    
    // Read More Link
    const readMoreLink = document.createElement("a");
    readMoreLink.href = item.url || "#";  // Dynamic link based on item URL
    readMoreLink.target = "_blank";
    readMoreLink.title = "ادامه مطلب";
    readMoreLink.classList.add("read_more");
    
    // postMeta.appendChild(readMoreLink);
    
    // View More Link

    const arrowContainer = document.createElement("div");
    const arrow = document.createElement("div");
    const trail = document.createElement("div");
    arrowContainer.classList.add("arrow-container");
    arrow.classList.add("arrow");
    trail.classList.add("trail");
    arrow.innerHTML = "&#8594;";
    arrowContainer.appendChild(arrow);
    arrowContainer.appendChild(trail);


    const viewMoreLink = document.createElement("div");
    viewMoreLink.classList.add("view_more");
    viewMoreLink.innerHTML = "-------------------------------------------- <i>&#8594;</i>"; // Right arrow icon with "View More" link
    viewMoreLink.addEventListener('click', () => showDetailedView(item));
    
    const flex =  document.createElement("div");
    flex.classList.add("flex");

    flex.appendChild(postMeta);
    flex.appendChild(viewMoreLink);



    postMeta.appendChild(postDate);
    postDate.appendChild(publishDateText);  
    
    // blockTitle.appendChild(titleUrl);
    

    itemElement.appendChild(image);
    itemElement.appendChild(textContainer);
    blockTitle.appendChild(title);
    textContainer.appendChild(blockTitle);
    textContainer.appendChild(description);
    textContainer.appendChild(postMeta);
    // textContainer.appendChild(arrowContainer);
    // textContainer.appendChild(flex);
    // textContainer.appendChild(viewMoreLink);
    image.addEventListener('click', () => showDetailedView(item));
    title.addEventListener('click', () => showDetailedView(item));

    
    
    container.appendChild(itemElement);
}


handleMetadataFetching();
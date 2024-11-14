document.addEventListener("DOMContentLoaded", () => {
    const dropdownToggle = document.querySelector(".dropdown-toggle");
    const dropdownMenu = document.querySelector(".dropdown-menu");
  
    // Toggle dropdown menu on click
    dropdownToggle.addEventListener("click", () => {
      dropdownMenu.classList.toggle("show");
    });
  
    // Close the dropdown if clicked outside
    document.addEventListener("click", (e) => {
      if (!dropdownToggle.contains(e.target) && !dropdownMenu.contains(e.target)) {
        dropdownMenu.classList.remove("show");
      }
    });
  });
  
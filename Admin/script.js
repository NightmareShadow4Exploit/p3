function switchSection(sectionIndex) {
    const sections = document.querySelectorAll('.section');
    
    // Hide all sections first
    sections.forEach(section => {
        section.classList.remove('active');
    });

    // Show the selected section
    sections[sectionIndex].classList.add('active');
}

// Default to show the first section on page load
window.onload = () => {
    switchSection(0);
};

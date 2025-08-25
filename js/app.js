document.addEventListener('DOMContentLoaded', () => {

    // --- LOGIC FOR ALL CUSTOM SEARCHABLE DROPDOWNS ---

    const allDropdowns = document.querySelectorAll('.custom-dropdown');

    allDropdowns.forEach(dropdown => {
        const searchInput = dropdown.querySelector('input[type="text"]');
        const dropdownMenu = dropdown.querySelector('.custom-dropdown-menu');
        const optionsList = dropdown.querySelector('.custom-dropdown-options');
        const arrow = dropdown.querySelector('.dropdown-arrow');
        
        const options = JSON.parse(dropdown.dataset.options || '[]');
        let originalPlaceholder = searchInput.placeholder;

        const populateOptions = (filter = '') => {
            optionsList.innerHTML = '';
            const filteredOptions = options.filter(option => 
                option.toLowerCase().includes(filter.toLowerCase())
            );

            if (filteredOptions.length === 0) {
                optionsList.innerHTML = '<li class="no-results">No results found</li>';
                return;
            }

            filteredOptions.forEach(optionText => {
                const li = document.createElement('li');
                li.textContent = optionText;
                li.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    searchInput.value = optionText;
                    originalPlaceholder = optionText;
                    dropdownMenu.classList.remove('open');
                    arrow.classList.remove('open');
                    console.log(`${dropdown.id} changed to:`, optionText);
                });
                optionsList.appendChild(li);
            });
        };

        searchInput.addEventListener('click', (event) => {
            event.stopPropagation();
            
            const isOpen = dropdownMenu.classList.toggle('open');
            arrow.classList.toggle('open');

            if (isOpen) {
                searchInput.placeholder = "Type to search...";
                searchInput.value = '';
                populateOptions();
                allDropdowns.forEach(otherDropdown => {
                    if (otherDropdown !== dropdown) {
                        otherDropdown.querySelector('.custom-dropdown-menu').classList.remove('open');
                        otherDropdown.querySelector('.dropdown-arrow').classList.remove('open');
                    }
                });
            } else {
                searchInput.placeholder = originalPlaceholder;
            }
        });
        
        searchInput.addEventListener('blur', () => {
            setTimeout(() => {
                dropdownMenu.classList.remove('open');
                arrow.classList.remove('open');
                searchInput.value = '';
                searchInput.placeholder = originalPlaceholder;
            }, 150);
        });

        searchInput.addEventListener('input', () => {
            populateOptions(searchInput.value);
        });
    });
});
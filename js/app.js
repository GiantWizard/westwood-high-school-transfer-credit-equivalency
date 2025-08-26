document.addEventListener('DOMContentLoaded', () => {

    // --- Data Sources & Global State ---
    const apAbbreviations = {
        "AP 2-D Art and Design": "AP 2-D Art", "AP 3-D Art and Design": "AP 3-D Art", "AP African American Studies": "AP Af-Am Studies", "AP Art History": "AP Art History", "AP Biology": "AP Bio", "AP Calculus AB": "AP Calc AB", "AP Calculus BC": "AP Calc BC", "AP Chemistry": "AP Chem", "AP Computer Science A": "AP CSA", "AP Drawing": "AP Drawing", "AP English Language and Composition": "AP Lang", "AP English Literature and Composition": "AP Lit", "AP Environmental Science": "APES", "AP French Language and Culture": "AP French", "AP German Language and Culture": "AP German", "AP Human Geography": "AP HuG", "AP Macroeconomics": "AP Macro", "AP Microeconomics": "AP Micro", "AP Music Theory": "AP Music Theory", "AP Physics 1": "AP Phys 1", "AP Physics 2": "AP Phys 2", "AP Physics C: Electricity and Magnetism": "AP Phys C: E&M", "AP Physics C: Mechanics": "AP Phys C: Mech", "AP Precalculus": "AP Precalc", "AP Psychology": "AP Psych", "AP Spanish Language and Culture": "AP Spanish Lang", "AP Spanish Literature and Culture": "AP Spanish Lit", "AP Statistics": "AP Stats", "AP United States Government and Politics": "AP Gov", "AP United States History": "APUSH", "AP World History: Modern": "WHAP",
    };
    
    let stagedCourses = [];
    let selectedUniversity = null;
    let universityDataCache = {}; // Cache for loaded JSON data

    // --- Helper Functions ---
    const getDisplayName = (courseValue) => {
        const abbreviation = apAbbreviations[courseValue];
        return abbreviation ? abbreviation : courseValue.split(' - ')[0];
    };

    const createScoreDropdown = (scores, placeholder = 'Select Score', onChange) => {
        const container = document.createElement('div');
        container.className = 'score-dropdown';

        const display = document.createElement('div');
        display.className = 'score-display';
        
        const text = document.createElement('span');
        text.className = 'placeholder';
        text.textContent = placeholder;
        
        const arrowSVG = `<svg class="dropdown-arrow h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>`;
        
        display.appendChild(text);
        
        const arrowWrapper = document.createElement('span');
        arrowWrapper.innerHTML = arrowSVG;
        display.appendChild(arrowWrapper.firstElementChild);

        const menu = document.createElement('div');
        menu.className = 'custom-dropdown-menu';
        const ul = document.createElement('ul');
        ul.className = 'custom-dropdown-options max-h-60 overflow-auto';

        scores.forEach(score => {
            const li = document.createElement('li');
            li.textContent = score;
            li.addEventListener('mousedown', () => {
                text.textContent = score;
                text.classList.remove('placeholder');
                if (onChange) onChange();
            });
            ul.appendChild(li);
        });
        menu.appendChild(ul);

        display.addEventListener('click', (e) => {
            e.stopPropagation();
            document.querySelectorAll('.score-dropdown .custom-dropdown-menu.open').forEach(openMenu => {
                if (openMenu !== menu) {
                    openMenu.classList.remove('open');
                    openMenu.closest('.score-dropdown').querySelector('.dropdown-arrow').classList.remove('open');
                }
            });
            menu.classList.toggle('open');
            display.querySelector('.dropdown-arrow').classList.toggle('open');
        });
        
        container.appendChild(display);
        container.appendChild(menu);
        return container;
    };

    // --- Staged Courses Logic ---
    const stagedContainer = document.getElementById('staged-courses-container');
    const renderStagedCourses = () => {
        stagedContainer.innerHTML = '';

        if (stagedCourses.length === 0) {
            stagedContainer.innerHTML = `<p class="text-gray-500">Your selected courses will appear here.</p>`;
            renderEquivalents();
            return;
        }

        const sortedCourses = [...stagedCourses].sort((a, b) => {
            const isApA = apAbbreviations.hasOwnProperty(a);
            const isApB = apAbbreviations.hasOwnProperty(b);
            if (isApA && !isApB) return -1;
            if (!isApA && isApB) return 1;
            return a.localeCompare(b);
        });

        const header = document.createElement('div');
        header.className = 'staged-courses-header';

        // NEW: "Set All Scores" dropdown
        const setAllContainer = document.createElement('div');
        setAllContainer.className = 'set-all-scores-container';
        const setAllLabel = document.createElement('label');
        setAllLabel.textContent = 'Set All Scores:';
        setAllLabel.htmlFor = 'set-all-scores-select';
        
        const setAllSelect = document.createElement('select');
        setAllSelect.id = 'set-all-scores-select';
        setAllSelect.className = 'set-all-scores-select';
        setAllSelect.innerHTML = `<option value="">-</option><option>5</option><option>4</option><option>3</option><option>2</option><option>1</option>`;
        setAllSelect.addEventListener('change', (e) => {
            const newScore = e.target.value;
            if (!newScore) return;
            
            document.querySelectorAll('.staged-course-row .score-display span:first-child').forEach(scoreSpan => {
                scoreSpan.textContent = newScore;
                scoreSpan.classList.remove('placeholder');
            });
            renderEquivalents();
            e.target.value = ""; // Reset dropdown
        });

        setAllContainer.appendChild(setAllLabel);
        setAllContainer.appendChild(setAllSelect);
        header.appendChild(setAllContainer);

        const removeAllBtn = document.createElement('button');
        removeAllBtn.className = 'remove-all-btn';
        removeAllBtn.textContent = 'Remove All';
        removeAllBtn.addEventListener('click', () => {
            stagedCourses = [];
            renderStagedCourses();
        });
        header.appendChild(removeAllBtn);
        stagedContainer.appendChild(header);

        sortedCourses.forEach(course => {
            const row = document.createElement('div');
            row.className = 'staged-course-row';
            row.dataset.courseName = course;
            
            const pill = document.createElement('div');
            pill.className = 'staged-course-item';
            
            const pillText = document.createElement('span');
            pillText.textContent = getDisplayName(course); // Uses abbreviation for pill

            const removeBtn = document.createElement('button');
            removeBtn.className = 'staged-pill-remove-btn';
            removeBtn.innerHTML = '&times;';
            removeBtn.title = `Remove ${getDisplayName(course)}`;
            removeBtn.addEventListener('click', () => {
                stagedCourses = stagedCourses.filter(c => c !== course);
                renderStagedCourses();
            });

            pill.appendChild(pillText);
            pill.appendChild(removeBtn);
            row.appendChild(pill);
            
            const isApCourse = apAbbreviations.hasOwnProperty(course);
            if (isApCourse) {
                // NEW: Score options are now 5-1
                const scoreDropdown = createScoreDropdown(['5', '4', '3', '2', '1'], 'Select Score', renderEquivalents);
                row.appendChild(scoreDropdown);
            }
            
            stagedContainer.appendChild(row);
        });
        renderEquivalents();
    };

    // --- Equivalency Rendering Logic ---
    const equivalentsContainer = document.getElementById('equivalency-display-container');
    const renderEquivalents = () => {
        equivalentsContainer.innerHTML = '';
        const universityData = universityDataCache[selectedUniversity];

        if (!selectedUniversity || !universityData) {
            equivalentsContainer.innerHTML = `<p class="text-gray-500">Select a university and stage courses to see equivalencies.</p>`;
            return;
        }
        
        if (stagedCourses.length === 0) {
            equivalentsContainer.innerHTML = `<p class="text-gray-500">Stage a course on the left to see its equivalent here.</p>`;
            return;
        }

        let cardsHtml = '';
        stagedCourses.forEach(courseName => {
            // NEW: Use the full courseName for the card title, not the abbreviation
            const isApCourse = apAbbreviations.hasOwnProperty(courseName);
            let card = '';

            if (isApCourse) {
                const row = stagedContainer.querySelector(`[data-course-name="${courseName}"]`);
                const scoreDisplay = row.querySelector('.score-display span:first-child');
                const selectedScore = parseInt(scoreDisplay.textContent, 10);
                
                let policy = null;
                if (!isNaN(selectedScore)) {
                    const validPolicies = universityData.apEquivalencies
                        .filter(p => p.examName === courseName && p.score <= selectedScore);

                    if (validPolicies.length > 0) {
                        validPolicies.sort((a, b) => b.score - a.score);
                        policy = validPolicies[0];
                    }
                }
                
                card += `<div class="equivalent-card"><h3>${courseName}</h3><div class="details-bar">`;
                if (!isNaN(selectedScore)) {
                    card += `<span>Score: ${selectedScore}</span>`;
                    if (policy) {
                        card += `<span>${policy.creditHours} Credit Hours</span>`;
                    }
                } else {
                    card += `<span>Select a score</span>`;
                }
                card += `</div>`;

                if (policy) {
                    card += `<p class="equivalency-info">Equivalent courses at ${selectedUniversity}: <strong>${policy.equivalentCourses.join(', ')}</strong></p>`;
                } else {
                    card += `<p class="equivalency-info">No credit awarded for this score.</p>`;
                }

            } else {
                const policy = universityData.courseEquivalencies.find(p => p.courseCode === courseName);

                // NEW: Added 'transfer-details' class for right-alignment
                card += `<div class="equivalent-card"><h3>${courseName}</h3><div class="details-bar transfer-details">`;
                if (policy) {
                    card += `<span>${policy.creditHours} Credit Hours</span>`;
                }
                card += `</div>`;

                if (policy) {
                    card += `<p class="equivalency-info">Equivalent course at ${selectedUniversity}: <strong>${policy.equivalentCourse}</strong></p>`;
                } else {
                    card += `<p class="equivalency-info">No equivalency data found.</p>`;
                }
            }
            card += `</div>`;
            cardsHtml += card;
        });

        equivalentsContainer.innerHTML = cardsHtml;
    };

    // --- Data Fetching Function ---
    const fetchEquivalencyData = async (universityName) => {
        if (universityDataCache[universityName]) {
            return universityDataCache[universityName];
        }
        try {
            const formattedName = universityName.toLowerCase().replace(/ /g, '-');
            const response = await fetch(`public/transfer_data/${formattedName}.json`);
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            universityDataCache[universityName] = data;
            return data;
        } catch (error) {
            console.error('Failed to fetch equivalency data:', error);
            equivalentsContainer.innerHTML = `<p class="text-red-500">Could not load data for ${universityName}.</p>`;
            return null;
        }
    };
    
    // --- Event Listeners & Initializers ---
    document.querySelectorAll('.custom-dropdown').forEach(dropdown => {
        const searchInput = dropdown.querySelector('input[type="text"]');
        const dropdownMenu = dropdown.querySelector('.custom-dropdown-menu');
        const optionsList = dropdown.querySelector('.custom-dropdown-options');
        const arrowContainer = dropdown.querySelector('.dropdown-arrow-container');
        const arrow = arrowContainer.querySelector('.dropdown-arrow');
        const options = JSON.parse(searchInput.dataset.options || '[]');
        
        const populateOptions = (filter = '') => {
            optionsList.innerHTML = '';
            const filteredOptions = options.filter(option => option.toLowerCase().includes(filter.toLowerCase()));
            
            filteredOptions.forEach(optionText => {
                const li = document.createElement('li');
                li.textContent = optionText;
                
                li.addEventListener('mousedown', () => {
                    searchInput.value = optionText;
                    selectedUniversity = optionText;
                    renderEquivalents();
                });
                
                optionsList.appendChild(li);
            });
        };
        
        searchInput.addEventListener('focus', () => {
            dropdownMenu.classList.add('open');
            arrow.classList.add('open');
            populateOptions(searchInput.value);
        });
        
        searchInput.addEventListener('blur', () => {
            setTimeout(() => {
                dropdownMenu.classList.remove('open');
                arrow.classList.remove('open');
                if (!options.includes(searchInput.value)) { 
                    searchInput.value = '';
                    selectedUniversity = null;
                    renderEquivalents();
                }
            }, 150);
        });
        
        searchInput.addEventListener('input', () => populateOptions(searchInput.value));
        
        arrowContainer.addEventListener('click', (e) => {
            e.stopPropagation();
            if (dropdownMenu.classList.contains('open')) {
                searchInput.blur();
            } else {
                searchInput.focus();
            }
        });
    });

    const createMultiSelect = (dropdownElement) => {
        const header = dropdownElement.querySelector('.multi-select-header');
        const display = dropdownElement.querySelector('.selected-items-display');
        const searchInput = dropdownElement.querySelector('.multi-select-search-input');
        const menu = dropdownElement.querySelector('.custom-dropdown-menu');
        const optionsList = dropdownElement.querySelector('.custom-dropdown-options');
        const arrow = dropdownElement.querySelector('.dropdown-arrow');
        const originalPlaceholder = searchInput.placeholder;
        
        // NEW: Options are processed differently to handle full names vs. pill names
        const allOptions = JSON.parse(dropdownElement.dataset.options || '[]');
        const processedOptions = allOptions.map(option => ({
            value: option,
            listDisplay: option, // Full name for the list
            pillDisplay: getDisplayName(option) // Abbreviated name for the pill
        }));

        let selectedOptions = [];

        const renderPills = () => {
            display.querySelectorAll('.item-pill').forEach(pill => pill.remove());
            processedOptions.forEach(({ value, pillDisplay }) => { // Uses pillDisplay
                if (selectedOptions.includes(value)) {
                    const pill = document.createElement('div');
                    pill.className = 'item-pill';
                    pill.textContent = pillDisplay; // Set pill text here
                    const closeBtn = document.createElement('button');
                    closeBtn.className = 'pill-close-btn';
                    closeBtn.innerHTML = '&times;';
                    closeBtn.addEventListener('mousedown', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleOption(value);
                    });
                    pill.appendChild(closeBtn);
                    display.insertBefore(pill, searchInput);
                }
            });
            searchInput.placeholder = selectedOptions.length > 0 ? '' : originalPlaceholder;
        };

        const populateOptions = (filter = '') => {
            optionsList.innerHTML = '';
            const lowerCaseFilter = filter.toLowerCase();
            // Search against both full and abbreviated names
            const filteredOptions = processedOptions.filter(opt =>
                opt.listDisplay.toLowerCase().includes(lowerCaseFilter) ||
                opt.pillDisplay.toLowerCase().includes(lowerCaseFilter)
            );

            if (filteredOptions.length === 0) {
                const noResults = document.createElement('li');
                noResults.className = 'no-results';
                noResults.textContent = 'No results found';
                optionsList.appendChild(noResults);
                return;
            }

            filteredOptions.forEach(({ value, listDisplay }) => { // Uses listDisplay
                const li = document.createElement('li');
                li.textContent = listDisplay; // Set list text here
                if (selectedOptions.includes(value)) {
                    li.classList.add('selected');
                }
                li.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    toggleOption(value);
                    searchInput.value = '';
                    populateOptions();
                });
                optionsList.appendChild(li);
            });
        };

        const toggleOption = (optionValue) => {
            const index = selectedOptions.indexOf(optionValue);
            if (index > -1) {
                selectedOptions.splice(index, 1);
            } else {
                selectedOptions.push(optionValue);
            }
            renderPills();
            populateOptions(searchInput.value);
        };

        searchInput.addEventListener('focus', () => {
            menu.classList.add('open');
            arrow.classList.add('open');
            populateOptions(searchInput.value);
        });
        searchInput.addEventListener('blur', () => {
            setTimeout(() => {
                menu.classList.remove('open');
                arrow.classList.remove('open');
            }, 150);
        });
        searchInput.addEventListener('input', () => populateOptions(searchInput.value));
        header.addEventListener('click', (e) => {
            if (e.target.closest('.pill-close-btn')) return;
            searchInput.focus();
        });

        return {
            getSelectedItems: () => [...selectedOptions],
            clearSelection: () => {
                selectedOptions = [];
                renderPills();
            }
        };
    };
    
    const apSelect = createMultiSelect(document.getElementById('ap-exam-select'));
    const courseSelect = createMultiSelect(document.getElementById('transfer-course-select'));

    const stageButton = document.getElementById('stage-courses-btn');
    stageButton.addEventListener('click', async () => {
        if (!selectedUniversity) {
            alert("Please select a target university first.");
            return;
        }

        await fetchEquivalencyData(selectedUniversity);

        const allSelected = [...apSelect.getSelectedItems(), ...courseSelect.getSelectedItems()];
        allSelected.forEach(item => {
            if (!stagedCourses.includes(item)) {
                stagedCourses.push(item);
            }
        });

        if (allSelected.length > 0) {
            renderStagedCourses();
        }

        apSelect.clearSelection();
        courseSelect.clearSelection();
    });

    // FIXED: Corrected the typo from 'score-dropdown' to '.score-dropdown'
    document.addEventListener('click', (e) => {
        document.querySelectorAll('.multi-select-dropdown, .custom-dropdown, .score-dropdown').forEach(dropdown => {
            if (!dropdown.contains(e.target)) {
                const menu = dropdown.querySelector('.custom-dropdown-menu');
                const arrow = dropdown.querySelector('.dropdown-arrow');
                if (menu) menu.classList.remove('open');
                if (arrow) arrow.classList.remove('open');
            }
        });
    });

    renderStagedCourses();
});
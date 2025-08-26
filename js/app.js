document.addEventListener('DOMContentLoaded', () => {

    // --- Data Sources & Global State ---
    const apAbbreviations = {
        "AP 2-D Art and Design": "AP 2-D Art", "AP 3-D Art and Design": "AP 3-D Art", "AP African American Studies": "AP Af-Am Studies", "AP Art History": "AP Art History", "AP Biology": "AP Bio", "AP Calculus AB": "AP Calc AB", "AP Calculus BC": "AP Calc BC", "AP Chemistry": "AP Chem", "AP Computer Science A": "AP CSA", "AP Drawing": "AP Drawing", "AP English Language and Composition": "AP Lang", "AP English Literature and Composition": "AP Lit", "AP Environmental Science": "APES", "AP French Language and Culture": "AP French", "AP German Language and Culture": "AP German", "AP Human Geography": "AP HuG", "AP Macroeconomics": "AP Macro", "AP Microeconomics": "AP Micro", "AP Music Theory": "AP Music Theory", "AP Physics 1": "AP Phys 1", "AP Physics 2": "AP Phys 2", "AP Physics C: Electricity and Magnetism": "AP Phys C: E&M", "AP Physics C: Mechanics": "AP Phys C: Mech", "AP Precalculus": "AP Precalc", "AP Psychology": "AP Psych", "AP Spanish Language and Culture": "AP Spanish Lang", "AP Spanish Literature and Culture": "AP Spanish Lit", "AP Statistics": "AP Stats", "AP United States Government and Politics": "AP Gov", "AP United States History": "APUSH", "AP World History: Modern": "WHAP",
    };
    
    // NEW: State management for staged courses
    let stagedCourses = [];

    // --- Helper Functions ---
    const getDisplayName = (courseValue) => {
        const abbreviation = apAbbreviations[courseValue];
        return abbreviation ? abbreviation : courseValue.split(' - ')[0];
    };

    // --- Staged Courses Logic ---
    const stagedContainer = document.getElementById('staged-courses-container');

    const renderStagedCourses = () => {
        stagedContainer.innerHTML = ''; // Clear container

        if (stagedCourses.length === 0) {
            stagedContainer.innerHTML = `<p class="text-gray-500">Your selected courses will appear here.</p>`;
            return;
        }

        // Create header with "Remove All" button
        const header = document.createElement('div');
        header.className = 'staged-courses-header';
        
        const removeAllBtn = document.createElement('button');
        removeAllBtn.className = 'remove-all-btn';
        removeAllBtn.textContent = 'Remove All';
        removeAllBtn.addEventListener('click', () => {
            stagedCourses = [];
            renderStagedCourses();
        });

        // The header contains just the button, aligned to the right.
        header.appendChild(removeAllBtn);
        stagedContainer.appendChild(header);

        // Create list of staged courses
        stagedCourses.forEach(course => {
            const row = document.createElement('div');
            row.className = 'staged-course-row';
            
            const pill = document.createElement('div');
            pill.className = 'staged-course-item';
            pill.textContent = getDisplayName(course);

            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-staged-item-btn';
            removeBtn.innerHTML = '&times;';
            removeBtn.addEventListener('click', () => {
                stagedCourses = stagedCourses.filter(c => c !== course);
                renderStagedCourses();
            });

            row.appendChild(pill);
            row.appendChild(removeBtn);
            stagedContainer.appendChild(row);
        });
    };

    // --- LOGIC FOR SINGLE-SELECT DROPDOWN ---
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
                    displayEquivalencies(optionText);
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
                if (!options.includes(searchInput.value)) { searchInput.value = ''; }
            }, 150);
        });
        searchInput.addEventListener('input', () => populateOptions(searchInput.value));
        arrowContainer.addEventListener('click', (e) => {
            e.stopPropagation();
            if (dropdownMenu.classList.contains('open')) { searchInput.blur(); } else { searchInput.focus(); }
        });
    });

    // --- LOGIC FOR MULTI-SELECT DROPDOWNS ---
    const createMultiSelect = (dropdownElement) => {
        const header = dropdownElement.querySelector('.multi-select-header');
        const display = dropdownElement.querySelector('.selected-items-display');
        const searchInput = dropdownElement.querySelector('.multi-select-search-input');
        const menu = dropdownElement.querySelector('.custom-dropdown-menu');
        const optionsList = dropdownElement.querySelector('.custom-dropdown-options');
        const arrow = dropdownElement.querySelector('.dropdown-arrow');
        const originalPlaceholder = searchInput.placeholder;
        
        const allOptions = JSON.parse(dropdownElement.dataset.options || '[]');
        const processedOptions = allOptions.map(option => ({
            value: option,
            display: getDisplayName(option)
        }));

        let selectedOptions = [];

        const renderPills = () => {
            display.querySelectorAll('.item-pill').forEach(pill => pill.remove());
            processedOptions.forEach(({ value, display: displayText }) => {
                if (selectedOptions.includes(value)) {
                    const pill = document.createElement('div');
                    pill.className = 'item-pill';
                    pill.textContent = displayText;
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
            const filteredOptions = processedOptions.filter(opt =>
                opt.value.toLowerCase().includes(lowerCaseFilter) ||
                opt.display.toLowerCase().includes(lowerCaseFilter)
            );

            if (filteredOptions.length === 0) {
                const noResults = document.createElement('li');
                noResults.className = 'no-results';
                noResults.textContent = 'No results found';
                optionsList.appendChild(noResults);
                return;
            }

            filteredOptions.forEach(({ value, display }) => {
                const li = document.createElement('li');
                li.textContent = display;
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

    // --- STAGE COURSES BUTTON LOGIC ---
    const stageButton = document.getElementById('stage-courses-btn');

    stageButton.addEventListener('click', () => {
        const allSelected = [...apSelect.getSelectedItems(), ...courseSelect.getSelectedItems()];
        
        // Add only new, unique courses to the staged list
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

    // --- General Event Listeners ---
    document.addEventListener('click', (e) => {
        // Close multi-select dropdowns
        document.querySelectorAll('.multi-select-dropdown, .custom-dropdown').forEach(dropdown => {
            if (!dropdown.contains(e.target)) {
                const menu = dropdown.querySelector('.custom-dropdown-menu');
                const arrow = dropdown.querySelector('.dropdown-arrow');
                if (menu) menu.classList.remove('open');
                if (arrow) arrow.classList.remove('open');
            }
        });
        // Close score dropdowns
        document.querySelectorAll('.score-dropdown').forEach(dropdown => {
            if (!dropdown.contains(e.target)) {
                dropdown.querySelector('.custom-dropdown-menu').classList.remove('open');
                dropdown.querySelector('.dropdown-arrow').classList.remove('open');
            }
        });
    });

    // --- AP EQUIVALENCY DISPLAY FUNCTIONS ---
    // Note: The apEquivalencies object is a placeholder. You would fetch this data from a server.
    const apEquivalencies = [
        { university: "UT Austin", examName: "AP Calculus AB", score: "4", creditHours: 4, equivalentCourses: ["M 408K"] },
        { university: "UT Austin", examName: "AP Calculus AB", score: "5", creditHours: 4, equivalentCourses: ["M 408K"] },
        { university: "UT Austin", examName: "AP Biology", score: "3", creditHours: 3, equivalentCourses: ["BIO 311C"] },
        { university: "UT Austin", examName: "AP Biology", score: "4", creditHours: 6, equivalentCourses: ["BIO 311C", "BIO 311D"] },
        { university: "UT Austin", examName: "AP Biology", score: "5", creditHours: 8, equivalentCourses: ["BIO 311C", "BIO 311D", "BIO 206L"] },
        { university: "Texas A&M University", examName: "AP Biology", score: "4", creditHours: 8, equivalentCourses: ["BIOL 111", "BIOL 112"] },
    ];

    const createScoreDropdown = (scores) => {
        const container = document.createElement('div');
        container.className = 'score-dropdown';

        const display = document.createElement('div');
        display.className = 'score-display';
        
        const text = document.createElement('span');
        text.className = 'placeholder';
        text.textContent = 'Select Score';
        
        const arrowSVG = `<svg class="dropdown-arrow h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>`;
        
        display.appendChild(text);
        display.innerHTML += arrowSVG;

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
            });
            ul.appendChild(li);
        });
        menu.appendChild(ul);

        display.addEventListener('click', () => {
            menu.classList.toggle('open');
            display.querySelector('.dropdown-arrow').classList.toggle('open');
        });
        
        container.appendChild(display);
        container.appendChild(menu);
        return container;
    };

    const displayEquivalencies = (universityName) => {
        const container = document.getElementById('equivalency-display-container');
        container.innerHTML = '';
        
        if (!universityName) {
            container.innerHTML = `<p class="text-gray-500">Select a university to see its AP credit policies.</p>`;
            return;
        }

        const uniPolicies = apEquivalencies.filter(p => p.university === universityName);
        
        if (uniPolicies.length === 0) {
            container.innerHTML = `<p class="text-gray-500">AP credit policies for <strong>${universityName}</strong> are not available.</p>`;
            return;
        }

        const groupedData = uniPolicies.reduce((acc, current) => {
            if (!acc[current.examName]) acc[current.examName] = [];
            acc[current.examName].push(current);
            return acc;
        }, {});

        for (const examName in groupedData) {
            const policies = groupedData[examName];
            const card = document.createElement('div');
            card.className = 'exam-card';

            let tableRows = policies.map(policy => `
                <tr>
                    <td>${policy.score}</td>
                    <td>${policy.creditHours} hours</td>
                    <td>${policy.equivalentCourses.join(', ')}</td>
                </tr>
            `).join('');

            card.innerHTML = `
                <h3>${examName}</h3>
                <table>
                    <thead><tr><th>Score</th><th>Credit</th><th>Equivalent Courses</th></tr></thead>
                    <tbody>${tableRows}</tbody>
                </table>
            `;
            
            // Add score selector
            const selectorContainer = document.createElement('div');
            selectorContainer.className = 'score-selector-container';
            const label = document.createElement('label');
            label.textContent = 'Select Your Score:';
            
            const possibleScores = [...new Set(policies.map(p => p.score))].sort();
            const scoreDropdown = createScoreDropdown(possibleScores);

            selectorContainer.appendChild(label);
            selectorContainer.appendChild(scoreDropdown);
            card.appendChild(selectorContainer);

            container.appendChild(card);
        }
    };
    
    // Initial render of empty staged courses
    renderStagedCourses();
});
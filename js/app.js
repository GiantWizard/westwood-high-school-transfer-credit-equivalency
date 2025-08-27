document.addEventListener('DOMContentLoaded', () => {

    // --- Data Sources & Global State ---
    const TUITION_RATES = {
        "Austin Community College": 85.00,
        "UT San Antonio": 381.60,
        "UT Austin": 389.60,
        "Texas State University": 407.33,
        "Texas A&M University": 438.47,
        "Texas Tech University": 474.00,
        "UT Dallas": 488.13,
        "Purdue University": 959.80,
        "University of Arkansas": 1051.67,
        "Baylor University": 2120.67
    };

    const apAbbreviations = {
        "AP 2-D Art and Design": "AP 2-D Art", "AP 3-D Art and Design": "AP 3-D Art", "AP African American Studies": "AP Af-Am Studies", "AP Art History": "AP Art History", "AP Biology": "AP Bio", "AP Calculus AB": "AP Calc AB", "AP Calculus BC": "AP Calc BC", "AP Chemistry": "AP Chem", "AP Computer Science A": "AP CSA", "AP Drawing": "AP Drawing", "AP English Language and Composition": "AP Lang", "AP English Literature and Composition": "AP Lit", "AP Environmental Science": "APES", "AP French Language and Culture": "AP French", "AP German Language and Culture": "AP German", "AP Human Geography": "AP HuG", "AP Macroeconomics": "AP Macro", "AP Microeconomics": "AP Micro", "AP Music Theory": "AP Music Theory", "AP Physics 1": "AP Phys 1", "AP Physics 2": "AP Phys 2", "AP Physics C: Electricity and Magnetism": "AP Phys C: E&M", "AP Physics C: Mechanics": "AP Phys C: Mech", "AP Precalculus": "AP Precalc", "AP Psychology": "AP Psych", "AP Spanish Language and Culture": "AP Spanish Lang", "AP Spanish Literature and Culture": "AP Spanish Lit", "AP Statistics": "AP Stats", "AP United States Government and Politics": "AP Gov", "AP United States History": "APUSH", "AP World History: Modern": "WHAP",
    };
    
    let stagedCourses = [];
    let stagedCourseScores = {};
    let selectedUniversity = null;
    let universityDataCache = {};

    // --- Helper Functions ---
    const getDisplayName = (courseValue) => {
        const abbreviation = apAbbreviations[courseValue];
        return abbreviation ? abbreviation : courseValue.split(' - ')[0];
    };

    const createScoreDropdown = (scores, placeholder = 'Select Score', onChange, initialValue = null) => {
        const container = document.createElement('div');
        container.className = 'score-dropdown';
        const display = document.createElement('div');
        display.className = 'score-display';
        const text = document.createElement('span');
        if (initialValue) {
            text.textContent = initialValue;
        } else {
            text.className = 'placeholder';
            text.textContent = placeholder;
        }
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
                if (onChange) onChange(score);
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
            stagedContainer.innerHTML = `<p class="text-gray-500">Your selected courses will appear here and the equvivalent credits for those courses will be calculated in the University Credit Polices section.</p>`;
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
        const setAllDropdown = createScoreDropdown(['5', '4', '3', '2', '1'], 'Set All Scores', (newScore) => {
            if (!newScore) return;
            stagedCourses.forEach(course => {
                if (apAbbreviations.hasOwnProperty(course)) {
                    stagedCourseScores[course] = newScore;
                }
            });
            renderStagedCourses();
        });
        header.appendChild(setAllDropdown);
        const removeAllBtn = document.createElement('button');
        removeAllBtn.className = 'remove-all-btn';
        removeAllBtn.textContent = 'Remove All';
        removeAllBtn.addEventListener('click', () => {
            stagedCourses = [];
            stagedCourseScores = {};
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
            pillText.textContent = getDisplayName(course);
            const removeBtn = document.createElement('button');
            removeBtn.className = 'staged-pill-remove-btn';
            removeBtn.innerHTML = '&times;';
            removeBtn.title = `Remove ${getDisplayName(course)}`;
            removeBtn.addEventListener('click', () => {
                stagedCourses = stagedCourses.filter(c => c !== course);
                delete stagedCourseScores[course];
                renderStagedCourses();
            });
            pill.appendChild(pillText);
            pill.appendChild(removeBtn);
            row.appendChild(pill);
            const isApCourse = apAbbreviations.hasOwnProperty(course);
            if (isApCourse) {
                const existingScore = stagedCourseScores[course];
                const scoreCallback = (score) => {
                    stagedCourseScores[course] = score;
                    renderEquivalents();
                };
                const scoreDropdown = createScoreDropdown(['5', '4', '3', '2', '1'], 'Select Score', scoreCallback, existingScore);
                row.appendChild(scoreDropdown);
            }
            stagedContainer.appendChild(row);
        });
        renderEquivalents();
    };

    // --- Equivalency Rendering Logic ---
    const equivalentsContainer = document.getElementById('equivalency-display-container');
    const totalSavingsContainer = document.getElementById('total-savings-container');
    const renderEquivalents = () => {
        equivalentsContainer.innerHTML = '';
        const universityData = universityDataCache[selectedUniversity];
        if (!selectedUniversity || !universityData) {
            equivalentsContainer.innerHTML = `<p class="text-gray-500">Select a university and stage courses to see equivalencies.</p>`;
            totalSavingsContainer.classList.add('hidden');
            return;
        }
        if (stagedCourses.length === 0) {
            equivalentsContainer.innerHTML = `<p class="text-gray-500">Stage a course on the left to see its equivalent here.</p>`;
            totalSavingsContainer.classList.add('hidden');
            return;
        }

        const costPerHour = TUITION_RATES[selectedUniversity] || 0;
        let potentialCredits = [];

        // Step 1: Gather all potential credits and their values
        stagedCourses.forEach(courseName => {
            const isApCourse = apAbbreviations.hasOwnProperty(courseName);
            let policy = null;
            if (isApCourse) {
                const selectedScore = parseInt(stagedCourseScores[courseName], 10);
                if (!isNaN(selectedScore)) {
                    const validPolicies = universityData.apEquivalencies.filter(p => p.examName === courseName && p.score <= selectedScore);
                    if (validPolicies.length > 0) {
                        validPolicies.sort((a, b) => b.score - a.score);
                        policy = { ...validPolicies[0] };
                        if (courseName === 'AP Calculus BC') {
                            const abPolicies = universityData.apEquivalencies.filter(p => p.examName === 'AP Calculus AB' && p.score <= selectedScore);
                            if (abPolicies.length > 0) {
                                abPolicies.sort((a, b) => b.score - a.score);
                                const abPolicy = abPolicies[0];
                                policy.creditHours += abPolicy.creditHours;
                                const combinedCourses = [...policy.equivalentCourses, ...abPolicy.equivalentCourses];
                                policy.equivalentCourses = [...new Set(combinedCourses)];
                            }
                        }
                    }
                }
            } else {
                const courseCodeOnly = courseName.split(' - ')[0];
                policy = universityData.courseEquivalencies.find(p => p.courseCode === courseCodeOnly);
            }
            if (policy) {
                potentialCredits.push({
                    sourceName: courseName,
                    policy: policy,
                    savings: (policy.creditHours * costPerHour)
                });
            } else {
                potentialCredits.push({ sourceName: courseName, policy: null, savings: 0 });
            }
        });

        // Step 2: Sort by value (descending) so highest value course gets priority
        potentialCredits.sort((a, b) => b.savings - a.savings);
        
        let grossSavings = 0;
        let duplicateSavings = 0;
        const grantedCourses = new Set();
        let cardsHtml = '';

        // Step 3: Process sorted credits to find duplicates and build cards
        potentialCredits.forEach(({ sourceName, policy, savings }) => {
            let card = '';
            let savingsFooter = '';
            const isApCourse = apAbbreviations.hasOwnProperty(sourceName);

            // Build the main card structure (same for all)
            card += `<div class="equivalent-card"><h3>${sourceName}</h3>`;
            if (policy) {
                const selectedScore = isApCourse ? parseInt(stagedCourseScores[sourceName], 10) : null;
                card += `<div class="details-bar ${isApCourse ? '' : 'transfer-details'}">`;
                if(isApCourse) card += `<span>Score: ${isNaN(selectedScore) ? '-' : selectedScore}</span>`;
                card += `<span>${policy.creditHours} Credit Hours</span></div>`;
                
                const flatEquivalentCourses = Array.isArray(policy.equivalentCourses) ? policy.equivalentCourses : [policy.equivalentCourse];
                const displayCode = isApCourse 
                    ? flatEquivalentCourses.join(', ') 
                    : flatEquivalentCourses[0].split(' ')[0]; // Simplified for transfer
                
                card += `<div class="equivalency-info"><span>Equivalent courses at ${selectedUniversity}:</span><strong>${displayCode}</strong></div>`;

                // Check for duplicates
                const isDuplicate = flatEquivalentCourses.some(course => grantedCourses.has(course));
                if (isDuplicate) {
                    duplicateSavings += savings;
                } else {
                    grossSavings += savings;
                    flatEquivalentCourses.forEach(c => grantedCourses.add(c));
                }
                if (costPerHour > 0) {
                    savingsFooter = `<div class="savings-bar"><span>Amount Saved</span><strong class="savings-amount-box">$${savings.toFixed(2)}</strong></div>`;
                }
            } else {
                // No policy found
                card += `<div class="details-bar"></div><div class="equivalency-info"><span>No equivalency data found.</span></div>`;
            }
            card += savingsFooter + `</div>`;
            cardsHtml += card;
        });

        if (duplicateSavings > 0) {
            cardsHtml += `<div class="duplicate-card"><span>Duplicate Credits</span><span class="duplicate-amount">-$${duplicateSavings.toFixed(2)}</span></div>`;
        }
        equivalentsContainer.innerHTML = cardsHtml;

        const netSavings = grossSavings;
        if (netSavings > 0) {
            totalSavingsContainer.innerHTML = `<div class="total-savings-box"><span>Total Saved</span><strong>$${netSavings.toFixed(2)}</strong></div>`;
            totalSavingsContainer.classList.remove('hidden');
        } else {
            totalSavingsContainer.classList.add('hidden');
        }
    };

    // --- Data Fetching Function ---
    const fetchEquivalencyData = async (universityName) => {
        if (universityDataCache[universityName]) return universityDataCache[universityName];
        try {
            const formattedName = universityName.toLowerCase().replace(/ /g, '-');
            const response = await fetch(`transfer_data/${formattedName}.json`);
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
        const optionsList = dropdown.querySelector('.custom-dropdown-options');
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
        const dropdownMenu = dropdown.querySelector('.custom-dropdown-menu');
        const arrowContainer = dropdown.querySelector('.dropdown-arrow-container');
        const arrow = arrowContainer.querySelector('.dropdown-arrow');
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
            if (dropdownMenu.classList.contains('open')) searchInput.blur();
            else searchInput.focus();
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
        const allOptions = JSON.parse(dropdownElement.dataset.options || '[]');
        const processedOptions = allOptions.map(option => ({
            value: option,
            listDisplay: option,
            pillDisplay: getDisplayName(option)
        }));
        let selectedOptions = [];
        const renderPills = () => {
            display.querySelectorAll('.item-pill').forEach(pill => pill.remove());
            processedOptions.forEach(({ value, pillDisplay }) => {
                if (selectedOptions.includes(value)) {
                    const pill = document.createElement('div');
                    pill.className = 'item-pill';
                    pill.textContent = pillDisplay;
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
            filteredOptions.forEach(({ value, listDisplay }) => {
                const li = document.createElement('li');
                li.textContent = listDisplay;
                if (selectedOptions.includes(value)) li.classList.add('selected');
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
            if (index > -1) selectedOptions.splice(index, 1);
            else selectedOptions.push(optionValue);
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
    });

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
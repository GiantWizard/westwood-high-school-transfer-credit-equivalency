document.addEventListener('DOMContentLoaded', () => {

    // --- Data Sources ---
    const apAbbreviations = {
        "AP 2-D Art and Design": "AP 2-D Art", "AP 3-D Art and Design": "AP 3-D Art", "AP African American Studies": "AP Af-Am Studies", "AP Art History": "AP Art History", "AP Biology": "AP Bio", "AP Calculus AB": "AP Calc AB", "AP Calculus BC": "AP Calc BC", "AP Chemistry": "AP Chem", "AP Computer Science A": "AP CSA", "AP Drawing": "AP Drawing", "AP English Language and Composition": "AP Lang", "AP English Literature and Composition": "AP Lit", "AP Environmental Science": "APES", "AP French Language and Culture": "AP French", "AP German Language and Culture": "AP German", "AP Human Geography": "AP HuG", "AP Macroeconomics": "AP Macro", "AP Microeconomics": "AP Micro", "AP Music Theory": "AP Music Theory", "AP Physics 1": "AP Phys 1", "AP Physics 2": "AP Phys 2", "AP Physics C: Electricity and Magnetism": "AP Phys C: E&M", "AP Physics C: Mechanics": "AP Phys C: Mech", "AP Precalculus": "AP Precalc", "AP Psychology": "AP Psych", "AP Spanish Language and Culture": "AP Spanish Lang", "AP Spanish Literature and Culture": "AP Spanish Lit", "AP Statistics": "AP Stats", "AP United States Government and Politics": "AP Gov", "AP United States History": "APUSH", "AP World History: Modern": "WHAP",
    };

    const apEquivalencies = [
        {"examName": "AP 2-D Art and Design","score": 3,"creditHours": 3,"equivalentCourses": ["ARTS 13133"]},
        {"examName": "AP 3-D Art and Design","score": 3,"creditHours": 3,"equivalentCourses": ["ARTS 13233"]},
        {"examName": "AP African American Studies","score": 3,"creditHours": 3,"equivalentCourses": ["AAST 10003"]},
        {"examName": "AP Art History","score": 3,"creditHours": 3,"equivalentCourses": ["ARHS 1003"]},
        {"examName": "AP Art History","score": 4,"creditHours": 4,"equivalentCourses": ["ARHS 100H3","ARHS 20003"]},
        {"examName": "AP Art History","score": 5,"creditHours": 5,"equivalentCourses": ["ARHS 100H3","ARHS 20003","ARHS 21003"]},
        {"examName": "AP Biology","score": 3,"creditHours": 3,"equivalentCourses": ["BIOL 1524"]},
        {"examName": "AP Biology","score": 4,"creditHours": 4,"equivalentCourses": ["BIOL 10103","BIOL 10101"]},
        {"examName": "AP Biology","score": 5,"creditHours": 5,"equivalentCourses": ["BIOL 101H3","BIOL 101H1"]},
        {"examName": "AP Calculus AB","score": 3,"creditHours": 3,"equivalentCourses": ["MATH 24004"]},
        {"examName": "AP Calculus AB","score": 5,"creditHours": 5,"equivalentCourses": ["MATH 240H4"]},
        {"examName": "AP Calculus BC","score": 3,"creditHours": 3,"equivalentCourses": ["MATH 24004","MATH 25004"]},
        {"examName": "AP Calculus BC","score": 5,"creditHours": 5,"equivalentCourses": ["MATH 240H4","MATH 250H4"]},
        {"examName": "AP Chemistry","score": 3,"creditHours": 3,"equivalentCourses": ["CHEM 10003","CHEM 10001"]},
        {"examName": "AP Chemistry","score": 4,"creditHours": 4,"equivalentCourses": ["CHEM 14103","CHEM 14101","CHEM 14203","CHEM 14201"]},
        {"examName": "AP Chemistry","score": 5,"creditHours": 5,"equivalentCourses": ["CHEM 14103","CHEM 14101","CHEM 142H3","CHEM 142H1"]},
        {"examName": "AP Computer Science A","score": 3,"creditHours": 3,"equivalentCourses": ["CSCE 20004"]},
        {"examName": "AP Drawing","score": 3,"creditHours": 3,"equivalentCourses": ["ARTS 10133"]},
        {"examName": "AP English Language and Composition","score": 3,"creditHours": 3,"equivalentCourses": ["ENGL 10103"]},
        {"examName": "AP English Language and Composition","score": 5,"creditHours": 3,"equivalentCourses": ["ENGL 101H3"]},
        {"examName": "AP English Literature and Composition","score": 3,"creditHours": 3,"equivalentCourses": ["ENGL 11103"]},
        {"examName": "AP English Literature and Composition","score": 5,"creditHours": 3,"equivalentCourses": ["ENGL 111H3"]},
        {"examName": "AP Environmental Science","score": 3,"creditHours": 3,"equivalentCourses": ["GEOL 11203","GEOL 11201"]},
        {"examName": "AP French Language and Culture","score": 3,"creditHours": 3,"equivalentCourses": ["FREN 10203","FREN 20103"]},
        {"examName": "AP French Language and Culture","score": 4,"creditHours": 4,"equivalentCourses": ["FREN 10203","FREN 20103","FREN 20203"]},
        {"examName": "AP French Language and Culture","score": 5,"creditHours": 5,"equivalentCourses": ["FREN 10203","FREN 20103","FREN 20203","FREN 30003"]},
        {"examName": "AP German Language and Culture","score": 3,"creditHours": 3,"equivalentCourses": ["GERM 10203","GERM 20103"]},
        {"examName": "AP German Language and Culture","score": 4,"creditHours": 4,"equivalentCourses": ["GERM 10203","GERM 20103","GERM 20203"]},
        {"examName": "AP German Language and Culture","score": 5,"creditHours": 5,"equivalentCourses": ["GERM 10203","GERM 20103","GERM 20203","GERM 30003"]},
        {"examName": "AP Human Geography","score": 3,"creditHours": 3,"equivalentCourses": ["GEOG 11103"]},
        {"examName": "AP Macroeconomics","score": 3,"creditHours": 3,"equivalentCourses": ["ECON 21003"]},
        {"examName": "AP Microeconomics","score": 3,"creditHours": 3,"equivalentCourses": ["ECON 22003"]},
        {"examName": "AP Music Theory","score": 3,"creditHours": 3,"equivalentCourses": ["MUSC 10003","MUTH 10003"]},
        {"examName": "AP Music Theory","score": 4,"creditHours": 4,"equivalentCourses": ["MUSC 10003","MUTH 10003","MUTH 16003","MUTH 16201"]},
        {"examName": "AP Music Theory","score": 5,"creditHours": 5,"equivalentCourses": ["MUSC 10003","MUTH 10003","MUTH 16003","MUTH 16201","MUTH 16301","MUTH 26003"]},
        {"examName": "AP Physics 1","score": 3,"creditHours": 4,"equivalentCourses": ["PHYS 20103","PHYS 20101"]},
        {"examName": "AP Physics 1","score": 4,"creditHours": 4,"equivalentCourses": ["PHYS 20304"]},
        {"examName": "AP Physics 1","score": 5,"creditHours": 4,"equivalentCourses": ["PHYS 203H4"]},
        {"examName": "AP Physics 2","score": 3,"creditHours": 4,"equivalentCourses": ["PHYS 20203","PHYS 20201"]},
        {"examName": "AP Physics C: Electricity and Magnetism","score": 3,"creditHours": 4,"equivalentCourses": ["PHYS 20404"]},
        {"examName": "AP Physics C: Electricity and Magnetism","score": 5,"creditHours": 4,"equivalentCourses": ["PHYS 204H4"]},
        {"examName": "AP Physics C: Mechanics","score": 3,"creditHours": 4,"equivalentCourses": ["PHYS 20304"]},
        {"examName": "AP Physics C: Mechanics","score": 5,"creditHours": 4,"equivalentCourses": ["PHYS 203H4"]},
        {"examName": "AP Precalculus","score": 3,"creditHours": 3,"equivalentCourses": ["MATH 13004"]},
        {"examName": "AP Psychology","score": 3,"creditHours": 3,"equivalentCourses": ["PSYC 20003"]},
        {"examName": "AP Spanish Language and Culture","score": 3,"creditHours": 3,"equivalentCourses": ["SPAN 10203","SPAN 20103"]},
        {"examName": "AP Spanish Language and Culture","score": 4,"creditHours": 9,"equivalentCourses": ["SPAN 10203","SPAN 20103","SPAN 20203"]},
        {"examName": "AP Spanish Language and Culture","score": 5,"creditHours": 12,"equivalentCourses": ["SPAN 10203","SPAN 20103","SPAN 20203","SPAN 30003"]},
        {"examName": "AP Spanish Literature and Culture","score": 3,"creditHours": 3,"equivalentCourses": ["SPAN 202H3"]},
        {"examName": "AP Spanish Literature and Culture","score": 5,"creditHours": 3,"equivalentCourses": ["SPAN 31003"]},
        {"examName": "AP Statistics","score": 3,"creditHours": 3,"equivalentCourses": ["MATH 21003"]},
        {"examName": "AP Statistics","score": 4,"creditHours": 3,"equivalentCourses": ["MATH 21003","STAT 28233"]},
        {"examName": "AP United States Government and Politics","score": 3,"creditHours": 3,"equivalentCourses": ["PLSC 20003"]},
        {"examName": "AP United States Government and Politics","score": 5,"creditHours": 3,"equivalentCourses": ["PLSC 200H3"]},
        {"examName": "AP United States History","score": 3,"creditHours": 3,"equivalentCourses": ["HIST 20003","HIST 20103"]},
        {"examName": "AP United States History","score": 5,"creditHours": 6,"equivalentCourses": ["HIST 20003","HIST 20103"]},
        {"examName": "AP World History: Modern","score": 3,"creditHours": 3,"equivalentCourses": ["HIST 11193","HIST 11293"]},
        {"examName": "AP World History: Modern","score": 5,"creditHours": 6,"equivalentCourses": ["HIST 11193","HIST 11293"]},
    ];

    // --- LOGIC FOR SINGLE-SELECT DROPDOWN ---
    document.querySelectorAll('.custom-dropdown').forEach(dropdown => {
        const searchInput = dropdown.querySelector('input[type="text"]');
        const dropdownMenu = dropdown.querySelector('.custom-dropdown-menu');
        const optionsList = dropdown.querySelector('.custom-dropdown-options');
        const arrowContainer = dropdown.querySelector('.dropdown-arrow-container');
        const arrow = arrowContainer.querySelector('.dropdown-arrow');
        const options = JSON.parse(searchInput.dataset.options || '[]');
        let originalPlaceholder = searchInput.placeholder;
        const populateOptions = (filter = '') => {
            optionsList.innerHTML = '';
            const filteredOptions = options.filter(option => option.toLowerCase().includes(filter.toLowerCase()));
            filteredOptions.forEach(optionText => {
                const li = document.createElement('li');
                li.textContent = optionText;
                li.addEventListener('mousedown', () => {
                    searchInput.value = optionText;
                    originalPlaceholder = optionText;
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

    // --- REUSABLE LOGIC FOR MULTI-SELECT DROPDOWNS ---
    const createMultiSelect = (dropdownElement) => {
        const header = dropdownElement.querySelector('.multi-select-header');
        const display = dropdownElement.querySelector('.selected-items-display');
        const menu = dropdownElement.querySelector('.custom-dropdown-menu');
        const optionsList = dropdownElement.querySelector('.custom-dropdown-options');
        const arrow = dropdownElement.querySelector('.dropdown-arrow');
        const placeholder = display.querySelector('.placeholder-text');
        const allOptions = JSON.parse(dropdownElement.dataset.options || '[]');
        const processedOptions = allOptions.map(option => {
            const abbreviation = apAbbreviations[option];
            const display = abbreviation ? abbreviation : option.split(' - ')[0];
            return { value: option, display: display };
        });
        let selectedOptions = [];
        const renderPills = () => {
            display.innerHTML = '';
            if (selectedOptions.length === 0) { display.appendChild(placeholder); } 
            else {
                processedOptions.forEach(({ value, display: displayText }) => {
                    if (selectedOptions.includes(value)) {
                        const pill = document.createElement('div');
                        pill.className = 'item-pill';
                        pill.textContent = displayText;
                        const closeBtn = document.createElement('button');
                        closeBtn.className = 'pill-close-btn';
                        closeBtn.innerHTML = '&times;';
                        closeBtn.addEventListener('click', (e) => { e.stopPropagation(); toggleOption(value); });
                        pill.appendChild(closeBtn);
                        display.appendChild(pill);
                    }
                });
            }
        };
        const populateOptions = () => {
            optionsList.innerHTML = '';
            processedOptions.forEach(({ value, display }) => {
                const li = document.createElement('li');
                li.textContent = display;
                if (selectedOptions.includes(value)) { li.classList.add('selected'); }
                li.addEventListener('mousedown', (e) => { e.preventDefault(); toggleOption(value); });
                optionsList.appendChild(li);
            });
        };
        const toggleOption = (optionValue) => {
            const index = selectedOptions.indexOf(optionValue);
            if (index > -1) { selectedOptions.splice(index, 1); } else { selectedOptions.push(optionValue); }
            renderPills();
            populateOptions();
        };
        header.addEventListener('click', () => {
            const isOpen = menu.classList.toggle('open');
            arrow.classList.toggle('open', isOpen);
            if (isOpen) populateOptions();
        });
        return { getSelectedItems: () => [...selectedOptions], clearSelection: () => { selectedOptions = []; renderPills(); } };
    };
    const apSelect = createMultiSelect(document.getElementById('ap-exam-select'));
    const courseSelect = createMultiSelect(document.getElementById('transfer-course-select'));

    // --- STAGE COURSES BUTTON LOGIC ---
    const stageButton = document.getElementById('stage-courses-btn');
    const stagedContainer = document.getElementById('staged-courses-container');

    // MODIFIED: This function now appends courses instead of replacing them.
    stageButton.addEventListener('click', () => {
        const allSelected = [...apSelect.getSelectedItems(), ...courseSelect.getSelectedItems()];

        if (allSelected.length === 0) {
            return; // Do nothing if no new courses are selected
        }

        // Find an existing list or create a new one
        let list = stagedContainer.querySelector('ul');
        if (!list) {
            stagedContainer.innerHTML = ''; // Clear placeholder text
            list = document.createElement('ul');
            stagedContainer.appendChild(list);
        }

        // Append the newly selected items to the list
        allSelected.forEach(item => {
            const listItem = document.createElement('li');
            listItem.textContent = item;
            list.appendChild(listItem);
        });

        // Clear the selection from the dropdowns
        apSelect.clearSelection();
        courseSelect.clearSelection();
    });

    // --- Close dropdowns when clicking outside ---
    document.addEventListener('click', (e) => {
        document.querySelectorAll('.multi-select-dropdown, .custom-dropdown').forEach(dropdown => {
            if (!dropdown.contains(e.target)) {
                const menu = dropdown.querySelector('.custom-dropdown-menu');
                const arrow = dropdown.querySelector('.dropdown-arrow');
                if (menu) menu.classList.remove('open');
                if (arrow) arrow.classList.remove('open');
            }
        });
    });

    // --- AP EQUIVALENCY DISPLAY FUNCTIONS ---
    const groupEquivalenciesByName = (equivalencies) => {
        return equivalencies.reduce((acc, current) => {
            if (!acc[current.examName]) {
                acc[current.examName] = [];
            }
            acc[current.examName].push({
                score: current.score,
                creditHours: current.creditHours,
                equivalentCourses: current.equivalentCourses,
            });
            return acc;
        }, {});
    };

    const displayEquivalencies = (universityName) => {
        const container = document.getElementById('equivalency-display-container');
        const groupedData = groupEquivalenciesByName(apEquivalencies);
        
        container.innerHTML = '';
        
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
                    <thead>
                        <tr>
                            <th>Score</th>
                            <th>Credit</th>
                            <th>Equivalent Courses</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows}
                    </tbody>
                </table>
            `;
            container.appendChild(card);
        }
    };
});
let isActive = false;
let addedElements = [];
let hiddenYear = null;
let activeColorMode = localStorage.getItem('activeColorMode');

const removeUselessButton = (length) => {
    var detailsButton = document.getElementsByClassName('mdl-button__ripple-container');
    if (detailsButton.length > length + 1) {
        for (let i = 0; i < detailsButton.length - 1 - length; i++) {
            detailsButton[i + 1].parentNode.remove();
        }
    }
};

const patchYear = (year) => {
    if (hiddenYear) hiddenYear.hidden = false;
    const tmp = findElemByText('li', year, XPathResult.FIRST_ORDERED_NODE_TYPE);

    if (tmp) hiddenYear = tmp.singleNodeValue;
    if (hiddenYear) hiddenYear.hidden = true;
};

const findElemByText = (tag, text, xpathType) => {
    const node = document.evaluate(`//${tag}[text()="${text}"]`, document, null, xpathType, null);
    return node;
};

const insertCircle = (proj) => {
    const percentage = getPercentage(proj.results);

    const projectNode = findElemByText('span', proj.project.name, XPathResult.FIRST_ORDERED_NODE_TYPE)?.singleNodeValue;
    const circle = document.createElement('div');
    circle.classList.add(
        'progress--circle',
        'center-circle',
        'mobile',
        'computer',
        'tablet',
        `progress--${Math.round(percentage / 5) * 5}`,
    );

    const percent = document.createElement('div');
    percent.classList.add('progress__number');
    percent.innerHTML = percentage;

    circle.appendChild(percent);

    insertAfter(circle, projectNode?.parentNode?.parentNode);
};

const getYear = (url) => {
    return url.split('#')[1].slice(0, 4);
};

const insertAfter = (newNode, referenceNode) => {
    if (referenceNode) {
        referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
        addedElements.push(newNode);
    }
};

const getPercentage = (results) => {
    let total = 0;
    let passed = 0;
    for (const [key, value] of Object.entries(results.skills)) {
        total += value.count;
        passed += value.passed;
    }

    return Math.round(Number.parseFloat((passed / total) * 100)) != (passed / total) * 100
        ? Number.parseFloat((passed / total) * 100).toFixed(1)
        : (passed / total) * 100;
};

const fetchData = async (year) => {
    try {
        console.log(year);
        const res = await fetch(`https://api.epitest.eu/me/${year}`, {
            headers: {
                authorization: `Bearer ${localStorage.getItem('argos-elm-openidtoken')}`,
            },
            method: 'GET',
        });
        const data = await res.json();
        return data;
    } catch (e) {
        console.log(e);
    }
};

const patchMyEpitech = async () => {
    isActive = true;
    try {
        const currentYear = getYear(window.location.href);
        patchYear(currentYear);
        const projects = await fetchData(currentYear);
        removeUselessButton(projects.length);
        stockProj = projects;

        // const coverage = findElemByText('div', 'Coverage', XPathResult.ANY_TYPE);
        // var node,
        //     nodes = [];
        // while ((node = coverage.iterateNext())) nodes.push(node);
        // console.log(nodes);

        projects.map((proj) => {
            try {
                insertCircle(proj);
                // if (
                //     proj.results.externalItems.find((elem) => elem.type === 'coverage.branches')?.value === 0 &&
                //     proj.results.externalItems.find((elem) => elem.type === 'coverage.lines')?.value === 0
                // )
            } catch (e) {
                console.log(e);
            }
        });
    } catch (e) {
        console.log(e);
    }
    isActive = false;
};

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    if (request.message === 'refresh' && !isActive) {
        addedElements.map((elem) => elem.remove());
        addedElements = [];
        setTimeout(async () => await patchMyEpitech(), 100);
    }
});

const add_colormode_button = () => {
    var selectList = document.createElement("select");
    
    selectList.title = 'Color Mode';
    selectList.id = 'mySelect';

    var array = ["Color Mode", "Normal","Deutéranope","Protanope","Tritanope"];

    document.body.getElementsByTagName('header')[0].getElementsByTagName("div")[0].appendChild(selectList);
    for (var i = 0; i < array.length; i++) {
        var option = document.createElement("option");
        option.value = i;
        option.text = array[i];
        option.id = 'cell-opt';
        selectList.appendChild(option);
        if (i == 0)
            option.hidden = true;
    }
    selectList.value = 0;

    selectList.onchange = (el) => {
        activeColorMode = selectList.value;
        localStorage.setItem('activeColorMode', activeColorMode);
        set_colorMode(activeColorMode);
        selectList.value = 0;
    };
};

const set_colorMode = (color) => {
    var r = document.querySelector(':root');

    if(color == 1) {
        r.style.setProperty('--color_good', '#33c939');
        r.style.setProperty('--color_good_fade', '#d3f6d5');
        r.style.setProperty('--color_mid', '#fea403');
        r.style.setProperty('--color_mid_fade', '#ffeccd');
        r.style.setProperty('--color_bad', '#ff0000');
        r.style.setProperty('--color_bad_fade', '#ffcccc');
    } if(color == 2) {
        r.style.setProperty('--color_good', '#e6ac2f');
        r.style.setProperty('--color_good_fade', '#f1eeee');
        r.style.setProperty('--color_mid', '#ffe700');
        r.style.setProperty('--color_mid_fade', '#f1eeee');
        r.style.setProperty('--color_bad', '#9f8500');
        r.style.setProperty('--color_bad_fade', '#f1eeee');
    } if(color == 3) {
        r.style.setProperty('--color_good', '#ab9b70');
        r.style.setProperty('--color_good_fade', '#f1eeee');
        r.style.setProperty('--color_mid', '#ffe900');
        r.style.setProperty('--color_mid_fade', '#f1eeee');
        r.style.setProperty('--color_bad', '#826c05');
        r.style.setProperty('--color_bad_fade', '#f1eeee');
    } if(color == 4) {
        r.style.setProperty('--color_good', '#0ba0cb');
        r.style.setProperty('--color_good_fade', '#f1eeee');
        r.style.setProperty('--color_mid', '#ffdde3');
        r.style.setProperty('--color_mid_fade', '#f1eeee');
        r.style.setProperty('--color_bad', '#d1b1b6');
        r.style.setProperty('--color_bad_fade', '#f1eeee');
    }
}

const init_colorMode = () => {
    if (!activeColorMode) {
        activeColorMode = 1;
    }
    set_colorMode(activeColorMode);
}

const launchScript = () => {
    if (window.location.href.includes('#')) {
        patchMyEpitech();
        init_colorMode();
        add_colormode_button();
    }
};

window.onload = launchScript();
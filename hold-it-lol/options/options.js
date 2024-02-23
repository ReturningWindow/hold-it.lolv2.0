'use strict';

let toggleHovering = null;
let optionChanged = false;
const tabs = [
    {
        title: 'Convenience',
        items: [
            { key: 'auto-record', title: 'Auto-recording', description: 'Automatically start recording joined courtrooms (saving is manual).', preview: 'previews/auto-record.png' },
            { key: 'save-last-character', title: 'Remember last character', description: 'The last character you used (with the extension on) is selected by default in the next court.', preview: 'previews/save-last-character.png' },
            { key: 'unblur-low-res', title: 'Unblur pixel characters', description: 'Makes character poses with low resolutions sharp instead of blurry.', preview: 'previews/unblur-low-res.png' },
            { key: 'disable-testimony-shortcut', title: 'Disable T key', description: 'Turn off the "T" hotkey that toggles "give testimony".', preview: 'previews/disable-testimony-shortcut.png' },
            { key: 'now-playing', title: '"Now playing..." display', description: 'Shows the name given to the currently playing track.', preview: 'previews/now-playing.png' },
            // { key: 'merge-characters', title: 'Merge characters', description: 'Merge poses from multiple characters to work like a single character.', preview: 'previews/merge-characters.png' },
            { key: 'menu-auto-close', title: 'Auto-closing menus', description: 'Automatically close formatting menus after you\'ve used them.', preview: 'previews/menu-auto-close.webp' },
            { key: 'menu-hover', title: 'Open menus by hovering', description: 'Open formatting menus by hovering over them instead of clicking.', preview: 'previews/menu-hover.webp' },
            { key: 'sound-insert', title: 'Quick sounds and music', description: 'Add sounds just by clicking on them in the list (without pressing "insert tag")<br>(Hold "SHIFT" to suppress)', preview: 'previews/sound-insert.webp' },
        ],
    },
    {
        title: 'Messages',
        items: [
            { key: 'newlines', title: 'New lines', description: 'Shift+Enter adds a new line.', preview: 'previews/newlines.png' },
            { key: 'fix-tag-nesting', title: 'Fix tags inside color tags', description: 'Fixes tags inside of color tags such as [#/r][#bgs1][/#] not working.', preview: 'previews/fix-tag-nesting.png' },
            { key: 'more-color-tags', title: 'More color tags', description: 'Converts [#/y], [#/w] and [#/dr] into valid color tags.', preview: 'previews/more-color-tags.png' },
            { key: 'no-talk-toggle', title: '"No talking" toggle', description: 'Disables your character\'s talking animation, just like in Objection Maker.', preview: 'previews/no-talk-toggle.png' },
            { key: 'dont-delay-toggle', title: '"Don\'t Delay Dialogue" toggle', description: 'Adds the "Don\'t Delay Dialogue" toggle from Objection Maker.', preview: 'previews/dont-delay-toggle.png' },
            { key: 'comma-pause', title: 'Quickly typing pauses', description: 'Press , again after a , or other punctuation marks to add pauses.<br>(Typing more , increases the delay.)', preview: 'previews/comma-pause.webp' },
            { key: 'ctrl-effects', title: 'Effect hotkeys', description: 'Quickly add the Flash and Shake tags by pressing CTRL + 1, CTRL + 2, or CTRL + 3.', preview: 'previews/ctrl-effects.webp' },
            { key: 'alt-colors', title: 'Color hotkeys', description: 'Quickly color selected text red, blue or green by pressing ALT + 1, ALT + 2, or ALT + 3.', preview: 'previews/alt-colors.webp' },
            { key: 'dual-button', title: 'Dual effect button', description: 'Insert both Flash and Shake at the same time.', preview: 'previews/dual-button.png' },
            { key: 'smart-tn', title: 'Smart "to normal" poses', description: 'When switching poses, automatically plays the last pose\'s "to normal" if available.<br>(Lags less without Preload Resources.)', preview: 'previews/smart-tn.webp' },
        ],
    },
    {
        title: 'Interface',
        items: [
            { key: 'old-toggles', title: 'Classic toggles', description: 'Toggles like "Pre-animate" are accessible outside of a menu (as it was in the past).', preview: 'previews/old-toggles.png' },
            { key: 'old-bubbles', title: 'Classic speech bubbles', description: 'Speech bubbles are selected from a column of buttons instead of a dropdown (as it was in the past).', preview: 'previews/old-bubbles.png' },
            { key: 'convert-chat-urls', title: 'Clickable chat links', description: 'URLs in chat messages become clickable. You can <i>also</i> right click to quickly save sounds & music.', preview: 'previews/convert-chat-urls.png' },
            // { key: 'chat-timestamps', title: 'Chat timestamps', description: 'Shows the time at which a message was sent in the chat log.', preview: 'previews/chat-timestamps.png' },
            // { key: 'chat-backlog-indicator', title: 'Show message backlog', description: 'Shows the amount of messages currently waiting to be displayed.', preview: 'previews/chat-backlog-indicator.png' },
            { key: 'volume-sliders', title: 'Separate volume sliders', description: 'Adjust the volume of music and sound effects separately.', preview: 'previews/volume-sliders.png' },
            { key: 'fullscreen-evidence', title: 'Fullscreen in court record', description: 'Mention full-screen evidence from the court record.', preview: 'previews/fullscreen-evidence.png' },
            { key: 'spectator-preload', title: '"Preload Resources" while spectating', description: 'Toggle "Preload Resources" while spectating.', preview: 'previews/spectator-preload.png' },
            { key: 'reload-ccs', title: '"Reload custom characters"', description: 'Reload others\' custom characters from Settings to see their changes without reloading the page.', preview: 'previews/reload-ccs.png' },
            // { key: 'drag-pair-offset', title: 'Drag paired character', description: 'Drag your character around the frame to offset them in pairing.', preview: 'previews/drag-pair-offset.png' },
        ],
    },
    {
        title: 'Moderation',
        items: [
            { key: 'remute', title: 'Automatic re-mute', description: '(Discord auth required) Automatically re-mutes a muted user if they rejoin.', preview: 'previews/remute.png' },
            { key: 'chat-moderation', title: 'Moderate from chat log', description: 'Quickly mute or ban using buttons next to their messages.', preview: 'previews/chat-moderation.png' },
            { key: 'list-moderation', title: 'Moderate from user list', description: 'Quickly mute, ban anyone or make them a moderator from the user list.', preview: 'previews/list-moderation.png' },
            { key: 'mute-character', requires: 'list-moderation', title: 'Hide character', description: 'Someone\'s character is laggy or unpleasant? Mute just the character, while still seeing their messages.', preview: 'previews/mute-character.png', requires: 'list-moderation' },
        ],
    },
    {
        title: 'New features',
        items: [
            { key: 'testimony-mode', title: 'Roleplay testimony', description: 'A witness testimony player for roleplay cases.', preview: 'previews/testimony-mode.png' },
            { key: 'bulk-evidence', title: 'Add evidence from table', description: 'Automatically add lots of evidence via a copy-pasted table from a document.<br>(Works with tables where each evidence takes up a row)', preview: 'previews/bulk-evidence.png' },
            //{key: 'dual-wield', title: 'Dual wield', description: 'Control two paired characters at the same time.', preview: 'previews/placeholder.png'},
            { key: 'extended-log', title: 'Extended Log', description: 'A plainer, but longer and more detailed chat log mode.<br>(Can be useful to stenograph roleplay cases)', preview: 'previews/extended-log.png' },
            { key: 'quick-sfx', title: 'Quick sound effects', description: 'Save and quickly insert sounds from a row of sound effects.', preview: 'previews/quick-sfx.png' },
            { key: 'tts', title: 'Text-to-speech', description: 'Everyone speaks in text-to-speech voices lol', preview: 'previews/tts.png' },
            { key: 'pose-icon-maker', title: 'Pose icon maker', description: 'Add pose icons to characters that lack them using an in-courtroom editor.', preview: 'previews/pose-icon-maker.png' },
            { key: 'export-cc-images', title: 'Custom character archiver', description: 'Download and preserve character images.<br>(Warning: downloads will lag and may disconnect your current courtroom page)', preview: 'previews/export-cc-images.png' },
        ],
    },
    {
        title: 'Music Packs',
        items: [
            { key: 'ost-pw', title: 'Phoenix Wright: Ace attorney', description: 'These music packs will automatically add all songs from their game into your music list.' },
            { key: 'ost-jfa', title: 'Justice for All', description: 'Note: the songs in all music packs do not loop; most of them end in a fade-out.' },
            { key: 'ost-t&t', title: 'Trials and Tribulations', description: 'Note: these music packs only apply to Courtrooms.' },
            { key: 'ost-aj', title: 'Apollo Justice: Ace attorney', description: '' },
            { key: 'ost-dd', title: 'Dual Destinies', description: '' },
            { key: 'ost-soj', title: 'Spirit of Justice', description: '' },
            { key: 'ost-tgaa1', title: 'The Great Ace Attorney: Adventures', description: '' },
            { key: 'ost-tgaa2', title: 'The Great Ace Attorney: Resolve', description: '' },
            { key: 'ost-aai1', title: 'Ace Attorney Investigations: Miles Edgeworth', description: '' },
            { key: 'ost-aai2', title: 'Ace Attorney Investigations 2: Prosecutor\'s Path', description: '' },
            { key: 'ost-pl', title: 'Professor Layton vs. Phoenix Wright: Ace Attorney', description: '' },
        ],
    },
];

function _readme() {
    let s = '';
    for (let category of tabs) {
        s += `<details><summary>${category.title}</summary><br><blockquote><table>\n`;
        // s += `<tr><td>${category.title}</td><td>Use Ace Attorney songs from any game in objection.lol beyond the default music.</td></tr>\n`;
        if (category.title === 'Music Packs') {

            let first = true;
            for (let item of category.items) {
                s += `<tr><td>${item.title}</td><td>`;
                if (first) s += "Use Ace Attorney songs from any game in objection.lol beyond the default music.";
                s += `</td></tr>\n`;
                first = false;
            }

        } else {

            for (let item of category.items) {
                s += `<tr><td>${item.title}</td><td>${item.description}</td></tr>\n`
            }

        }
        s += `</table></blockquote><br></details>\n`
    }
    return s;
}

function optionSet(key, value) {
    chrome.storage.local.get('options', function (result) {
        const options = result.options || {};
        options[key] = value;
        options['seen-tutorial'] = true;
        chrome.storage.local.set({ 'options': options });
    });
}

function createSwitch(onchange) {
    const label = document.createElement('div');
    label.className = 'hil-toggle';
    const input = document.createElement('input');
    input.setAttribute('type', 'checkbox');
    input.style.setProperty('display', 'none');

    label.set = function(val) {
        if (label.classList.contains('force-disabled')) return;
        if (input.checked == Boolean(val)) return;
        input.checked = val;
        toggleHovering = input.checked;
        document.body.style.cssText = 'cursor: pointer !important';
        onchange(input.checked);
    }

    label.addEventListener('mousedown', function (e) {
        label.set(!input.checked);
        e.preventDefault();
    });

    const span = document.createElement('span');
    span.className = 'switch';
    const handle = document.createElement('span');
    handle.className = 'handle';

    label.appendChild(input);
    label.appendChild(span);
    label.appendChild(handle);
    return label;
}

function createTabRow(tab) {
    const row = document.createElement('div');
    row.className = 'row hoverable row-tab';
    const title = document.createElement('span');
    title.textContent = tab.title;
    row.appendChild(title);

    const arrow = document.createElement('div');
    arrow.className = 'tab-arrow';
    arrow.innerHTML = '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z"></path></svg>';
    row.appendChild(arrow);

    return row;
}

function createTabSection(tab) {
    const section = document.createElement('div');
    section.className = 'tab-section';
    return section;
}

function createTab(tab) {
    const row = createTabRow(tab);
    const section = createTabSection(tab);
    row.addEventListener('click', function () {
        const expanded = !row.classList.contains('expanded');
        for (let expandedRow of document.querySelectorAll('.expanded')) {
            expandedRow.classList.remove('expanded');
            expandedRow.nextElementSibling.style.maxHeight = null;
        }
        if (expanded) {
            row.classList.add('expanded');
            section.style.maxHeight = section.scrollHeight + "px";
        }
    })
    return [row, section];
}

const requireeRows = new Map();
function createOptionRow(option, optionList) {
    const row = document.createElement('div');
    row.className = 'row hoverable row-option';
    
    if (option.requires !== undefined) {
        requireeRows.set(option.key, row);
        row.classList.add('row-disabled');
        const indent = document.createElement('div');
        indent.className = 'option-indent';
        row.appendChild(indent);
    }

    const titleContainer = document.createElement('div');
    titleContainer.className = 'label-container';
    row.appendChild(titleContainer);

    const title = document.createElement('div');
    const desc = document.createElement('div');
    title.className = 'option-label';
    desc.className = 'option-label option-desc';
    title.textContent = option.title;
    desc.innerHTML = option.description;
    titleContainer.appendChild(title);
    titleContainer.appendChild(desc);

    const requirees = [];
    for (let otherOption of optionList) {
        if (otherOption.requires !== option.key) continue;
        requirees.push(otherOption.key);
    }
    const isRequirement = requirees.length > 0;

    const optionSwitch = createSwitch(function(checked) {
        if (row.classList.contains('force-disabled')) return;
        optionSet(option.key, checked);
        optionChanged = true;
        if (isRequirement) requirees.forEach(function(key) {
            const optionRow = requireeRows.get(key);
            const disabledMethod = checked ? 'remove' : 'add';
            optionRow.classList[disabledMethod]('row-disabled');
            optionRow.querySelector('.hil-toggle').classList[disabledMethod]('force-disabled');
        });
    });
    if (option.requires !== undefined) optionSwitch.classList.add('force-disabled');
    row.appendChild(optionSwitch);

    row.addEventListener('mouseenter', function () {
        if (toggleHovering === null) return;
        optionSwitch.set(toggleHovering);
    })

    if (option.preview) {
        const preview = document.createElement('div');

        const previewHeader = document.createElement('div');
        preview.appendChild(previewHeader);
        const span = document.createElement('span');
        span.textContent = option.title;
        previewHeader.appendChild(span);

        const previewImg = document.createElement('img');
        preview.className = "preview";
        previewImg.src = option.preview;
        preview.appendChild(previewImg);

        row.addEventListener('mouseenter', function () {
            const left = optionSwitch.getClientRects()[0].right;
            if (left < window.innerWidth - 300) {
                preview.style.setProperty('--left', (left + 20) + 'px');
                const top = row.getClientRects()[0].top;
                preview.style.setProperty('top', (top > (window.innerHeight - previewImg.offsetHeight * 1.25) ? (window.innerHeight - previewImg.offsetHeight * 1.25) : top) + 'px');
            } else {
                preview.style.setProperty('--left', (window.innerWidth - 400) + 'px');
                const bottom = row.getClientRects()[0].bottom;
                preview.style.setProperty('top', (bottom < (window.innerHeight - previewImg.offsetHeight * 1.25) ? row.getClientRects()[0].bottom : row.getClientRects()[0].top - previewImg.offsetHeight * 1.25) + 'px');
            }
            previewHeader.style.setProperty('height', previewImg.offsetHeight / 4 + 'px');
            preview.style.opacity = "1";
        })
        row.addEventListener('mouseleave', function () {
            preview.style.opacity = null;
        })
        row.appendChild(preview);
    }

    return row;
}

function error(text) {
    const elem = document.querySelector('.error');
    elem.firstElementChild.textContent = text;
    elem.style.maxHeight = 'var(--header-height)';
}

let courtroomOpen = false;
if (chrome.storage !== undefined) {
    chrome.tabs.query(
        {
            "url": "*://objection.lol/courtroom/*"
        },
        function (tabs) {
            if (tabs.length > 0) courtroomOpen = true;
        }
    );
}

function main() {
    if (chrome.storage === undefined) {
        error('Please open this page from the pop-up or chrome://extensions to change options.');
        return;
    }

    document.addEventListener('mouseup', function () {
        toggleHovering = null;
        document.body.style.cssText = '';
        if (optionChanged && courtroomOpen) error('Reload your objection.lol/courtroom to see the changes.');
    });

    const mainDiv = document.querySelector('.main');
    const optionList = tabs.map(tab => tab.items).reduce((options, tab) => options.concat(tab), []);
    const optionSwitches = {};
    for (let tab of tabs) {
        const [tabRow, section] = createTab(tab);
        mainDiv.appendChild(tabRow);
        mainDiv.appendChild(section);
        for (let option of tab.items) {
            const optionRow = createOptionRow(option, optionList);
            section.appendChild(optionRow);
            optionSwitches[option.key] = optionRow.querySelector('input');
        }
    }
    chrome.storage.local.get('options', function (result) {
        const options = result.options || {};
        for (let key of Object.keys(optionSwitches)) {
            const input = optionSwitches[key];
            input.checked = options[key] !== undefined ? options[key] : false;
        }
        requireeRows.forEach(function(optionRow, key) {
            const option = optionList.find(option => option.key === key);
            if (!options[option.requires]) return;
            optionRow.classList.remove('row-disabled');
            optionRow.querySelector('.hil-toggle').classList.remove('force-disabled');
        })
    });
}
window.addEventListener('load', main);

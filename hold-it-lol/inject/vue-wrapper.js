"use strict";

const { addMessageListener, addMessageListenerAll, compareShallow, setValue, getLabel, createButton, createIcon, createTooltip, setSlider, sliderListener, htmlToElement, wait, fixTagNesting, getHTMLOfSelection, createSwitch } = hilUtils;

function main() {

    const socketStates = {
        options: undefined
    }
    socketStates.optionsLoaded = new Promise(function (resolve, reject) {
        socketStates.optionsLoadedResolve = resolve;
    });
    const modifierKeys = {};
    const muteCharacters = {
        defense: { characterId: 669437, poseId: 8525792 },
        prosecution: { characterId: 669438, poseId: 8525810 },
        witness: { characterId: 669439, poseId: 8525809 },
        counsel: { characterId: 669440, poseId: 8525795 },
        judge: { characterId: 669441, poseId: 8525794 },
        fallback: { characterId: 669439, poseId: 8525809 },
    }

    const app = document.querySelector('#app');
    const appState = app.__vue__.$store.state;
    const socket = document.querySelector('.v-main__wrap > div').__vue__.$socket;
    const roomInstance = document.querySelector('div.v-card--flat.v-sheet[style="max-width: 960px;"]').parentElement.__vue__;
    const toolbarInstance = document.querySelector('div.v-card--flat.v-sheet[style="max-width: 960px;"] header').__vue__.$parent; // toolbarInstance.$snotify.info(''); toolbarInstance.$snotify.warning(''); toolbarInstance.$snotify.error(''); toolbarInstance.$snotify.success(''); 
    const characterInstance = document.querySelector('.v-main__wrap > div > div.row > div:nth-child(1) > div').__vue__;
    const characterListInstance = document.querySelector('div.v-main__wrap > div > div.text-center').__vue__;
    const userInstance = document.querySelector('.v-main__wrap > div').__vue__;
    const poseInstance = document.querySelector('.col-sm-9.col-10 > div > div.swiper-container,.col-sm-9.col-10 > div > div.v-text-field').parentElement.__vue__;
    const courtContainer = document.querySelector('.court-container');
    const frameInstance = courtContainer.parentElement.parentElement.__vue__;
    const chatInstance = document.querySelector('.chat').parentElement.__vue__;
    const getLastTabInstance = () => document.querySelector('.v-window.v-item-group.v-tabs-items').firstElementChild.lastElementChild.firstElementChild.__vue__;
    function getAssetManagerInstance() {
        return app.__vue__.$children.find(function(component) {
            const tag = component.$vnode.tag;
            const name = tag.slice(tag.lastIndexOf('-'));
            return name === '-assetsManager';
        });
    }
    let muteInputInstance;
    for (let label of document.querySelectorAll('.v-select--chips.v-text-field label')) {
        if (label.textContent !== 'Muted Users') continue;
        muteInputInstance = label.parentElement.parentElement.parentElement.parentElement.__vue__;
        break;
    }

    const themeInput = (getLabel('Dark Mode') || getLabel('Light Mode')).parentElement.querySelector('input');
    function getTheme() {
        if (themeInput.ariaChecked == "true") {
            return 'theme--dark';
        } else {
            return 'theme--light';
        }
    }

    function getPresetCharacterFromPose(poseId) {
        const presetChar = characterListInstance.allCharacters.find(
            char => char.poses.find(
                pose => pose.id === poseId
            ) !== undefined
        );
        if (presetChar) return presetChar;
        else return null;
    }

    function getFrameCharacterId(frame) {
        if (frame.characterId >= 1000) return frame.characterId;

        return getPresetCharacterFromPose(frame.poseId).id;
    }

    function getMuteCharacter(charId, poseId) {
        let muteCharacter;
        if (frameInstance.customCharacters[charId]) {
            muteCharacter = muteCharacters[frameInstance.customCharacters[charId].side];
        } else if (charId < 1000) {
            muteCharacter = muteCharacters[characterListInstance.allCharacters[charId].side];
        } else if (charId === null) {
            muteCharacter = muteCharacters[getPresetCharacterFromPose(poseId).side];
        } else {
            muteCharacter = muteCharacters.fallback;
        }
        return muteCharacter
    }

    function getIDFromUsername(username, userList = muteInputInstance.items) {
        return userList.find(user => user.username === username)?.id;
    }

    const customPoseIconCCs = {};
    function updateCustomPoseIconCCs() {
        if (socketStates['customIconCharacters'] === undefined) return;
        for (let id in customPoseIconCCs) {
            if (socketStates['customIconCharacters'].includes(id)) continue;
            const character = characterListInstance.customList.find(character => character.id === Number(id));
            if (character === undefined) continue;
            if (character.poses[0].iconUrl === hilUtils.transparentGif) character.poses[0].iconUrl = '';
        }
        for (let id of socketStates['customIconCharacters']) {
            const character = characterListInstance.customList.find(character => character.id === Number(id));
            if (character === undefined) continue;
            if (character.poses[0] === undefined) continue;
            if (character.poses[0].iconUrl) continue;
            character.poses[0].iconUrl = hilUtils.transparentGif;
            customPoseIconCCs[character.id] = true;
        }
    }

    function preloadHiddenCharacters() {
        frameInstance.customCharacters[669437] = {
            "partial": true,
            "id": 669437,
            "name": "Hidden (Defense)",
            "namePlate": "Hidden",
            "side": "defense",
            "blipUrl": "/Audio/blip.wav",
            "iconUrl": null,
            "galleryImageUrl": null,
            "galleryAJImageUrl": null,
            "backgroundId": 189,
            "limitWidth": true,
            "alignment": null,
            "offsetX": 0,
            "offsetY": 0,
            "objectionVolume": 1,
            "poses": [
                {
                    "id": 8525792,
                    "name": "Stand",
                    "idleImageUrl": "https://cdn.discordapp.com/attachments/867018629089460234/984040162122149908/DefenseA.webp",
                    "speakImageUrl": "https://cdn.discordapp.com/attachments/867018629089460234/984040162369617951/DefenseB.webp",
                    "isSpeedlines": false,
                    "iconUrl": "",
                    "order": 0,
                    "musicFileName": "Trial",
                    "states": [],
                    "audioTicks": [],
                    "functionTicks": [],
                    "characterId": 669437
                }
            ],
            "bubbles": []
        };
        frameInstance.customCharacters[669438] = {
            "partial": true,
            "id": 669438,
            "name": "Hidden (Prosecution)",
            "namePlate": "Hidden",
            "side": "prosecution",
            "blipUrl": "/Audio/blip.wav",
            "iconUrl": null,
            "galleryImageUrl": null,
            "galleryAJImageUrl": null,
            "backgroundId": 194,
            "limitWidth": true,
            "alignment": null,
            "offsetX": 0,
            "offsetY": 0,
            "objectionVolume": 1,
            "poses": [
                {
                    "id": 8525810,
                    "name": "Stand",
                    "idleImageUrl": "https://cdn.discordapp.com/attachments/867018629089460234/984040162583535636/ProsecutionA.webp",
                    "speakImageUrl": "https://cdn.discordapp.com/attachments/867018629089460234/984040162805837874/ProsecutionB.webp",
                    "isSpeedlines": false,
                    "iconUrl": "",
                    "order": 0,
                    "musicFileName": "Trial",
                    "states": [],
                    "audioTicks": [],
                    "functionTicks": [],
                    "characterId": 669438
                }
            ],
            "bubbles": []
        };
        frameInstance.customCharacters[669439] = {
            "partial": true,
            "id": 669439,
            "name": "Hidden (Witness)",
            "namePlate": "Hidden",
            "side": "witness",
            "blipUrl": "/Audio/blip-female.wav",
            "iconUrl": null,
            "galleryImageUrl": null,
            "galleryAJImageUrl": null,
            "backgroundId": 197,
            "limitWidth": true,
            "alignment": null,
            "offsetX": 0,
            "offsetY": 0,
            "objectionVolume": 1,
            "poses": [
                {
                    "id": 8525809,
                    "name": "Stand",
                    "idleImageUrl": "https://cdn.discordapp.com/attachments/867018629089460234/984040163053285396/WitnessA.webp",
                    "speakImageUrl": "https://cdn.discordapp.com/attachments/867018629089460234/984040163288170537/WitnessB.webp",
                    "isSpeedlines": false,
                    "iconUrl": "",
                    "order": 0,
                    "musicFileName": "Trial",
                    "states": [],
                    "audioTicks": [],
                    "functionTicks": [],
                    "characterId": 669439
                }
            ],
            "bubbles": []
        };
        frameInstance.customCharacters[669440] = {
            "partial": true,
            "id": 669440,
            "name": "Hidden (Counsel)",
            "namePlate": "Hidden",
            "side": "counsel",
            "blipUrl": "/Audio/blip.wav",
            "iconUrl": null,
            "galleryImageUrl": null,
            "galleryAJImageUrl": null,
            "backgroundId": 187,
            "limitWidth": true,
            "alignment": null,
            "offsetX": 0,
            "offsetY": 0,
            "objectionVolume": 1,
            "poses": [
                {
                    "id": 8525795,
                    "name": "Stand",
                    "idleImageUrl": "https://cdn.discordapp.com/attachments/867018629089460234/984040163594362931/CounselA.webp",
                    "speakImageUrl": "https://cdn.discordapp.com/attachments/867018629089460234/984040163925696522/CounselB.webp",
                    "isSpeedlines": false,
                    "iconUrl": "",
                    "order": 0,
                    "musicFileName": "Trial",
                    "states": [],
                    "audioTicks": [],
                    "functionTicks": [],
                    "characterId": 669440
                }
            ],
            "bubbles": []
        };
        frameInstance.customCharacters[669441] = {
            "partial": true,
            "id": 669441,
            "name": "Hidden (Judge)",
            "namePlate": "Hidden",
            "side": "judge",
            "blipUrl": "/Audio/blip.wav",
            "iconUrl": null,
            "galleryImageUrl": null,
            "galleryAJImageUrl": null,
            "backgroundId": 192,
            "limitWidth": true,
            "alignment": null,
            "offsetX": 0,
            "offsetY": 0,
            "objectionVolume": 1,
            "poses": [
                {
                    "id": 8525794,
                    "name": "Stand",
                    "idleImageUrl": "https://cdn.discordapp.com/attachments/867018629089460234/984040164286418944/JudgeA.webp",
                    "speakImageUrl": "https://cdn.discordapp.com/attachments/867018629089460234/984040164701650944/JudgeB.webp",
                    "isSpeedlines": false,
                    "iconUrl": "",
                    "order": 0,
                    "musicFileName": "Trial",
                    "states": [],
                    "audioTicks": [],
                    "functionTicks": [],
                    "characterId": 669441
                }
            ],
            "bubbles": []
        };
        if (socketStates.options['reload-ccs']) {
            socketStates.noReloadCCs[669437] = true;
            socketStates.noReloadCCs[669438] = true;
            socketStates.noReloadCCs[669439] = true;
            socketStates.noReloadCCs[669440] = true;
            socketStates.noReloadCCs[669441] = true;
        }
    }


    window.postMessage(['wrapper_loaded']);
    addMessageListenerAll(window, async function(action, data) {
        if (action === 'set_options') {
            socketStates.options = data;
            socketStates.optionsLoadedResolve();
        } else if (action === 'set_socket_state') {
            for (const key in data) {
                socketStates[key] = data[key];
            }
        } else if (action === 'snotify') {
            toolbarInstance.$snotify[data[0]](...data.slice(1));
        } else if (action === 'clear_testimony_poses') {
            socketStates.testimonyPoses = {};
        } else if (action === 'clear_testimony_pose') {
            delete socketStates.testimonyPoses[data];
        } else if (action === 'fullscreen_button_added') {
            const presentButton = document.querySelector('[hil-button="present-evd"]');
            const fullscreenButton = document.querySelector('[hil-button="fullscreen-evd"]');
            presentButton.__vue__.$watch('classes', function () {
                fullscreenButton.className = presentButton.className;
            });
        } else if (action === 'set_preload') {
            appState.courtroom.settings.preloadEnabled = data;
        } else if (action === 'reload_ccs') {
            for (let id in frameInstance.customCharacters) {
                if (!(id in socketStates.noReloadCCs)) {
                    delete frameInstance.customCharacters[id];
                }
            };
        } else if (action === 'set_custom_icon_characters') {
            socketStates['customIconCharacters'] = data;
            updateCustomPoseIconCCs();
        } else if (action === 'zip_pose_icons') {
            const zip = new JSZip();
            for (let poseId of data) {
                const icon = document.querySelector('img.p-image[data-pose-id="' + poseId + '"]');
                if (!icon) continue;
                zip.file(
                    poseId + ".png",
                    icon.src.slice(22),
                    {base64: true}
                );
            }

            zip.generateAsync({type:"blob"}).then(function (blob) {
                const a = document.createElement('a');
                const url = window.URL.createObjectURL(blob);
                a.href = url;
                a.download = 'icons.zip';
                a.click();
                window.URL.revokeObjectURL(url);
            });

            document.querySelector('.hil-icon-export-card').classList.add('hil-hide');
        } else if (action === 'set_pose_icon_url_list') {
            characterListInstance.showAssets();
            await wait();
            const component = getAssetManagerInstance();
            if (component) {
                let char = characterInstance.currentCharacter;
                component.selectCharacter(char.id);
                component.$refs.characterPreviewer.manageCharacter();
                await new Promise(function(resolve) {
                    new MutationObserver(function(mutationRecord, observer) {
                        for (let mutation of mutationRecord) {
                            for (let elem of mutation.target.querySelectorAll('.v-window-item')) {
                                const toolbar = elem.parentElement.parentElement.parentElement.querySelector('.v-toolbar__title');
                                if (!toolbar) continue;
                                const label = toolbar.textContent;
                                const index = Array.from(elem.parentElement.childNodes).indexOf(elem);
                                if (label === 'Manage Character') {
                                    observer.disconnect();
                                    resolve();
                                }
                            }
                        }
                    }).observe(app, {
                        childList: true,
                        subtree: true,
                    });
                });
                const tabs = document.querySelectorAll('.v-slide-group__content.v-tabs-bar__content .v-tab');
                Array.from(tabs).find(tab => tab.textContent === 'Poses').click();
                await wait();
                const textArea = document.querySelector('textarea.hil-pose-icon-import');
                textArea.value = data;
                const button = document.querySelector('button.hil-pose-icon-import');
                button.click();
            }
        } else if (action === 'warn_unexported_icons') {
            socketStates['lastShareContent'].textContent += '(Warning: Has un-exported custom icons)';
        }
    });

    socketStates.optionsLoaded.then(function () {
        if (socketStates.options['testimony-mode']) socketStates['testimonyPoses'] = {};
        if (socketStates.options['list-moderation'] && socketStates.options['mute-character']) socketStates['mutedCharUsers'] = {};
        if (socketStates.options['remute']) socketStates.mutedLeftCache = {};
        if (socketStates.options['reload-ccs']) socketStates.noReloadCCs = {};
        if (socketStates.options['mute-character']) {
            socketStates['hiddenLeftCache'] = {};
            preloadHiddenCharacters(frameInstance);
        }

        app.__vue__.$watch('$store.state.assets.character.loading', function(charactersLoading) {
            if (charactersLoading) return;
            if (socketStates.options['reload-ccs']) {
                for (let character of appState.assets.character.customList) {
                    socketStates.noReloadCCs[character.id] = true;
                };
            }
        })

        if (socketStates.options['save-last-character']) {
            const storedId = localStorage['hil-last-character-id'];
            if (storedId >= 1000) {
                characterListInstance.customList.push(JSON.parse(localStorage['hil-last-cc-json']));
                characterListInstance.setCustomCharacter(storedId);
            } else if (storedId > 1) {
                characterListInstance.setCharacter(storedId);
            }

            characterInstance.$watch('currentCharacter.id', function (id) {
                localStorage['hil-last-character-id'] = id;
                if (id < 1000) return;
                localStorage['hil-last-cc-json'] = JSON.stringify(characterInstance.currentCharacter);
            });
        }
        
        if (socketStates.options['now-playing']) {
            frameInstance.$watch('musicPlayer.currentMusicUrl', function(url) {
                const musicObj = Object.values(frameInstance.$parent.$parent.musicCache).find(music => music.url === url);
                const musicSpan = document.querySelector('div.hil-tab-row-now-playing > span');
                if (musicObj && musicObj.name) {
                    const text = musicObj.name ? musicObj.name : 'Unnamed';
                    musicSpan.innerHTML = 'Now Playing: <b>"<a target="_blank" href="' + musicObj.url + '">' + text + '</a>"</b>';
                } else {
                    musicSpan.innerHTML = 'Now Playing: …';
                }
            });
        }

        if (socketStates.options['tts']) {
            const dialogueBox = document.querySelector('.v-main div.chat-box');
            let lastProcessedFrame;
            new MutationObserver(function (mutations) {
                for (let mutation of mutations) {
                    if (dialogueBox.style.display !== '') continue;
                    if (frameInstance.frame === lastProcessedFrame) continue;
                    window.postMessage([
                        'talking_started',
                        {
                            plainText: frameInstance.plainText,
                            characterId: getFrameCharacterId(frameInstance.frame),
                            username: frameInstance.frame.username,
                        }
                    ]);
                    lastProcessedFrame = frameInstance.frame;
                }
            }).observe(
                dialogueBox,
                {
                    childList: true,
                    subtree: true,
                }
            );
        }

        if (socketStates.options['list-moderation'] || socketStates.options['chat-moderation']) {
            function userActionButton(onclick, iconName, tooltipText = null, classText = '', cssText = '') {
                const button = document.createElement('button');
                button.className = classText + ' v-btn v-btn--has-bg hil-icon-button hil-icon-button-hover hil-themed ' + getTheme();
                if (cssText) button.style.cssText = cssText;

                button.appendChild(createIcon(iconName));

                if (onclick) button.addEventListener('click', () => onclick(button));
                if (tooltipText) {
                    button.addEventListener('mouseenter', function () {
                        if (button.tooltip === undefined) button.tooltip = createTooltip(tooltipText, button);
                        button.tooltip.realign();
                        button.tooltip.classList.remove('hil-hide');
                    });
                    button.addEventListener('mouseleave', () => button.tooltip.classList.add('hil-hide'));
                }

                return button;
            }

            function userActionButtonSet(usernameGetter, constantId = false) {
                const container = document.createElement('div');
                container.className = 'hil-user-action-buttons';

                const initialId = getIDFromUsername(usernameGetter());
                container.dataset.userId = initialId;
                const getId = function () {
                    if (constantId) return initialId;
                    return getIDFromUsername(usernameGetter());
                }

                const isMod = roomInstance.users.find(user => user.id === initialId)?.isMod;
                const isMuted = muteInputInstance.selectedItems.find(item => item.username === usernameGetter());

                container.appendChild(userActionButton(function () {
                    const id = getId();
                    if (id === undefined) return;

                    const mods = roomInstance.users.filter(user => user.isMod).map(user => user.id);
                    if (!mods.includes(id)) {
                        mods.push(id);
                        toolbarInstance.$snotify.info(`Made ${usernameGetter()} a moderator.`);
                    } else {
                        mods.splice(mods.indexOf(id), 1);
                        toolbarInstance.$snotify.info(`${usernameGetter()} is no longer a moderator.`);
                    }

                    socket.emit('set_mods', mods);
                },
                    isMod ? 'account-arrow-down' : 'crown',
                    isMod ? 'Remove moderator' : 'Make moderator',
                    'hil-userlist-mod',
                    userInstance.isOwner ? '' : 'display: none;')
                );

                container.appendChild(userActionButton(function () {
                    let banList = getLastTabInstance().getBanUsers.map(user => user.id);
                    banList = banList.filter(id => !roomInstance.users.map(user => user.id).includes(id));
                    banList.push(getId());
                    socket.emit('set_bans', banList);
                    toolbarInstance.$snotify.info(`Banned ${usernameGetter()}.`);
                }, 'skull', 'Ban', 'hil-userlist-ban', userInstance.isOwner || userInstance.isMod ? '' : 'display: none;'));

                container.appendChild(userActionButton(function (button) {
                    const id = getId();
                    if (id === undefined) return;
                    muteInputInstance.selectItem(id);

                    const muted = !muteInputInstance.selectedItems.find(item => item.id === id); // Counter-intuitive but trust it
                    if (muted) {
                        toolbarInstance.$snotify.info(`Muted ${usernameGetter()}.`);
                    } else {
                        toolbarInstance.$snotify.info(`Unmuted ${usernameGetter()}.`);
                    }

                    const mutedIndicatorMethod = muted ? 'add' : 'remove';
                    const unmutedIndicatorMethod = !muted ? 'add' : 'remove';
                    for (let button of document.querySelectorAll('div.hil-user-action-buttons[data-user-id="' + id + '"] .hil-userlist-mute')) {
                        button.querySelector('i').classList[unmutedIndicatorMethod]('mdi-volume-off');
                        button.querySelector('i').classList[mutedIndicatorMethod]('mdi-volume-high');
                        container.parentElement.querySelector('.hil-user-action-icons .mdi-volume-off')?.classList[unmutedIndicatorMethod]('hil-hide');
                        button.tooltip?.realign(muted ? 'Unmute' : 'Mute');
                    }
                },
                    isMuted ? 'volume-high' : 'volume-off',
                    isMuted ? 'Unmute' : 'Mute',
                    'hil-userlist-mute')
                );

                if (socketStates.options['mute-character']) {
                    const isCharacterMuted = initialId in socketStates['mutedCharUsers'];
                    container.appendChild(userActionButton(function (button) {
                        const id = getId();
                        if (id === undefined) return;

                        let currentlyMuted = id in socketStates['mutedCharUsers'];
                        if (currentlyMuted) {
                            delete socketStates['mutedCharUsers'][id];
                            toolbarInstance.$snotify.info(`Unhid ${usernameGetter()}'s character.`);
                        } else {
                            socketStates['mutedCharUsers'][id] = true;
                            toolbarInstance.$snotify.info(`Hid ${usernameGetter()}'s character.`);
                        }

                        for (const mutedId in socketStates['mutedCharUsers']) {
                            if (muteInputInstance.items.find(item => item.id === mutedId)) continue;
                            delete socketStates['mutedCharUsers'][mutedId];
                        }

                        currentlyMuted = id in socketStates['mutedCharUsers'];
                        const mutedIndicatorMethod = currentlyMuted ? 'add' : 'remove';
                        const unmutedIndicatorMethod = !currentlyMuted ? 'add' : 'remove';
                        for (let button of document.querySelectorAll('div.hil-user-action-buttons[data-user-id="' + id + '"] .hil-userlist-mute-char')) {
                            button.querySelector('i').classList[unmutedIndicatorMethod]('mdi-eye-off');
                            button.querySelector('i').classList[mutedIndicatorMethod]('mdi-eye');
                            container.parentElement.querySelector('.hil-user-action-icons .mdi-eye-off')?.classList[unmutedIndicatorMethod]('hil-hide');
                            button.tooltip?.realign(currentlyMuted ? 'Show character' : 'Hide character');
                        }
                    },
                        isCharacterMuted ? 'eye' : 'eye-off',
                        isCharacterMuted ? 'Show character' : 'Hide character',
                        'hil-userlist-mute-char')
                    );
                }

                container.removeWithTooltips = function () {
                    container.querySelectorAll('.hil-icon-button-hover').forEach(button => button.tooltip?.remove());
                    container.remove();
                }
                return container;
            }

            function userActionIconSet() {
                const container = document.createElement('div');
                container.className = 'hil-user-action-icons';
                container.appendChild(createIcon('volume-off', undefined, undefined, 'hil-hide'));
                if (socketStates.options['mute-character']) container.appendChild(createIcon('eye-off', undefined, undefined, 'hil-hide'));
                return container;
            }

            if (socketStates.options['list-moderation']) {
                function processUserListItem(userItem) {
                    const usernameElement = userItem.querySelector('.v-list-item__title');
                    if (usernameElement.innerText === userInstance.currentUser.username) return;
                    userItem.appendChild(userActionButtonSet(() => usernameElement.innerText, true));
                    const icons = userActionIconSet();
                    userItem.appendChild(icons);
                    if (muteInputInstance.selectedItems.find(user => user.username === usernameElement.innerText)) {
                        icons.querySelector('.mdi-volume-off').classList.remove('hil-hide');
                    }
                    if (socketStates.options['mute-character'] && getIDFromUsername(usernameElement.innerText) in socketStates['mutedCharUsers']) {
                        icons.querySelector('.mdi-eye-off').classList.remove('hil-hide');
                    }
                }
                
                function reloadUserList() {
                    for (let userItem of userList.children) {
                        userItem.querySelector('.hil-user-action-buttons')?.removeWithTooltips();
                        userItem.querySelector('.hil-user-action-buttons')?.removeWithTooltips();
                        processUserListItem(userItem);
                    }
                }
                
                let userList;
                const userListButton = document.querySelector('.v-icon--left.mdi-account').parentElement.parentElement;
                userListButton.addEventListener('click', function () {
                    for (let title of document.querySelectorAll('.v-toolbar__title')) {
                        if (title.innerText !== 'Users') continue;
                        
                        userList = title.parentElement.parentElement.parentElement.querySelector('.v-list');
                        for (let userItem of userList.children) {
                            processUserListItem(userItem);
                        }
                        
                        new MutationObserver(function (mutations) {
                            for (let mutation of mutations) {
                                for (let node of mutation.addedNodes) {
                                    processUserListItem(node);
                                }
                                for (let node of mutation.removedNodes) {
                                    node.querySelector('.hil-user-action-buttons')?.removeWithTooltips();
                                    reloadUserList();
                                }
                            }
                        }).observe(
                            userList, { childList: true }
                        );
                        
                        break;
                    }
                });
                
                userInstance.$watch('currentUser', function (user) {
                    if (!document.contains(userList)) return;
                    
                    if (user.isOwner) userList.querySelectorAll('.hil-userlist-mod').forEach(button => button.style.removeProperty('display'));
                    else userList.querySelectorAll('.hil-userlist-mod').forEach(button => button.style.setProperty('display', 'none'));
                    if (user.isOwner || user.isMod) userList.querySelectorAll('.hil-userlist-ban').forEach(button => button.style.removeProperty('display'));
                    else userList.querySelectorAll('.hil-userlist-ban').forEach(button => button.style.setProperty('display', 'none'));
                }, { deep: true });
            }

            if (socketStates.options['chat-moderation']) {
                const chat = document.querySelector('.chat').firstElementChild;
                let gotTo100 = false;
                const chatObserver = new MutationObserver(function(mutations) {
                    for (let mutation of mutations) {
                        if (mutation.target !== chat && !mutation.target.matches('.v-list-item__content') && !mutation.target.parentElement.matches('.v-list-item__content')) continue;

                        if (chat.childElementCount === 100) {
                            if (gotTo100) {
                                chat.firstElementChild.querySelector('.hil-user-action-buttons')?.removeWithTooltips();
                                for (let buttons of chat.querySelectorAll('div.hil-user-action-buttons')) {
                                    buttons.parentElement.previousElementSibling.appendChild(buttons);
                                }
                            }
                            gotTo100 = true;
                        }
                        
                        const messageNode = chat.lastElementChild;
                        if (messageNode.querySelector('i').matches('.mdi-account,.mdi-crown,.mdi-account-tie')) {
                            const username = messageNode.querySelector('.v-list-item__title').innerText;
                            if (username === userInstance.currentUser.username) {
                                const paddingDiv = document.createElement('div');
                                paddingDiv.className = 'hil-user-action-buttons';
                                let buttonCount = 2;
                                if (userInstance.isOwner) buttonCount += 1;
                                if (userInstance.isOwner || userInstance.isMod) buttonCount += 1;
                                paddingDiv.style.width = buttonCount * 42 + "px";
                                paddingDiv.removeWithTooltips = paddingDiv.remove;
                                messageNode.appendChild(paddingDiv);
                            } else {
                                const buttons = userActionButtonSet(() => username, true);
                                messageNode.appendChild(buttons);
                            }
                        }

                        break;
                    }
                });

                chatObserver.observe(chat, {
                    childList: true,
                    characterData: true,
                    subtree: true
                });
            }
        }

        if (socketStates.options['volume-sliders']) {
            function processVolumeSliders() {
                for (let elem of document.querySelectorAll('.v-input__slider .mdi-volume-source:not([hil-slider-processed="1"])')) {
                    elem.setAttribute('hil-slider-processed', '1');
                    const masterSliderContainer = elem.parentElement.parentElement.parentElement;

                    function customVolumeSlider(iconClass) {
                        const sliderContainer = masterSliderContainer.cloneNode(true);
                        sliderContainer.querySelector('.mdi-volume-source').classList.add(iconClass);
                        sliderContainer.querySelector('.mdi-volume-source').classList.remove('mdi-volume-source');
                        sliderContainer.querySelector('.v-slider__track-background').style.width = '100%';
                        masterSliderContainer.parentElement.appendChild(sliderContainer);
                        return sliderContainer;
                    }
                    const bgsSliderContainer = customVolumeSlider('mdi-volume-high');
                    const bgmSliderContainer = customVolumeSlider('mdi-music');
                    for (let child of masterSliderContainer.parentElement.children) {
                        child.style.marginBottom = '20px';
                    }
                    masterSliderContainer.parentElement.lastElementChild.style.removeProperty('margin-bottom');

                    const masterIcon = masterSliderContainer.querySelector('.mdi-volume-source');
                    masterIcon.classList.remove('mdi');
                    masterIcon.classList.remove('mdi-volume-source');
                    masterIcon.textContent = 'All';
                    masterIcon.style.fontSize = '120%';

                    let bgmVolume = 'hil-bgm-volume' in localStorage ? parseInt(localStorage['hil-bgm-volume']) : 99;
                    let bgsVolume = 'hil-bgs-volume' in localStorage ? parseInt(localStorage['hil-bgs-volume']) : 99;

                    function howlIsMusic(howl) {
                        return howl._loop || howl._src.slice(0, 13) === '/audio/music/';
                    }

                    bgmSliderContainer.querySelector('.v-slider').addEventListener('mousedown', function (event) {
                        sliderListener(event, bgmSliderContainer, 0, 99, function (value) {
                            bgmVolume = value;
                            localStorage['hil-bgm-volume'] = value;
                            for (let howl of Howler._howls) {
                                if (!howlIsMusic(howl)) continue;
                                howl.volume(howl._hilOrigVolume * bgmVolume / 100);
                            }
                        })
                    });
                    setSlider(bgmSliderContainer, bgmVolume, 0, 99);

                    bgsSliderContainer.querySelector('.v-slider').addEventListener('mousedown', function (event) {
                        sliderListener(event, bgsSliderContainer, 0, 99, function (value) {
                            bgsVolume = value;
                            localStorage['hil-bgs-volume'] = value;
                            for (let howl of Howler._howls) {
                                if (howlIsMusic(howl)) continue;
                                howl.volume(howl._hilOrigVolume * bgsVolume / 100);
                            }
                        })
                    });
                    setSlider(bgsSliderContainer, bgsVolume, 0, 99);

                    Howler._howls.push = function (...args) {
                        Array.prototype.push.call(Howler._howls, ...args);
                        for (let howl of Howler._howls) {
                            if (howl._hilProcessed) continue;
                            howl._hilProcessed = true;
                            const getHilVolume = howlIsMusic(howl) ? () => bgmVolume : () => bgsVolume;

                            howl._hilOrigVolume = howl.volume();
                            howl.volume(howl._hilOrigVolume * getHilVolume() / 100);
                            const origFade = howl.fade.bind(howl);
                            howl.fade = function (from, to, dur) {
                                origFade(from * getHilVolume() / 100, to * getHilVolume() / 100, dur);
                            }
                        }
                    };
                }
            }
            processVolumeSliders();
            addMessageListener(window, 'room_spectated', processVolumeSliders);
        }

        let resolvedCharacters = {};
        function resolveCharacter(characterId) {
            return new Promise(function(resolve) {
                if (characterId in resolvedCharacters) {
                    const character = frameInstance.customCharacters[characterId];
                    if (character) {
                        resolve(character);
                    } else {
                        resolve(resolvedCharacters[characterId]);
                    }
                    return;
                }
                
                const character = frameInstance.customCharacters[characterId];
                if (character) {
                    for (let pose of character.poses) {
                        if (pose.states.length === 0) continue;
                        resolvedCharacters[characterId] = character;
                        resolve(character);
                        return;
                    }
                }
                    
                fetch('https://api.objection.lol/character/getcharacters', {
                    method: "POST",
                    headers: {'Content-Type': 'application/json'}, 
                    body: JSON.stringify({
                        ids: [characterId]
                    })
                })
                .then(res => res.json())
                .then(function([ character ]) {
                    resolvedCharacters[characterId] = character;
                    resolve(character);
                });
            });
        }
        if (socketStates.options['pose-icon-maker']) {
            function checkIfIconsEditable() {
                const editButton = document.querySelector('.hil-pose-edit-icon');
                if (!editButton) return;
                if (characterInstance.currentCharacter.id > 1000 && characterInstance.currentCharacter.poses.find(pose => !pose.iconUrl)) {
                    editButton.classList.remove('hil-hide');
                } else {
                    editButton.classList.add('hil-hide');
                    const editCard = document.querySelector('.hil-pose-edit-card');
                    if (editCard) document.querySelector('.hil-pose-edit-card').classList.add('hil-hide');
                }
            }
            checkIfIconsEditable();
            characterInstance.$watch('currentCharacter', checkIfIconsEditable);

            function onPoseSet() {
                const characterId = characterInstance.currentCharacter.id;
                const characterResolved = resolveCharacter(characterId);

                characterResolved.then(function(character) {
                    if (character === undefined) return;
                    const currentPose = character.poses.find(
                        pose => pose.id === poseInstance.currentPoseId
                    );
                    if (currentPose === undefined) return;
                    currentPose.character = {
                        name: character.name,
                    }
                    window.postMessage([
                        'set_pose',
                        currentPose,
                    ]);
                });
            }
            onPoseSet();
            poseInstance.$watch('currentPoseId', onPoseSet);

            addMessageListener(window, 'get_current_pose', onPoseSet);

            characterListInstance.$watch('customList', function() {
                updateCustomPoseIconCCs();
            }, { deep: true });

            new MutationObserver(function(mutations) {
                for (let mutation of mutations) {
                    for (let node of mutation.addedNodes) {
                        if (!(node.nodeType === 1 && node.nodeName === 'IMG')) continue;
                        const poseId = node.parentElement.__vue__.poseId;
                        node.dataset.poseId = poseId;
                    }
                }
            }).observe(poseInstance.$el, {
                childList: true,
                subtree: true,
            });
        }

        if (socketStates.options['pose-icon-maker'] || socketStates.options['export-cc-images']) {
            function simplifyPoseName(name) {
                name = name.trim();
                name = name.toLowerCase();
                name = name.replaceAll(/[^a-zA-Z0-9_]/g, '_');
                name = name.replaceAll(/\s+/g, '-');
                return name;
            }

            function getFileNameFromURL(url) {
                return url.slice(url.lastIndexOf('/') + 1, url.lastIndexOf('.'));
            }

            new MutationObserver(function(mutationRecord) {
                for (let mutation of mutationRecord) {
                    if (socketStates.options['pose-icon-maker']) {
                        for (let node of mutation.addedNodes) {
                            if (!(node.nodeType === 1 && node.nodeName === 'DIV' && node.matches('.v-alert'))) continue;
                            if (!node.querySelector('.mdi-share-circle.success--text')) continue;
                            const content = node.querySelector('.v-alert__content');
                            socketStates['lastShareContent'] = content;
                            
                            let iconlessPoseIds = {};
                            for (let pose of node.__vue__.$parent.selectedCharacter.poses) {
                                if (!pose.iconUrl || pose.iconUrl === hilUtils.transparentGif) iconlessPoseIds[pose.id] = true;
                            }
                            window.postMessage(['check_iconless_pose_ids', iconlessPoseIds]);
                            break;
                        }
                    }
                    for (let elem of mutation.target.querySelectorAll('.v-window-item:not([data-hil-processed])')) {
                        elem.dataset.hilProcessed = '1';
                        const toolbar = elem.parentElement.parentElement.parentElement.querySelector('.v-toolbar__title');
                        if (!toolbar) continue;
                        const label = toolbar.textContent;
                        const index = Array.from(elem.parentElement.childNodes).indexOf(elem);
                        if (label === 'Manage Character' && index === 1) {
                            const col = elem.querySelector('.col');
                            const buttonRow = htmlToElement(/*html*/`
                                <div class="d-flex" style="gap: 4px"></div>
                            `);
    
                            for (let [ condition, className, openText, importText, textareaPlaceholder, descriptionMessage, importCallback ] of [
                                [
                                    socketStates.options['pose-icon-maker'],
                                    "hil-pose-icon-import",
                                    "Pose icon importing",
                                    "Import icons",
                                    "Paste your list of pose icons here, one URL per line.",
                                    "If you exported some icons from the pose icon maker, paste a list of the image file URLs here to add them to the character. Make sure the names are unchanged from how they were exported.",
                                    function(urls) {
                                        const manageCharacterInstance = document.querySelector('#app > div.v-application--wrap > div.container.pa-0.pa-lg-2.container--fluid > div.v-dialog__container').__vue__.$parent;
                                        const char = manageCharacterInstance.editingCharacter;
                                        if (!char) return;
                                        for (let pose of char.poses) {
                                            if (pose.iconUrl) continue;
                                            pose.iconUrl = urls[pose.id];
                                            const edit = app.__vue__.$store._actions['assets/character/editPose'][0];
                                            edit(pose);
                                        }
                                        manageCharacterInstance.goBack();
                                    }
                                ],
                                [
                                    socketStates.options['export-cc-images'],
                                    "hil-pose-image-import",
                                    "Backup pose image importing",
                                    "Import archived pose images",
                                    "Paste your list of pose images, one URL per line.",
                                    "If you archived the character's images, paste a list of the image file URLs here to replace the character's current images. Make sure the archived names are unchanged from how they were saved.",
                                    function(urls) {
                                        const manageCharacterInstance = document.querySelector('#app > div.v-application--wrap > div.container.pa-0.pa-lg-2.container--fluid > div.v-dialog__container').__vue__.$parent;
                                        const char = manageCharacterInstance.editingCharacter;
                                        if (!char) return;
                                        for (let fileName in urls) {
                                            const url = urls[fileName];
                                            const dash1 = fileName.indexOf('-');
                                            const dash2 = fileName.lastIndexOf('-');
                                            const id = fileName.slice(0, dash1);
                                            const name = fileName.slice(dash1 + 1, dash2);
                                            const type = fileName.slice(dash2 + 1);

                                            let pose = char.poses.find(pose => pose.id == id);
                                            if (!pose) {
                                                pose = char.poses.find(pose => simplifyPoseName(pose.name) == name);
                                            };
                                            if (!pose) continue;
                                            
                                            if (type === 'a') {
                                                pose.idleImageUrl = url;
                                            } else if (type === 'b') {
                                                pose.speakImageUrl = url;
                                            } else if (parseInt(type) !== NaN && pose.states[parseInt(type)]) {
                                                pose.states[parseInt(type)].imageUrl = url;
                                            }
                                        }
                                        for (let pose of char.poses) {
                                            const edit = app.__vue__.$store._actions['assets/character/editPose'][0];
                                            edit(pose);
                                        }
                                        manageCharacterInstance.goBack();
                                    },
                                ],
                            ]) {
                                if (!condition) continue;
                                const importDiv = htmlToElement(/*html*/`
                                    <div class="mb-4 hil-import-div d-none" style="transition:var(--default-transition)">
                                        <div class="v-messages v-messages__message mb-2 hil-themed ${getTheme()}" style="font-size: 16px; line-height: 24px">${descriptionMessage}</div>
                                        <textarea class="${className}" placeholder="${textareaPlaceholder}" style="width: 100%;height: 150px;resize: none;padding: 5px 5px 1px;color: #fff;border: thin solid rgba(255, 255, 255, 0.12);border-radius: 0px !important;white-space: nowrap;"></textarea>
                                    </div>
                                `);
                                const textArea = importDiv.querySelector('textarea');
        
                                importDiv.appendChild(hilUtils.createButton(
                                    function() {
                                        const urls = {};
                                        for (let value of textArea.value.split('\n')) {
                                            let url;
                                            try {
                                                url = new URL(value).href;
                                            } catch {}
                                            if (!url) continue;
                                            const fileName = url.slice(url.lastIndexOf('/') + 1, url.lastIndexOf('.'));
                                            urls[fileName] = url;
                                        }
                                        importCallback(urls);
                                    },
                                    importText,
                                    'primary mb-2',
                                    'width:100%'
                                ));
                                col.prepend(importDiv);
        
                                const button = hilUtils.createButton(
                                    function() {
                                        const toOpen = importDiv.classList.contains('d-none');
                                        col.querySelectorAll('.hil-import-div').forEach(div => div.classList.add('d-none'));
                                        col.querySelectorAll(':scope > :nth-child(1) > .primary').forEach(div => div.classList.remove('primary'));
                                        if (toOpen) importDiv.classList.remove('d-none');
                                        if (toOpen) button.classList.add('primary');
                                    },
                                    openText,
                                    'mb-2 ' + className,
                                    'height:22.25px!important;flex:1;'
                                );
                                buttonRow.appendChild(button);
                            }

                            col.prepend(buttonRow);
                        } else if (socketStates.options['export-cc-images'] && label === 'My Assets' && index === 1) {
                            const shareButton = elem.querySelector('.v-btn.info');
                            
                            const loadingBarContainer = htmlToElement(/*html*/`
                                <div class="mt-2 hil-cc-loading-bar hil-disabled">
                                    <div style="width: 0%;"></div>
                                    <div class="d-none"></div>
                                </div>
                            `);
                            shareButton.parentElement.parentElement.parentElement.appendChild(loadingBarContainer);
                            const loadingBar = loadingBarContainer.children[0];
                            const loadingScroll = loadingBarContainer.children[1];

                            function toggleLoadingUI(enabled) {
                                button.classList.toggle('v-btn--disabled', enabled);
                                loadingBarContainer.classList.toggle('hil-disabled', !enabled);
                                loadingBar.style.width = '0';
                                if (enabled) loadingScroll.classList.add('d-none');
                            }

                            const button = hilUtils.createButton(
                                async function() {
                                    toggleLoadingUI(true);
                                    const assetManager = getAssetManagerInstance();
                                    if (!assetManager) return;
                                    const characterId = assetManager.$refs.characterPreviewer.selected;
                                    const character = await resolveCharacter(characterId);

                                    const fileUrls = [];
                                    const addFile = (url, name) => fileUrls.push({url, name});
                                    for (let pose of character.poses) {
                                        const id = pose.id;
                                        let name = id + '-' + simplifyPoseName(pose.name);
                                        addFile(pose.idleImageUrl, 'poses/' + name + '-a');
                                        if (pose.speakImageUrl) addFile(pose.speakImageUrl, 'poses/' + name + '-b');
                                        if (pose.iconUrl) addFile(pose.iconUrl, 'icons/' + name);
                                        for (let i = 0; i < pose.states.length; i++) {
                                            const imageUrl = pose.states[i].imageUrl;
                                            addFile(imageUrl, 'poses/' + name + '-' + i);
                                        }
                                        for (let sound of pose.audioTicks) {
                                            if (sound.fileName) addFile(sound.fileName, 'sounds/' + getFileNameFromURL(sound.fileName));
                                        }
                                    }
                                    for (let bubble of character.bubbles) {
                                        const name = simplifyPoseName(bubble.name);
                                        if (bubble.imageUrl) addFile(bubble.imageUrl, 'bubbles/' + name);
                                        if (bubble.soundUrl) addFile(bubble.soundUrl, 'sounds/' + getFileNameFromURL(bubble.soundUrl));
                                    }
                                    for (let item of ['blip', 'galleryAJImage', 'galleryImage', 'icon']) {
                                        const key = item + 'Url';
                                        if (character[key]) addFile(character[key], item);
                                    }

                                    window.postMessage(['fetch_cc_files', fileUrls]);
                                    const files = await new Promise(function(resolve) {
                                        addMessageListener(window, 'cc_files_fetched', function(data) {
                                            resolve(data);
                                        });
                                    });
                                    setTimeout(() => loadingScroll.classList.remove('d-none'), 500);

                                    const zip = new JSZip();
                                    for (let file of files) {
                                        zip.file(file.name, file.array);
                                    }
                                    zip.file('char.json', JSON.stringify(character, null, 4));

                                    zip.generateAsync({type:"blob"}).then(function (blob) {
                                        const a = document.createElement('a');
                                        const url = window.URL.createObjectURL(blob);
                                        a.href = url;
                                        let name = character.name + '.zip';
                                        name = name.replaceAll(/\s/g, ' ');
                                        name = name.replaceAll(/[|~<>?/:*]/g, '');
                                        a.download = name;
                                        a.click();
                                        window.URL.revokeObjectURL(url);
                                        toggleLoadingUI(false);
                                    });
                                },
                                'Archive'
                            )
                            button.className = 'mt-2 ml-2 v-btn v-btn--has-bg v-size--small hil-cc-arhiver warning hil-themed ' + getTheme();
                            shareButton.parentElement.appendChild(button);
                        }
                    }
                }
            }).observe(app, {
                childList: true,
                subtree: true,
            });
        }

        if (socketStates.options['disable-testimony-shortcut']) {
            const shortcutDiv = document.querySelector('.v-main__wrap > div');
            shortcutDiv.addEventListener('shortkey', function(event) {
                if (event.srcKey !== 't' || event.hilIgnore === true) return;
    
                const newEvent = new CustomEvent('shortkey');
                newEvent.srcKey = event.srcKey;
                newEvent.hilIgnore = true;
                shortcutDiv.dispatchEvent(newEvent);
            });
        }

        if (socketStates.options['unblur-low-res']) {
            function checkImage(node) {
                if (!(node.nodeType === 1 && node.nodeName === 'IMG')) return;
                if (!(node.classList.contains('character') || node.classList.contains('image-sd') || node.classList.contains('custom-bubble'))) return;
                const img = node;
                if (img.naturalHeight <= 300) {
                    img.classList.add('hil-pixel-img');
                } else {
                    img.classList.remove('hil-pixel-img');
                }
            }

            new MutationObserver(function (mutations) {
                for (let mutation of mutations) {
                    if (mutation.type === 'attributes') {
                        checkImage(mutation.target);
                    } else {
                        for (let node of mutation.addedNodes) {
                            checkImage(node);
                        }
                    }
                }
            }).observe(courtContainer, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['src'],
            });
        }

        function musicListListener(musicList) {

            if (socketStates.options['ost-pw'] && !musicList.find(music => music.id === 276905)) musicList.push({"id":276905,"url":"https://file.garden/ZSLRNu3coQFc9m43/Music/Ace%20Attorney%20Music/Vanilla%20Ace%20Attorney%20Music/PWAA/Ambience%20-%20Literally%20Just%20Bird%20Noises.mp3","fileSize":2577137,"name":"[PW] Ambience - Literally Just Bird Noises","volume":1},{"id":276917,"url":"https://file.garden/ZSLRNu3coQFc9m43/Music/Ace%20Attorney%20Music/Vanilla%20Ace%20Attorney%20Music/PWAA/Court%20is%20Now%20in%20Session%20Trial%202001.mp3","fileSize":3500704,"name":"[PW] Court is Now in Session [Trial 2001]","volume":1},{"id":276918,"url":"https://file.garden/ZSLRNu3coQFc9m43/Music/Ace%20Attorney%20Music/Vanilla%20Ace%20Attorney%20Music/PWAA/Credits%20Theme%20-%20Turnabout%20Sisters%20Instrumental.mp3","fileSize":2996546,"name":"[PW] Credits Theme - Turnabout Sisters Instrumental","volume":1},{"id":276921,"url":"https://file.garden/ZSLRNu3coQFc9m43/Music/Ace%20Attorney%20Music/Vanilla%20Ace%20Attorney%20Music/PWAA/Credits%20Theme%20Unused.mp3","fileSize":3050374,"name":"[PW] Credits Theme (Unused)","volume":1},{"id":276913,"url":"https://file.garden/ZSLRNu3coQFc9m43/Music/Ace%20Attorney%20Music/Vanilla%20Ace%20Attorney%20Music/PWAA/Cross-Examination%20-%20Allegro%202001.mp3","fileSize":4600576,"name":"[PW] Cross-Examination - Allegro 2001","volume":1},{"id":276914,"url":"https://file.garden/ZSLRNu3coQFc9m43/Music/Ace%20Attorney%20Music/Vanilla%20Ace%20Attorney%20Music/PWAA/Cross-Examination%20-%20Moderato%202001.mp3","fileSize":3536964,"name":"[PW] Cross-Examination - Moderato 2001","volume":1},{"id":276916,"url":"https://file.garden/ZSLRNu3coQFc9m43/Music/Ace%20Attorney%20Music/Vanilla%20Ace%20Attorney%20Music/PWAA/Damon%20Gant%20-%20Swimming%20Anyone.mp3","fileSize":4536000,"name":"[PW] Damon Gant - Swimming, Anyone?","volume":1},{"id":276909,"url":"https://file.garden/ZSLRNu3coQFc9m43/Music/Ace%20Attorney%20Music/Vanilla%20Ace%20Attorney%20Music/PWAA/Defendant%20Lobby%20-%20So%20it%20Begins.mp3","fileSize":2526921,"name":"[PW] Defendant Lobby - So it Begins","volume":1},{"id":276912,"url": "https://file.garden/ZSLRNu3coQFc9m43/Music/Ace%20Attorney%20Music/Vanilla%20Ace%20Attorney%20Music/PWAA/Detention%20Center%20-%20The%20Security%20Guards%20Elegy.mp3", "fileSize":2923214,"name":"[PW] Detention Center - The Security Guards' Elegy","volume":1},{"id":276923,"url":"https://file.garden/ZSLRNu3coQFc9m43/Music/Ace%20Attorney%20Music/Vanilla%20Ace%20Attorney%20Music/PWAA/Dick%20Gumshoe%20-%20That's%20%22Detective%20Gumshoe%22%2C%20Pal!.mp3","fileSize":3859113,"name":"[PW] Dick Gumshoe - That's \"Detective Gumshoe,\" Pal!","volume":1},{"id":276924,"url":"https://file.garden/ZSLRNu3coQFc9m43/Music/Ace%20Attorney%20Music/Vanilla%20Ace%20Attorney%20Music/PWAA/Ema%20Skye%202005%20-%20Turnabout%20Sisters.mp3","fileSize":3773103,"name":"[PW] Ema Skye 2005 - Turnabout Sisters","volume":1},{"id": 276925,"url":"https://file.garden/ZSLRNu3coQFc9m43/Music/Ace%20Attorney%20Music/Vanilla%20Ace%20Attorney%20Music/PWAA/Heart%20of%20the%20Investigation%20%5BCore%202001%5D.mp3","fileSize":3994301,"name":"[PW] Heart of the Investigation [Core 2001]","volume":1},{"id":276926,"url":"https://file.garden/ZSLRNu3coQFc9m43/Music/Ace%20Attorney%20Music/Vanilla%20Ace%20Attorney%20Music/PWAA/Initial%20Investigation%20%5BOpening%202001%5D.mp3","fileSize":3213390,"name":"[PW] Initial Investigation [Opening 2001]","volume":1},{"id":276931,"url":"https://file.garden/ZSLRNu3coQFc9m43/Music/Ace%20Attorney%20Music/Vanilla%20Ace%20Attorney%20Music/PWAA/Jake%20Marshall%20-%20Renegade%20Sheriff.mp3","fileSize":3601621,"name":"[PW] Jake Marshall - Renegade Sheriff","volume":1},{"id":276933,"url":"https://file.garden/ZSLRNu3coQFc9m43/Music/Ace%20Attorney%20Music/Vanilla%20Ace%20Attorney%20Music/PWAA/Marvin%20Grossberg%20-%20Reckonings%20and%20Regrets%20of%20an%20Aged%20Attorney.mp3","fileSize":2920550,"name":"[PW] Marvin Grossberg - Reckonings and Regrets of an Aged Attorney","volume":1},{"id":276935,"url":"https://file.garden/ZSLRNu3coQFc9m43/Music/Ace%20Attorney%20Music/Vanilla%20Ace%20Attorney%20Music/PWAA/Maya%20Fey%20-%20Turnabout%20Sisters%202001.mp3","fileSize":5668267,"name":"[PW] Maya Fey - Turnabout Sisters 2001","volume":1},{"id":276904,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003289844228821002/Phoenix_Wright_-_Objection_2001.mp3","fileSize":2845696,"name":"[PW] Phoenix Wright - Objection 2001","volume":1},{"id":276936,"url":"https://file.garden/ZSLRNu3coQFc9m43/Music/Ace%20Attorney%20Music/Vanilla%20Ace%20Attorney%20Music/PWAA/Phoenix%20Wright%20Ace%20Attorney%20-%20Ending.mp3","fileSize":5062542,"name":"[PW] Phoenix Wright Ace Attorney - Ending","volume":1},{"id":276937,"url":"https://file.garden/ZSLRNu3coQFc9m43/Music/Ace%20Attorney%20Music/Vanilla%20Ace%20Attorney%20Music/PWAA/Phoenix%20Wright%20Ace%20Attorney%20-%20Opening.mp3","fileSize":1356341,"name":"[PW] Phoenix Wright Ace Attorney - Opening","volume":1},{"id":276939,"url":"https://file.garden/ZSLRNu3coQFc9m43/Music/Ace%20Attorney%20Music/Vanilla%20Ace%20Attorney%20Music/PWAA/Pursuit%20-%20Corner%20the%20Culprit%20(Variation)%20%5BPursuit%202001%5D.mp3","fileSize":3056140,"name":"[PW] Pursuit - Corner the Culprit (Variation) [Pursuit 2001]","volume":1},{"id":276940,"url":"https://file.garden/ZSLRNu3coQFc9m43/Music/Ace%20Attorney%20Music/Vanilla%20Ace%20Attorney%20Music/PWAA/Pursuit%20-%20Corner%20the%20Culprit%20%5BPursuit%202001%5D.mp3","fileSize":3259276,"name":"[PW] Pursuit - Corner the Culprit [Pursuit 2001]","volume":1},{"id":276948,"url":"https://file.garden/ZSLRNu3coQFc9m43/Music/Ace%20Attorney%20Music/Vanilla%20Ace%20Attorney%20Music/PWAA/Reminiscences_-_Mayas_Sorrow.mp3","fileSize":3917533,"name":"[PW] Reminiscences - Maya's Sorrow","volume":1},{"id":276947,"url":"https://file.garden/ZSLRNu3coQFc9m43/Music/Ace%20Attorney%20Music/Vanilla%20Ace%20Attorney%20Music/PWAA/Reminiscences_-_The_Class_Trial.mp3","fileSize":1862309,"name":"[PW] Reminiscences - The Class Trial","volume":1},{"id":276946,"url":"https://file.garden/ZSLRNu3coQFc9m43/Music/Ace%20Attorney%20Music/Vanilla%20Ace%20Attorney%20Music/PWAA/Reminiscences%20-%20The_DL-6_Incident.mp3","fileSize":3578806,"name":"[PW] Reminiscences - The DL-6 Incident","volume":1},{"id":276945,"url":"https://file.garden/ZSLRNu3coQFc9m43/Music/Ace%20Attorney%20Music/Vanilla%20Ace%20Attorney%20Music/PWAA/Reminiscences%20-%20The%20SL-9%20Incident.mp3","fileSize":3113545,"name":"[PW] Reminiscences - The SL-9 Incident","volume":1},{"id":276944,"url":"https://file.garden/ZSLRNu3coQFc9m43/Music/Ace%20Attorney%20Music/Vanilla%20Ace%20Attorney%20Music/PWAA/Reminiscences%20-%20The%20Two%20Faces%20of%20a%20Studio.mp3","fileSize":2294376,"name":"[PW] Reminiscences - The Two Faces of a Studio","volume":1},{"id": 276942,"url":"https://file.garden/ZSLRNu3coQFc9m43/Music/Ace%20Attorney%20Music/Vanilla%20Ace%20Attorney%20Music/PWAA/Ringtone%20-%20Phoenix%20Wright.mp3","fileSize":823516,"name":"[PW] Ringtone - Phoenix Wright","volume":1},{"id":276943,"url":"https://file.garden/ZSLRNu3coQFc9m43/Music/Ace%20Attorney%20Music/Vanilla%20Ace%20Attorney%20Music/PWAA/Rise%20from%20the%20Ashes%20-Ending.mp3","fileSize":4555337,"name":"[PW] Rise from the Ashes - Ending","volume":1},{"id":276941,"url":"https://file.garden/ZSLRNu3coQFc9m43/Music/Ace%20Attorney%20Music/Vanilla%20Ace%20Attorney%20Music/PWAA/Rise%20from%20the%20Ashes%20-%20Opening.mp3","fileSize":738657,"name":"[PW] Rise from the Ashes - Opening","volume":1},{"id":276938,"url":"https://file.garden/ZSLRNu3coQFc9m43/Music/Ace%20Attorney%20Music/Vanilla%20Ace%20Attorney%20Music/PWAA/Simple%20Folk.mp3","fileSize":2190939,"name":"[PW] Simple Folk","volume":1},{"id":276906,"url": "https://file.garden/ZSLRNu3coQFc9m43/Music/Ace%20Attorney%20Music/Vanilla%20Ace%20Attorney%20Music/PWAA/Suspense%202001.mp3","fileSize":2933597,"name":"[PW] Suspense 2001","volume":1},{"id":276929,"url":"https://file.garden/ZSLRNu3coQFc9m43/Music/Ace%20Attorney%20Music/Vanilla%20Ace%20Attorney%20Music/PWAA/The%20Ballad%20of%20Turnabout%20Sisters.mp3","fileSize":3507191,"name":"[PW] The Ballad of Turnabout Sisters","volume":1},{"id":276928,"url":"https://file.garden/ZSLRNu3coQFc9m43/Music/Ace%20Attorney%20Music/Vanilla%20Ace%20Attorney%20Music/PWAA/The%20Blue%20Badger%20-%20I%20Want%20to%20Protect%20You.mp3","fileSize":1356940,"name":"[PW] The Blue Badger - I Want to Protect You","volume":1},{"id":276927,"url":"https://file.garden/ZSLRNu3coQFc9m43/Music/Ace%20Attorney%20Music/Vanilla%20Ace%20Attorney%20Music/PWAA/The%20Steel_Samurai%20-%20Warrior%20of%20Neo%20Olde%20Tokyo.mp3","fileSize":3524511,"name":"[PW] The Steel Samurai - Warrior of Neo Olde Tokyo","volume":1},{"id":276922,"url":"https://file.garden/ZSLRNu3coQFc9m43/Music/Ace%20Attorney%20Music/Vanilla%20Ace%20Attorney%20Music/PWAA/The%20Truth%20Revealed%20%5BTruth%202001%5D.mp3","fileSize":2760056,"name":"[PW] The Truth Revealed [Truth 2001]","volume":1},{"id":276903,"url":"https://file.garden/ZSLRNu3coQFc9m43/Music/Ace%20Attorney%20Music/Vanilla%20Ace%20Attorney%20Music/PWAA/Title_Theme.mp3","fileSize":5285983,"name":"[PW] Title Theme","volume":1},{"id":276915,"url":"https://file.garden/ZSLRNu3coQFc9m43/Music/Ace%20Attorney%20Music/Vanilla%20Ace%20Attorney%20Music/PWAA/Tricks%20and%20Deductions%20Trick%202001.mp3","fileSize":5519681,"name":"[PW] Tricks and Deductions [Trick 2001]","volume":1},{"id":276930,"url":"https://file.garden/ZSLRNu3coQFc9m43/Music/Ace%20Attorney%20Music/Vanilla%20Ace%20Attorney%20Music/PWAA/Victory%20-%20Our%20First%20Win%20%5BVictory%202001%5D.mp3","fileSize":3539122,"name":"[PW] Victory! - Our First Win [Victory 2001]","volume":1});
            if (socketStates.options['ost-jfa'] && !musicList.find(music => music.id === 276986)) musicList.push({"id":276986,"url":"https://file.garden/ZSLRNu3coQFc9m43/Music/Ace%20Attorney%20Music/Vanilla%20Ace%20Attorney%20Music/PW%3AAA%20JFA/Berry_Big_Circus.mp3","fileSize":3578048,"name":"[JFA] Berry Big Circus","volume":1},{"id":276987,"url":"https://file.garden/ZSLRNu3coQFc9m43/Music/Ace%20Attorney%20Music/Vanilla%20Ace%20Attorney%20Music/PW%3AAA%20JFA/Court_is_Now_in_Session_Trial_2002.mp3","fileSize":3234347,"name":"[JFA] Court is Now in Session [Trial 2002]","volume":1},{"id":276989,"url":"https://file.garden/ZSLRNu3coQFc9m43/Music/Ace%20Attorney%20Music/Vanilla%20Ace%20Attorney%20Music/PW%3AAA%20JFA/Cross-Examination_-_Allegro_2002.mp3","fileSize":3532763,"name":"[JFA] Cross-Examination - Allegro 2002","volume":1},{"id":276988,"url":"https://file.garden/ZSLRNu3coQFc9m43/Music/Ace%20Attorney%20Music/Vanilla%20Ace%20Attorney%20Music/PW%3AAA%20JFA/Cross-Examination_-_Moderato_2002.mp3","fileSize":3083840,"name":"[JFA] Cross-Examination - Moderato 2002","volume":1},{"id":276991,"url":"https://file.garden/ZSLRNu3coQFc9m43/Music/Ace%20Attorney%20Music/Vanilla%20Ace%20Attorney%20Music/PW%3AAA%20JFA/Defendant_Lobby_-_So_it_Begins_Again.mp3","fileSize":2994305,"name":"[JFA] Defendant Lobby - So it Begins Again","volume":1},{"id":276994,"url":"https://file.garden/ZSLRNu3coQFc9m43/Music/Ace%20Attorney%20Music/Vanilla%20Ace%20Attorney%20Music/PW%3AAA%20JFA/Detention_Center_-_The_Security_Cameras_Elegy.mp3","fileSize":4255254,"name":"[JFA] Detention Center - The Security Camera's Elegy","volume":1},{"id":276996,"url":"https://file.garden/ZSLRNu3coQFc9m43/Music/Ace%20Attorney%20Music/Vanilla%20Ace%20Attorney%20Music/PW%3AAA%20JFA/Eccentrics.mp3","fileSize":3611608,"name":"[JFA] Eccentrics","volume":1},{"id":276997,"url":"https://file.garden/ZSLRNu3coQFc9m43/Music/Ace%20Attorney%20Music/Vanilla%20Ace%20Attorney%20Music/PW%3AAA%20JFA/Fabulous.mp3","fileSize":542169,"name":"[JFA] Fabulous!","volume":1},{"id":276999,"url":"https://file.garden/ZSLRNu3coQFc9m43/Music/Ace%20Attorney%20Music/Vanilla%20Ace%20Attorney%20Music/PW%3AAA%20JFA/Further_Investigation_Middle_2002.mp3","fileSize":3620732,"name":"[JFA] Further Investigation [Middle 2002]","volume":1},{"id":277010,"url":"https://file.garden/ZSLRNu3coQFc9m43/Music/Ace%20Attorney%20Music/Vanilla%20Ace%20Attorney%20Music/PW%3AAA%20JFA/Heart_of_the_Investigation_Core_2002.mp3","fileSize":3916232,"name":"[JFA] Heart of the Investigation [Core 2002]","volume":1},{"id":277011,"url":"https://file.garden/ZSLRNu3coQFc9m43/Music/Ace%20Attorney%20Music/Vanilla%20Ace%20Attorney%20Music/PW%3AAA%20JFA/Justice_for_All_-_Ending.mp3","fileSize":2109510,"name":"[JFA] Hotline of Fate","volume":1},{"id":277034,"url":"https://file.garden/ZSLRNu3coQFc9m43/Music/Ace%20Attorney%20Music/Vanilla%20Ace%20Attorney%20Music/PW%3AAA%20JFA/Initial_Investigation_Opening_2002.mp3","fileSize":2741884,"name":"[JFA] Initial Investigation [Opening 2002]","volume":1},{"id":277038,"url":"https://file.garden/ZSLRNu3coQFc9m43/Music/Ace%20Attorney%20Music/Vanilla%20Ace%20Attorney%20Music/PW%3AAA%20JFA/Justice_for_All_-_Ending.mp3","fileSize":6006073,"name":"[JFA] Justice for All - Ending","volume":1},{"id":277039,"url": "https://file.garden/ZSLRNu3coQFc9m43/Music/Ace%20Attorney%20Music/Vanilla%20Ace%20Attorney%20Music/PW%3AAA%20JFA/Justice_for_All_-_Opening.mp3","fileSize":1514558,"name":"[JFA] Justice for All - Opening","volume":1},{"id":277062,"url": "https://file.garden/ZSLRNu3coQFc9m43/Music/Ace%20Attorney%20Music/Vanilla%20Ace%20Attorney%20Music/PW%3AAA%20JFA/Kurain_Village.mp3","fileSize":3413492,"name":"[JFA] Kurain Village","volume":1},{"id":277064,"url":"https://file.garden/ZSLRNu3coQFc9m43/Music/Ace%20Attorney%20Music/Vanilla%20Ace%20Attorney%20Music/PW%3AAA%20JFA/Magic_and_Tricks_Trick_2002.mp3","fileSize":4098833,"name":"[JFA] Magic and Tricks [Trick 2002]","volume":1},{"id":277068,"url": "https://file.garden/ZSLRNu3coQFc9m43/Music/Ace%20Attorney%20Music/Vanilla%20Ace%20Attorney%20Music/PW%3AAA%20JFA/Maya_Fey_-_Turnabout_Sisters_2002.mp3","fileSize":4153384,"name":"[JFA] Maya Fey - Turnabout Sisters 2002","volume":1},{"id":277072,"url":"https://file.garden/ZSLRNu3coQFc9m43/Music/Ace%20Attorney%20Music/Vanilla%20Ace%20Attorney%20Music/PW%3AAA%20JFA/More_Simple_Folk.mp3","fileSize":3056369,"name":"[JFA] More Simple Folk","volume":1},{"id":277070,"url":"https://file.garden/ZSLRNu3coQFc9m43/Music/Ace%20Attorney%20Music/Vanilla%20Ace%20Attorney%20Music/PW%3AAA%20JFA/One_Prosecutors_Musings_-_Until_We_Meet_Again.mp3","fileSize":1811225,"name":"[JFA] One Prosecutor's Musings - Until We Meet Again","volume":1},{"id":277069,"url":"https://file.garden/ZSLRNu3coQFc9m43/Music/Ace%20Attorney%20Music/Vanilla%20Ace%20Attorney%20Music/PW%3AAA%20JFA/Pearl_Fey_-_With_Pearly.mp3","fileSize":2468866,"name":"[JFA] Pearl Fey - With Pearly","volume":1},{"id":276990,"url":"https://file.garden/ZSLRNu3coQFc9m43/Music/Ace%20Attorney%20Music/Vanilla%20Ace%20Attorney%20Music/PW%3AAA%20JFA/Phoenix_Wright_-_Objection_2002.mp3","fileSize":3009935,"name":"[JFA] Phoenix Wright - Objection 2002","volume":1},{"id":277065,"url":"https://file.garden/ZSLRNu3coQFc9m43/Music/Ace%20Attorney%20Music/Vanilla%20Ace%20Attorney%20Music/PW%3AAA%20JFA/Psyche-Locks.mp3","fileSize":2676432,"name":"[JFA] Psyche-Locks","volume":1},{"id":277066,"url":"https://file.garden/ZSLRNu3coQFc9m43/Music/Ace%20Attorney%20Music/Vanilla%20Ace%20Attorney%20Music/PW%3AAA%20JFA/Pursuit_-_Confront_the_Culprit_Variation_Pursuit_2002.mp3","fileSize":3098517,"name":"[JFA] Pursuit - Confront the Culprit (Variation) [Pursuit 2002]","volume":1},{"id":277060,"url":"https://file.garden/ZSLRNu3coQFc9m43/Music/Ace%20Attorney%20Music/Vanilla%20Ace%20Attorney%20Music/PW%3AAA%20JFA/Pursuit_-_Confront_the_Culprit_Pursuit_2002.mp3","fileSize":3087718,"name":"[JFA] Pursuit - Confront the Culprit [Pursuit 2002]","volume":1},{"id":277061,"url":"https://file.garden/ZSLRNu3coQFc9m43/Music/Ace%20Attorney%20Music/Vanilla%20Ace%20Attorney%20Music/PW%3AAA%20JFA/Reminiscences_-_Ballad_of_The_Steel_Samurai.mp3","fileSize":3950319,"name":"[JFA] Reminiscences - Ballad of The Steel Samurai","volume":1},{"id":277032,"url":"https://file.garden/ZSLRNu3coQFc9m43/Music/Ace%20Attorney%20Music/Vanilla%20Ace%20Attorney%20Music/PW%3AAA%20JFA/Reminiscences_-_Fire-Licked_Scars.mp3","fileSize":4585534,"name":"[JFA] Reminiscences - Fire-Licked Scars","volume":1},{"id":277029,"url":"https://file.garden/ZSLRNu3coQFc9m43/Music/Ace%20Attorney%20Music/Vanilla%20Ace%20Attorney%20Music/PW%3AAA%20JFA/Reminiscences_-_Pure_Pain.mp3","fileSize":4799137,"name":"[JFA] Reminiscences - Pure Pain","volume":1},{"id":277027,"url": "https://file.garden/ZSLRNu3coQFc9m43/Music/Ace%20Attorney%20Music/Vanilla%20Ace%20Attorney%20Music/PW%3AAA%20JFA/Ringtone_-_Richard_Wellington.mp3","fileSize":411850,"name":"[JFA] Ringtone - Richard Wellington","volume":1},{"id":277026,"url": "https://file.garden/ZSLRNu3coQFc9m43/Music/Ace%20Attorney%20Music/Vanilla%20Ace%20Attorney%20Music/PW%3AAA%20JFA/Shelly_de_Killer_-_A_Deadly_Gentlemans_Delight.mp3","fileSize":3248042,"name":"[JFA] Shelly de Killer - A Deadly Gentleman's Delight","volume":1},{"id":277021,"url":"https://file.garden/ZSLRNu3coQFc9m43/Music/Ace%20Attorney%20Music/Vanilla%20Ace%20Attorney%20Music/PW%3AAA%20JFA/The_Truth_Revealed_Truth_2002.mp3","fileSize":3192943,"name":"[JFA] The Truth Revealed [Truth 2002]","volume":1},{"id":277019,"url":"https://file.garden/ZSLRNu3coQFc9m43/Music/Ace%20Attorney%20Music/Vanilla%20Ace%20Attorney%20Music/PW%3AAA%20JFA/Triumphant_Return_-_Franziska_von_Karma.mp3","fileSize":3221611,"name":"[JFA] Triumphant Return - Franziska von Karma","volume":1},{"id":277013,"url":"https://file.garden/ZSLRNu3coQFc9m43/Music/Ace%20Attorney%20Music/Vanilla%20Ace%20Attorney%20Music/PW%3AAA%20JFA/Triumphant_Return_-_Franziska_von_Karma_Variation.mp3","fileSize":2777656,"name":"[JFA] Triumphant Return - Franziska von Karma (Variation)","volume":1},{"id":277012,"url":"https://file.garden/ZSLRNu3coQFc9m43/Music/Ace%20Attorney%20Music/Vanilla%20Ace%20Attorney%20Music/PW%3AAA%20JFA/Triumphant_Return_-_Miles_Edgeworth.mp3","fileSize":3036292,"name":"[JFA] Triumphant Return - Miles Edgeworth","volume":1},{"id":276985,"url":"https://file.garden/ZSLRNu3coQFc9m43/Music/Ace%20Attorney%20Music/Vanilla%20Ace%20Attorney%20Music/PW%3AAA%20JFA/Victory_-_Another_Win_Victory_2002.mp3","fileSize":4438363,"name":"[JFA] Victory! - Another Win [Victory 2002]","volume":1});
            if (socketStates.options['ost-t&t'] && !musicList.find(music => music.id === 277073)) musicList.push({"id":277073,"url":"https://file.garden/ZSLRNu3coQFc9m43/Music/Ace%20Attorney%20Music/Vanilla%20Ace%20Attorney%20Music/PW%3AAA%20T%26T/Court_is_Now_in_Session_Trial_2004.mp3","fileSize":4298618,"name":"[T&T] Court is Now in Session [Trial 2004]","volume":1},{"id":277138,"url":"https://file.garden/ZSLRNu3coQFc9m43/Music/Ace%20Attorney%20Music/Vanilla%20Ace%20Attorney%20Music/PW%3AAA%20T%26T/Cross-Examination_-_Allegro_2004.mp3","fileSize":5641014,"name":"[T&T] Cross-Examination - Allegro 2004","volume":1},{"id":277140,"url": "https://file.garden/ZSLRNu3coQFc9m43/Music/Ace%20Attorney%20Music/Vanilla%20Ace%20Attorney%20Music/PW%3AAA%20T%26T/Cross-Examination_-_Moderato_2004.mp3","fileSize":6544218,"name":"[T&T] Cross-Examination - Moderato 2004","volume":1},{"id":277142,"url": "https://file.garden/ZSLRNu3coQFc9m43/Music/Ace%20Attorney%20Music/Vanilla%20Ace%20Attorney%20Music/PW%3AAA%20T%26T/Dahlia_Hawthorne_-_The_Visage_of_What_Once_Was.mp3","fileSize":2207362,"name":"[T&T] Dahlia Hawthorne - The Visage of What Once Was","volume":1},{"id":277144,"url": "https://file.garden/ZSLRNu3coQFc9m43/Music/Ace%20Attorney%20Music/Vanilla%20Ace%20Attorney%20Music/PW%3AAA%20T%26T/Defendant_Lobby_-_So_it_Will_Always_Begin.mp3","fileSize":3638939,"name":"[T&T] Defendant Lobby - So it Will Always Begin","volume":1},{"id":277145,"url":"https://file.garden/ZSLRNu3coQFc9m43/Music/Ace%20Attorney%20Music/Vanilla%20Ace%20Attorney%20Music/PW%3AAA%20T%26T/Detention_Center_-_The_Prisoners_Elegy.mp3","fileSize":4179989,"name":"[T&T] Detention Center - The Prisoner's Elegy","volume":1},{"id":277149,"url":"https://file.garden/ZSLRNu3coQFc9m43/Music/Ace%20Attorney%20Music/Vanilla%20Ace%20Attorney%20Music/PW%3AAA%20T%26T/Elise_Deauxnim_-_A_Gentle_Melody.mp3","fileSize":5121253,"name":"[T&T] Elise Deauxnim - A Gentle Melody","volume":1},{"id":277148,"url":"https://file.garden/ZSLRNu3coQFc9m43/Music/Ace%20Attorney%20Music/Vanilla%20Ace%20Attorney%20Music/PW%3AAA%20T%26T/Furio_Tigre_-_Swingin_Tiger.mp3","fileSize":3784220,"name":"[T&T] Furio Tigre - Swingin' Tiger","volume":1},{"id": 277150,"url":"https://file.garden/ZSLRNu3coQFc9m43/Music/Ace%20Attorney%20Music/Vanilla%20Ace%20Attorney%20Music/PW%3AAA%20T%26T/Further_Investigation_Middle_2004.mp3","fileSize":4845847,"name":"[T&T] Further Investigation [Middle 2004]","volume":1},{"id":277153,"url":"https://file.garden/ZSLRNu3coQFc9m43/Music/Ace%20Attorney%20Music/Vanilla%20Ace%20Attorney%20Music/PW%3AAA%20T%26T/Godot_-_The_Fragrance_of_Darkness_That_is_Coffee.mp3","fileSize":4908682,"name":"[T&T] Godot - The Fragrance of Darkness; That is Coffee","volume":1},{"id":277166,"url":"https://file.garden/ZSLRNu3coQFc9m43/Music/Ace%20Attorney%20Music/Vanilla%20Ace%20Attorney%20Music/PW%3AAA%20T%26T/Hazakura_Temple.mp3","fileSize":5319801,"name":"[T&T] Hazakura Temple","volume":1},{"id":277168,"url":"https://file.garden/ZSLRNu3coQFc9m43/Music/Ace%20Attorney%20Music/Vanilla%20Ace%20Attorney%20Music/PW%3AAA%20T%26T/Initial_Investigation_Opening_2004.mp3","fileSize":3758314,"name":"[T&T] Initial Investigation [Opening 2004]","volume":1},{"id":277167,"url":"https://file.garden/ZSLRNu3coQFc9m43/Music/Ace%20Attorney%20Music/Vanilla%20Ace%20Attorney%20Music/PW%3AAA%20T%26T/Larry_Butz_-_When_Something_Smells_Its_Usually_Me.mp3","fileSize":3934165,"name":"[T&T] Larry Butz - When Something Smells, It's Usually Me","volume":1},{"id":277169,"url":"https://file.garden/ZSLRNu3coQFc9m43/Music/Ace%20Attorney%20Music/Vanilla%20Ace%20Attorney%20Music/PW%3AAA%20T%26T/Lordly_Tailor.mp3","fileSize":4443098,"name":"[T&T] Lordly Tailor","volume":1},{"id":277170,"url":"https://file.garden/ZSLRNu3coQFc9m43/Music/Ace%20Attorney%20Music/Vanilla%20Ace%20Attorney%20Music/PW%3AAA%20T%26T/Luke_Atmey_-_Look_at_Me.mp3","fileSize":3539809,"name":"[T&T] Luke Atmey - Look at Me","volume":1},{"id":277171,"url":"https://file.garden/ZSLRNu3coQFc9m43/Music/Ace%20Attorney%20Music/Vanilla%20Ace%20Attorney%20Music/PW%3AAA%20T%26T/MaskDeMasque_-_Please_Listen_to_Meeeee.mp3","fileSize":3165729,"name":"[T&T] Mask☆DeMasque - Please Listen to Meeeee!","volume":1},{"id":277172,"url":"https://file.garden/ZSLRNu3coQFc9m43/Music/Ace%20Attorney%20Music/Vanilla%20Ace%20Attorney%20Music/PW%3AAA%20T%26T/Phoenix_Wright_-_Objection_2004.mp3","fileSize":3859827,"name":"[T&T] Phoenix Wright - Objection 2004","volume":1},{"id":277173,"url":"https://file.garden/ZSLRNu3coQFc9m43/Music/Ace%20Attorney%20Music/Vanilla%20Ace%20Attorney%20Music/PW%3AAA%20T%26T/Pursuit_-_Catch_the_Culprit_Variation_Pursuit_2004.mp3","fileSize":4506604,"name":"[T&T] Pursuit - Catch the Culprit (Variation) [Pursuit 2004]","volume":1},{"id":277174,"url":"https://file.garden/ZSLRNu3coQFc9m43/Music/Ace%20Attorney%20Music/Vanilla%20Ace%20Attorney%20Music/PW%3AAA%20T%26T/Pursuit_-_Catch_the_Culprit_Pursuit_2004.mp3","fileSize":4701201,"name":"[T&T] Pursuit - Catch the Culprit [Pursuit 2004]","volume":1},{"id":277180,"url":"https://file.garden/ZSLRNu3coQFc9m43/Music/Ace%20Attorney%20Music/Vanilla%20Ace%20Attorney%20Music/PW%3AAA%20T%26T/Pursuit_-_Corner_the_Culprit_2004.mp3","fileSize":3463640,"name":"[T&T] Pursuit - Corner the Culprit 2004","volume":1},{"id":277182,"url":"https://file.garden/ZSLRNu3coQFc9m43/Music/Ace%20Attorney%20Music/Vanilla%20Ace%20Attorney%20Music/PW%3AAA%20T%26T/Pursuit_-_Corner_the_Culprit_2004_Variation.mp3","fileSize":3232487,"name":"[T&T] Pursuit - Corner the Culprit 2004 (Variation)","volume":1},{"id":277183,"url":"https://file.garden/ZSLRNu3coQFc9m43/Music/Ace%20Attorney%20Music/Vanilla%20Ace%20Attorney%20Music/PW%3AAA%20T%26T/Recipe_for_Turnabout.mp3","fileSize":1424636,"name":"[T&T] Recipe for Turnabout","volume":1},{"id":277184,"url":"https://file.garden/ZSLRNu3coQFc9m43/Music/Ace%20Attorney%20Music/Vanilla%20Ace%20Attorney%20Music/PW%3AAA%20T%26T/Reminiscences_-_The_Bitterness_of_Truth.mp3","fileSize":4557383,"name":"[T&T] Reminiscences - The Bitterness of Truth","volume":1},{"id":277185,"url":"https://file.garden/ZSLRNu3coQFc9m43/Music/Ace%20Attorney%20Music/Vanilla%20Ace%20Attorney%20Music/PW%3AAA%20T%26T/Reminiscences_-_The_View_from_Dusky_Bridge.mp3","fileSize":6726275,"name":"[T&T] Reminiscences - The View from Dusky Bridge","volume":1},{"id":277178,"url":"https://file.garden/ZSLRNu3coQFc9m43/Music/Ace%20Attorney%20Music/Vanilla%20Ace%20Attorney%20Music/PW%3AAA%20T%26T/Reminiscences_-_Violetta_Vitriol.mp3","fileSize":5296974,"name":"[T&T] Reminiscences - Violetta Vitriol","volume":1},{"id":277177,"url":"https://file.garden/ZSLRNu3coQFc9m43/Music/Ace%20Attorney%20Music/Vanilla%20Ace%20Attorney%20Music/PW%3AAA%20T%26T/Ringtone_-_Godot.mp3","fileSize":1292082,"name":"[T&T] Ringtone - Godot","volume":1},{"id":277176,"url":"https://file.garden/ZSLRNu3coQFc9m43/Music/Ace%20Attorney%20Music/Vanilla%20Ace%20Attorney%20Music/PW%3AAA%20T%26T/The_Stolen_Turnabout.mp3","fileSize":1296855,"name":"[T&T] The Stolen Turnabout","volume":1},{"id":277175,"url":"https://file.garden/ZSLRNu3coQFc9m43/Music/Ace%20Attorney%20Music/Vanilla%20Ace%20Attorney%20Music/PW%3AAA%20T%26T/The_Truth_Revealed_Truth_2004.mp3","fileSize":4059899,"name":"[T&T] The Truth Revealed [Truth 2004]","volume":1},{"id":277165,"url":"https://file.garden/ZSLRNu3coQFc9m43/Music/Ace%20Attorney%20Music/Vanilla%20Ace%20Attorney%20Music/PW%3AAA%20T%26T/Tres_Bien.mp3","fileSize":3998161,"name":"[T&T] Trés Bien","volume":1},{"id":277162,"url":"https://file.garden/ZSLRNu3coQFc9m43/Music/Ace%20Attorney%20Music/Vanilla%20Ace%20Attorney%20Music/PW%3AAA%20T%26T/Trials_and_Tribulations_-_Ending.mp3","fileSize":5879849,"name":"[T&T] Trials and Tribulations - Ending","volume":1},{"id":277160,"url":"https://file.garden/ZSLRNu3coQFc9m43/Music/Ace%20Attorney%20Music/Vanilla%20Ace%20Attorney%20Music/PW%3AAA%20T%26T/Trials_and_Tribulations_-_Opening.mp3","fileSize":950862,"name":"[T&T] Trials and Tribulations - Opening","volume":1},{"id":277159,"url":"https://file.garden/ZSLRNu3coQFc9m43/Music/Ace%20Attorney%20Music/Vanilla%20Ace%20Attorney%20Music/PW%3AAA%20T%26T/Turnabout_Beginnings.mp3","fileSize":1597521,"name":"[T&T] Turnabout Beginnings","volume":1},{"id":277157,"url": "https://file.garden/ZSLRNu3coQFc9m43/Music/Ace%20Attorney%20Music/Vanilla%20Ace%20Attorney%20Music/PW%3AAA%20T%26T/Turnabout_Memories.mp3","fileSize":918849,"name":"[T&T] Turnabout Memories","volume":1},{"id":277156,"url":"https://file.garden/ZSLRNu3coQFc9m43/Music/Ace%20Attorney%20Music/Vanilla%20Ace%20Attorney%20Music/PW%3AAA%20T%26T/Victor_Kudo_-_Martial_Anthem_of_Misery.mp3","fileSize":3473260,"name":"[T&T] Victor Kudo - Martial Anthem of Misery","volume":1},{"id":277155,"url":"https://file.garden/ZSLRNu3coQFc9m43/Music/Ace%20Attorney%20Music/Vanilla%20Ace%20Attorney%20Music/PW%3AAA%20T%26T/Victory_-_An_Eternal_Win_Victory_2004.mp3","fileSize":5421220,"name":"[T&T] Victory! - An Eternal Win [Victory 2004]","volume":1});
            if (socketStates.options['ost-aj'] && !musicList.find(music => music.id === 168784)) musicList.push({"id":168784,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003286850435297340/Turnabout_Corner.mp3","fileSize":670255,"name":"[AJ] \"Turnabout Corner\"","volume":1},{"id":168786,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003286850728894474/Turnabout_Succession_I_MASON_System.mp3","fileSize":1001751,"name":"[AJ] \"Turnabout Succession\" (I) (MASON System)","volume":1},{"id":168860,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003286851026685972/Turnabout_Succession_II.mp3","fileSize":1166856,"name":"[AJ] \"Turnabout Succession\" (II)","volume":1},{"id":168782,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003286851299323944/Apollo_Justice_-_A_New_Era_Begins_Objection_2007.mp3","fileSize":3488909,"name":"[AJ] Apollo Justice - A New Era Begins! [Objection 2007]","volume":1},{"id":168870,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003286851613892608/Apollo_Justice_Ace_Attorney_-_Ending.mp3","fileSize":4822413,"name":"[AJ] Apollo Justice Ace Attorney - Ending","volume":1},{"id":168781,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003286851953627186/Apollo_Justice_Ace_Attorney_-_Opening.mp3","fileSize":1156977,"name":"[AJ] Apollo Justice Ace Attorney - Opening","volume":1},{"id":168867,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003286852243046440/Court_is_Now_in_Session_Variation_Trial_2007.mp3","fileSize":4046954,"name":"[AJ] Court is Now in Session (Variation) [Trial 2007]","volume":1},{"id":168872,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003286852524048484/Court_is_Now_in_Session_Trial_2007.mp3","fileSize":4160633,"name":"[AJ] Court is Now in Session [Trial 2007]","volume":1},{"id":168854,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003286852800892999/Cross-Examination_-_Allegro_2007.mp3","fileSize":3170891,"name":"[AJ] Cross-Examination - Allegro 2007","volume":1},{"id":168864,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003286853140627496/Cross-Examination_-_Moderato_2007.mp3","fileSize":2815968,"name":"[AJ] Cross-Examination - Moderato 2007","volume":1},{"id":168871,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003287075765895168/Defendant_Lobby_-_New_Beginning.mp3","fileSize":2270164,"name":"[AJ] Defendant Lobby - New Beginning","volume":1},{"id":168856,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003287076210475029/Detention_Center_-_Tragicomic_Meeting.mp3","fileSize":7093694,"name":"[AJ] Detention Center - Tragicomic Meeting","volume":1},{"id":168779,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003287076617326602/Drew_Studio.mp3","fileSize":6304506,"name":"[AJ] Drew Studio","volume":1},{"id":168790,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003287077019975720/Eccentrics_2007.mp3","fileSize":3413660,"name":"[AJ] Eccentrics 2007","volume":1},{"id":168788,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003287077489741834/Ema_Skye_2007_-_The_Scientific_Detective.mp3","fileSize":2901280,"name":"[AJ] Ema Skye 2007 - The Scientific Detective","volume":1},{"id":168785,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003287078114697336/Heart_of_the_Investigation_Core_2007.mp3","fileSize":4203621,"name":"[AJ] Heart of the Investigation [Core 2007]","volume":1},{"id":168789,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003287078592852029/Initial_Investigation_Opening_2007.mp3","fileSize":2986485,"name":"[AJ] Initial Investigation [Opening 2007]","volume":1},{"id":168778,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003287079054229596/Kitaki_Family.mp3","fileSize":4194763,"name":"[AJ] Kitaki Family","volume":1},{"id":168863,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003287079469461584/Klavier_Gavin_-_Guilty_Love.mp3","fileSize":2994247,"name":"[AJ] Klavier Gavin - Guilty Love","volume":1},{"id":168780,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003287079880499300/Lamiroir_-_Landscape_Painter_in_Sound.mp3","fileSize":5474227,"name":"[AJ] Lamiroir - Landscape Painter in Sound","volume":1},{"id":168787,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003287494026084363/Perceive_-_Surge_Eyes.mp3","fileSize":1818798,"name":"[AJ] Perceive - Surge, Eyes","volume":1},{"id":168783,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003287514586558514/Psyche-Locks_2007.mp3","fileSize":2677831,"name":"[AJ] Psyche-Locks 2007","volume":1},{"id":168873,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003287514922090516/Pursuit_-_Overtaken_Variation_Pursuit_2007.mp3","fileSize":3111685,"name":"[AJ] Pursuit - Overtaken (Variation) [Pursuit 2007]","volume":1},{"id":168862,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003287515517689926/Pursuit_-_Overtaken_Pursuit_2007.mp3","fileSize":3262017,"name":"[AJ] Pursuit - Overtaken [Pursuit 2007]","volume":1},{"id":168874,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003287515819671572/Reminiscences_-_Fate_Smeared_by_Tricks_and_Gimmicks.mp3","fileSize":4390161,"name":"[AJ] Reminiscences - Fate Smeared by Tricks and Gimmicks","volume":1},{"id":168859,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003287516184588399/Reminiscences_-_Forgotten_Legend.mp3","fileSize":4763835,"name":"[AJ] Reminiscences - Forgotten Legend","volume":1},{"id":168852,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003287516528525392/Reminiscences_-_Wounded_Foxes.mp3","fileSize":4687041,"name":"[AJ] Reminiscences - Wounded Foxes","volume":1},{"id":168857,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003287516843081868/Ringtone_-_Klavier_Gavin.mp3","fileSize":775732,"name":"[AJ] Ringtone - Klavier Gavin","volume":1},{"id":168868,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003287517191221298/Solitary_Confinement_-_Darkness_Theme.mp3","fileSize":3686691,"name":"[AJ] Solitary Confinement - Darkness Theme","volume":1},{"id":168861,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003287517543534672/Suspense_2007.mp3","fileSize":1720926,"name":"[AJ] Suspense 2007","volume":1},{"id":168866,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003287723026690069/The_Guitars_Serenade.mp3","fileSize":5429135,"name":"[AJ] The Guitar's Serenade","volume":1},{"id":168869,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003287722770841620/The_Guitars_Serenade_Instrumental.mp3","fileSize":1134806,"name":"[AJ] The Guitar's Serenade (Instrumental)","volume":1},{"id":168858,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003287723311890493/The_Truth_Revealed_Truth_2007.mp3","fileSize":3465663,"name":"[AJ] The Truth Revealed [Truth 2007]","volume":1},{"id":168865,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003287723584536626/Trance_Logic_Trick_2007.mp3","fileSize":3701809,"name":"[AJ] Trance Logic [Trick 2007]","volume":1},{"id":168855,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003287723878133840/Troupe_Gramarye.mp3","fileSize":3729774,"name":"[AJ] Troupe Gramarye","volume":1},{"id":168853,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003287724595367966/Trucys_Theme_-_Child_of_Magic_2007.mp3","fileSize":3284515,"name":"[AJ] Trucy's Theme - Child of Magic 2007","volume":1},{"id":168851,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003287724872187955/Victory_-_Our_Win_Victory_2007.mp3","fileSize":4375969,"name":"[AJ] Victory! - Our Win [Victory 2007]","volume":1});
            if (socketStates.options['ost-dd'] && !musicList.find(music => music.id === 168732)) musicList.push({"id":168732,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003285503036096552/A_Splendid_Visitor.mp3","fileSize":1303172,"name":"[DD] \"A Splendid Visitor\"","volume":1},{"id":168722,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003285503350673418/Apollo_Under_Attack.mp3","fileSize":519934,"name":"[DD] \"Apollo Under Attack\"","volume":1},{"id":168711,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003285503673651210/Breakaway.mp3","fileSize":769824,"name":"[DD] \"Breakaway\"","volume":1},{"id":168715,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003285503992397856/Countdown_to_Tomorrow.mp3","fileSize":2629495,"name":"[DD] \"Countdown to Tomorrow\"","volume":1},{"id":168729,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003285504311185418/For_Those_I_Must_Protect.mp3","fileSize":654718,"name":"[DD] \"For Those I Must Protect\"","volume":1},{"id":168710,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003285504579616768/Gavinners_Twilight_Gig.mp3","fileSize":726149,"name":"[DD] \"Gavinners - Twilight Gig\"","volume":1},{"id":168712,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003285504848039946/I_Athena_Will_Take_on_Your_Defense.mp3","fileSize":724771,"name":"[DD] \"I, Athena, Will Take on Your Defense\"","volume":1},{"id":168734,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003285505238114334/Proof_of_Friendship.mp3","fileSize":1821906,"name":"[DD] \"Proof of Friendship\"","volume":1},{"id":168731,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003285505561083936/Prosecutor_with_Handcuffs.mp3","fileSize":390445,"name":"[DD] \"Prosecutor with Handcuffs\"","volume":1},{"id":168718,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003285520211771392/Swashbuckler_Spectacular_Song_-_Athenas_Sea_of_Adventure_is_Here.mp3","fileSize":1391125,"name":"[DD] \"Swashbuckler Spectacular Song\" - Athena's Sea of Adventure is Here!","volume":1},{"id":168735,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003285634087133184/Swashbuckler_Spectacular_Song_-_The_Writer_Who_Snatches_Away_the_Truth.mp3","fileSize":1241771,"name":"[DD] \"Swashbuckler Spectacular Song\" - The Writer Who Snatches Away the Truth","volume":1},{"id":168714,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003285634342993971/The_Depths_of_the_Depths_of_the_Heart.mp3","fileSize":1052684,"name":"[DD] \"The Depths of the Depths of the Heart\"","volume":1},{"id":168730,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003285634636591124/The_Monstrous_Turnabout.mp3","fileSize":1148182,"name":"[DD] \"The Monstrous Turnabout\"","volume":1},{"id":168713,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003285634959548537/The_Murder_Commited_by_a_Youkai.mp3","fileSize":311011,"name":"[DD] \"The Murder Commited by a Youkai\"","volume":1},{"id":168737,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003285635236380772/Turnabout_Academy.mp3","fileSize":562466,"name":"[DD] \"Turnabout Academy\"","volume":1},{"id":168716,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003285635496423494/Turnabout_for_Tomorrow.mp3","fileSize":3362810,"name":"[DD] \"Turnabout for Tomorrow\"","volume":1},{"id":168725,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003285635806810132/Turnabout_Reclaimed.mp3","fileSize":1753306,"name":"[DD] \"Turnabout Reclaimed\"","volume":1},{"id":168728,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003285636284956742/Bonus_Pursuit_-_Demo_PV_Version.mp3","fileSize":2304205,"name":"[DD] (Bonus) Pursuit - Demo PV Version","volume":1},{"id":168717,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003285637002178581/Bonus_Pursuit_-_Last_Promotion_Version.mp3","fileSize":5405341,"name":"[DD] (Bonus) Pursuit - Last Promotion Version","volume":1},{"id":168736,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003285637266427954/Apollo_Justice_-_A_New_Era_Begins_2013.mp3","fileSize":6958712,"name":"[DD] Apollo Justice - A New Era Begins! 2013","volume":1},{"id":168727,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003285846549594112/Apollo_Justice_-_Im_Fine.mp3","fileSize":5295863,"name":"[DD] Apollo Justice - I'm Fine!","volume":1},{"id":168721,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003285846843216002/Athena_Cykes_-_Courtroom_Revolutionnaire.mp3","fileSize":5558008,"name":"[DD] Athena Cykes - Courtroom Révolutionnaire","volume":1},{"id":168763,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003285847182946415/Athena_Cykes_-_Lets_Do_This.mp3","fileSize":4789380,"name":"[DD] Athena Cykes - Let's Do This!","volume":1},{"id":168773,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003285847484928010/Bobby_Fulbright_-_In_Justice_We_Trust.mp3","fileSize":6040784,"name":"[DD] Bobby Fulbright - In Justice We Trust!","volume":1},{"id":168754,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003285847858225172/Capn_Orlas_Swashbucklers_-_We_Love_to_Sail_the_Seven_Seas.mp3","fileSize":5227289,"name":"[DD] Cap'n Orla's Swashbucklers - We Love to Sail the Seven Seas","volume":1},{"id":168747,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003285848151838842/Court_is_Now_in_Session_Trial_2013.mp3","fileSize":5288093,"name":"[DD] Court is Now in Session [Trial 2013]","volume":1},{"id":168757,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003285848407687289/Cross-Examination_-_Allegro_2013.mp3","fileSize":4367961,"name":"[DD] Cross-Examination - Allegro 2013","volume":1},{"id":168767,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003285848705486888/Cross-Examination_-_Moderato_2013.mp3","fileSize":4216709,"name":"[DD] Cross-Examination - Moderato 2013","volume":1},{"id":168738,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003285849074573362/Defendant_Lobby_-_Tomorrow_Begins.mp3","fileSize":5142270,"name":"[DD] Defendant Lobby - Tomorrow Begins","volume":1},{"id":168771,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003285849506590760/Detention_Center_-_The_Bulletproof_Glasss_Elegy.mp3","fileSize":3155257,"name":"[DD] Detention Center - The Bulletproof Glass's Elegy","volume":1},{"id":168750,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003285888312295464/Difficult_Folk.mp3","fileSize":3796787,"name":"[DD] Difficult Folk","volume":1},{"id":168749,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003285888622665768/Dual_Destinies_-_Ending.mp3","fileSize":7328914,"name":"[DD] Dual Destinies - Ending","volume":1},{"id":168733,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003285888895299644/Dual_Destinies_-_Opening.mp3","fileSize":3923747,"name":"[DD] Dual Destinies - Opening","volume":1},{"id":168720,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003285889176326224/Florent_LBelle_-_Je_Suis_LBelle.mp3","fileSize":5262255,"name":"[DD] Florent L'Belle - Je Suis L'Belle","volume":1},{"id":168726,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003285889608327239/Go_Forth_The_Amazing_Nine-Tails.mp3","fileSize":5477581,"name":"[DD] Go Forth! The Amazing Nine-Tails","volume":1},{"id":168719,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003285889914503218/Heart_of_the_Investigation_Core_2013.mp3","fileSize":5847814,"name":"[DD] Heart of the Investigation [Core 2013]","volume":1},{"id":168724,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003285890182955029/Illegality_of_Fate.mp3","fileSize":4204726,"name":"[DD] Illegality of Fate","volume":1},{"id":168745,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003285890472349808/Initial_Investigation_Opening_2013.mp3","fileSize":3958612,"name":"[DD] Initial Investigation [Opening 2013]","volume":1},{"id":168723,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003285890757570560/Investigation_-_Examination.mp3","fileSize":3891911,"name":"[DD] Investigation - Examination","volume":1},{"id":168777,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003285891000844298/Lively_Folk.mp3","fileSize":4683760,"name":"[DD] Lively Folk","volume":1},{"id":168748,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003285885275607080/Logic_Trinity_Trick_2013.mp3","fileSize":4191160,"name":"[DD] Logic Trinity [Trick 2013]","volume":1},{"id":168765,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003285885661491260/Miles_Edgeworth_-_Triumphant_Return_2013.mp3","fileSize":5829147,"name":"[DD] Miles Edgeworth - Triumphant Return 2013","volume":1},{"id":168770,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003285886089314324/Mood_Matrix_-_Now_Commencing_Psychoanalysis.mp3","fileSize":4547987,"name":"[DD] Mood Matrix - Now Commencing Psychoanalysis","volume":1},{"id":168740,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003285886345150474/Mysterious_The_Legend_of_Tenma_Taro.mp3","fileSize":4209484,"name":"[DD] Mysterious! The Legend of Tenma Taro","volume":1},{"id":168741,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003285886626177024/Nine-Tails_Vale_-_Hometown_of_the_Yokai.mp3","fileSize":5329288,"name":"[DD] Nine-Tails Vale - Hometown of the Yokai","volume":1},{"id":168766,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003285886894624890/Pearl_Fey_-_With_Pearly_2013.mp3","fileSize":3638391,"name":"[DD] Pearl Fey - With Pearly 2013","volume":1},{"id":168761,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003285887167234058/Phantom_-_UNKNOWN.mp3","fileSize":4668186,"name":"[DD] Phantom - UNKNOWN","volume":1},{"id":168776,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003285887448260659/Phoenix_Wright_-_Objection_2013.mp3","fileSize":4948534,"name":"[DD] Phoenix Wright - Objection 2013","volume":1},{"id":168739,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003285887733485648/Psyche-Locks_2013.mp3","fileSize":2675697,"name":"[DD] Psyche-Locks 2013","volume":1},{"id":168753,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003285888010297354/Pursuit_-_Keep_Pressing_On_Variation_Pursuit_2013.mp3","fileSize":5120548,"name":"[DD] Pursuit - Keep Pressing On (Variation) [Pursuit 2013]","volume":1},{"id":168775,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003286509803290674/Pursuit_-_Keep_Pressing_On_Pursuit_2013.mp3","fileSize":5178454,"name":"[DD] Pursuit - Keep Pressing On [Pursuit 2013]","volume":1},{"id":168774,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003286510151405748/Reminiscences_-_A_Sad_Memory.mp3","fileSize":5841348,"name":"[DD] Reminiscences - A Sad Memory","volume":1},{"id":168752,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003286510545682554/Reminiscences_-_Departure_from_Regret.mp3","fileSize":4325799,"name":"[DD] Reminiscences - Departure from Regret","volume":1},{"id":168769,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003286510893805659/Reminiscences_-_Wandering_Heart.mp3","fileSize":4443296,"name":"[DD] Reminiscences - Wandering Heart","volume":1},{"id":168759,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003286511254503444/Revisualization_-_Synaptic_Resonance.mp3","fileSize":3706789,"name":"[DD] Revisualization - Synaptic Resonance","volume":1},{"id":168758,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003286511590056066/Robot_Laboratory_-_The_Past_That_Doesnt_Disappear.mp3","fileSize":6978535,"name":"[DD] Robot Laboratory - The Past That Doesn't Disappear","volume":1},{"id":168768,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003286511946567680/Running_Wild_-_Mood_Matrix_-_Get_a_Grip_on_Yourself.mp3","fileSize":4532065,"name":"[DD] Running Wild - Mood Matrix - Get a Grip on Yourself!","volume":1},{"id":168744,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003286512470859796/Shipshape_Aquarium_-_A_Refreshing_Sea.mp3","fileSize":6241689,"name":"[DD] Shipshape Aquarium - A Refreshing Sea","volume":1},{"id":168760,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003286512902869062/Simon_Blackquill_-_Twisted_Swordsmanship.mp3","fileSize":4252214,"name":"[DD] Simon Blackquill - Twisted Swordsmanship","volume":1},{"id":168746,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003286513364254750/Suspense_2013.mp3","fileSize":3068837,"name":"[DD] Suspense 2013","volume":1},{"id":168764,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003286542074249376/Suspicious_Folk.mp3","fileSize":3695075,"name":"[DD] Suspicious Folk","volume":1},{"id":168762,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003286542363664404/The_Cosmic_Turnabout.mp3","fileSize":696523,"name":"[DD] The Cosmic Turnabout","volume":1},{"id":168743,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003286542745354341/The_Dark_Age_of_the_Law.mp3","fileSize":6501055,"name":"[DD] The Dark Age of the Law","volume":1},{"id":168751,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003286543034765442/The_Truth_Revealed_Truth_2013.mp3","fileSize":4123345,"name":"[DD] The Truth Revealed [Truth 2013]","volume":1},{"id":168755,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003286543399661598/Themis_Legal_Academy_-_Our_Precious_School.mp3","fileSize":4510273,"name":"[DD] Themis Legal Academy - Our Precious School","volume":1},{"id":168772,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003286543697448990/Trucys_Theme_-_Child_of_Magic_2013.mp3","fileSize":3188888,"name":"[DD] Trucy's Theme - Child of Magic 2013","volume":1},{"id":168756,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003286544028807188/Victory_-_Everyones_Win_Victory_2013.mp3","fileSize":3724500,"name":"[DD] Victory! - Everyone's Win [Victory 2013]","volume":1},{"id":168742,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003286544297246770/Yuri_Cosmos_-_Head_of_the_Center_of_the_Cosmos.mp3","fileSize":6480087,"name":"[DD] Yuri Cosmos - Head of the Center of the Cosmos","volume":1});
            if (socketStates.options['ost-soj'] && !musicList.find(music => music.id === 168636)) musicList.push({"id":168636,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003283801532813412/A_Cornered_Heart.mp3","fileSize":4597228,"name":"[SOJ] A Cornered Heart","volume":1},{"id":168647,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003283801822212146/A_Quiet_Prayer.mp3","fileSize":1667465,"name":"[SOJ] A Quiet Prayer","volume":1},{"id":168641,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003283802279395348/Andistandhin_-_Ethnic_Music.mp3","fileSize":3002695,"name":"[SOJ] Andistan'dhin - Ethnic Music","volume":1},{"id":168637,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003283802547822642/Andistandhin_-_Head-Banging.mp3","fileSize":3102223,"name":"[SOJ] Andistan'dhin - Head-Banging","volume":1},{"id":168669,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003283802912735305/Apollo_Justice_-_A_New_Era_Begins_2016.mp3","fileSize":7392346,"name":"[SOJ] Apollo Justice - A New Era Begins! 2016","volume":1},{"id":168651,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003283803260854373/Athena_Cykes_-_Courtroom_Revolutionnaire_2016.mp3","fileSize":7420722,"name":"[SOJ] Athena Cykes - Courtroom Révolutionnaire 2016","volume":1},{"id":168652,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003283803608985671/Audience_Chamber.mp3","fileSize":6443608,"name":"[SOJ] Audience Chamber","volume":1},{"id":168649,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003283803894202418/Cheerful_Folk.mp3","fileSize":3405405,"name":"[SOJ] Cheerful Folk","volume":1},{"id":168646,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003283804221341806/Courtroom_Revolution_-_Gather_Under_the_Flag.mp3","fileSize":7238300,"name":"[SOJ] Courtroom Revolution - Gather Under the Flag","volume":1},{"id":168653,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003283805123133530/Cross-Examination_-_Allegro_2016.mp3","fileSize":4934153,"name":"[SOJ] Cross-Examination - Allegro 2016","volume":1},{"id":168675,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003283927093493840/Cross-Examination_-_Moderato_2016.mp3","fileSize":4453672,"name":"[SOJ] Cross-Examination - Moderato 2016","volume":1},{"id":168639,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003283927408054342/Defendant_Lobby_-_Beginning_of_the_Revolution.mp3","fileSize":4664905,"name":"[SOJ] Defendant Lobby - Beginning of the Revolution","volume":1},{"id":168661,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003283927743606825/Defendant_Lobby_-_Beginning_of_the_Truth.mp3","fileSize":3553812,"name":"[SOJ] Defendant Lobby - Beginning of the Truth","volume":1},{"id":168671,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003283928280481902/Detention_Center_-_The_Cold-Glasss_Elegy.mp3","fileSize":4392593,"name":"[SOJ] Detention Center - The Cold-Glass's Elegy","volume":1},{"id":168643,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003283928657956884/Detention_Center_-_The_Iron-Bars_Elegy.mp3","fileSize":3411693,"name":"[SOJ] Detention Center - The Iron-Bars' Elegy","volume":1},{"id":168677,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003283929014489099/Dhurke_-_A_Dragon_Never_Yields.mp3","fileSize":5343438,"name":"[SOJ] Dhurke - A Dragon Never Yields","volume":1},{"id":168673,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003283929333235783/Divination_Seance_-_Last_Sights.mp3","fileSize":5168186,"name":"[SOJ] Divination Séance - Last Sights","volume":1},{"id":168664,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003283929647824956/Divination_Seance_-_The_Spirits_Accusation.mp3","fileSize":4091077,"name":"[SOJ] Divination Séance - The Spirit's Accusation","volume":1},{"id":168678,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003283929949802567/Ellen_Wyatt_-_Walking_Down_the_Aisle.mp3","fileSize":4552916,"name":"[SOJ] Ellen Wyatt - Walking Down the Aisle","volume":1},{"id":168657,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003283930209857541/Ema_Skye_-_The_Scientific_Detective_2016.mp3","fileSize":4640642,"name":"[SOJ] Ema Skye - The Scientific Detective 2016","volume":1},{"id":168648,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003284548093747311/Heart_of_the_Investigation_Core_2016.mp3","fileSize":4923987,"name":"[SOJ] Heart of the Investigation [Core 2016]","volume":1},{"id":168672,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003284548412518400/Heart_of_the_Investigation_Abroad_Core_2016.mp3","fileSize":4526103,"name":"[SOJ] Heart of the Investigation Abroad [Core 2016]","volume":1},{"id":168638,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003284548714512384/Initial_Investigation_Opening_2016.mp3","fileSize":3663987,"name":"[SOJ] Initial Investigation [Opening 2016]","volume":1},{"id":168674,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003284549003923506/Initial_Investigation_Abroad_Opening_2016.mp3","fileSize":3792295,"name":"[SOJ] Initial Investigation Abroad [Opening 2016]","volume":1},{"id":168668,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003284549297516544/Inner_Sanctum.mp3","fileSize":5674112,"name":"[SOJ] Inner Sanctum","volume":1},{"id":168662,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003284549775663104/Its_show_time.mp3","fileSize":3085778,"name":"[SOJ] It's show time!","volume":1},{"id":168650,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003284550174117938/Khurainese_Bazaar_-_A_Foreign_Trip.mp3","fileSize":4830495,"name":"[SOJ] Khura'inese Bazaar - A Foreign Trip","volume":1},{"id":168670,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003284550467723274/Kurain_Village_2016.mp3","fileSize":3567860,"name":"[SOJ] Kurain Village 2016","volume":1},{"id":168655,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003284550757138472/Lady_Keera_-_The_Guardian_of_Khurain.mp3","fileSize":5544939,"name":"[SOJ] Lady Kee'ra - The Guardian of Khura'in","volume":1},{"id":168660,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003284551088480256/Larry_Butz_-_When_Something_Smells_Its_Usually_Me_2016.mp3","fileSize":4125185,"name":"[SOJ] Larry Butz - When Something Smells, It's Usually Me 2016","volume":1},{"id":168658,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003284860200292372/Logic_Construct_Trick_2016.mp3","fileSize":6212187,"name":"[SOJ] Logic Construct [Trick 2016]","volume":1},{"id":168665,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003284860460355634/Maya_Fey_-_Turnabout_Sisters_2016.mp3","fileSize":5486426,"name":"[SOJ] Maya Fey - Turnabout Sisters 2016","volume":1},{"id":168666,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003284860716187708/Mr._Reus_-_The_Masked_Magician.mp3","fileSize":5863033,"name":"[SOJ] Mr. Reus - The Masked Magician","volume":1},{"id":168667,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003284861005598793/Nahyuta_Sahdmadhi_-_The_Last_Rites_Prosecutor.mp3","fileSize":6188445,"name":"[SOJ] Nahyuta Sahdmadhi - The Last Rites Prosecutor","volume":1},{"id":168676,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003284861307600946/Odd_Folk.mp3","fileSize":3981300,"name":"[SOJ] Odd Folk","volume":1},{"id":168656,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003284861647323196/Paul_Atishon_-_A_Vote_for_Atishon.mp3","fileSize":4360569,"name":"[SOJ] Paul Atishon - A Vote for Atishon!","volume":1},{"id":168645,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003284861953523772/Phoenix_Wright_-_Objection_2016.mp3","fileSize":5909506,"name":"[SOJ] Phoenix Wright - Objection 2016","volume":1},{"id":168640,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003284862310031400/Pursuit_-_Cornering_Together_Variation_Pursuit_2016.mp3","fileSize":5626586,"name":"[SOJ] Pursuit - Cornering Together (Variation) [Pursuit 2016]","volume":1},{"id":168663,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003284862716883004/Pursuit_-_Cornering_Together_Pursuit_2016.mp3","fileSize":5754448,"name":"[SOJ] Pursuit - Cornering Together [Pursuit 2016]","volume":1},{"id":168642,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003284863031463986/Rayfa_Padma_Khurain_-_The_Unyielding_Medium_Princess.mp3","fileSize":6096311,"name":"[SOJ] Rayfa Padma Khura'in - The Unyielding Medium Princess","volume":1},{"id":168644,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003284974142767114/Reminiscences_-_A_Final_Conversation.mp3","fileSize":4953754,"name":"[SOJ] Reminiscences - A Final Conversation","volume":1},{"id":168659,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003284974448943204/Reminiscences_-_Each_of_Their_Feelings.mp3","fileSize":6507082,"name":"[SOJ] Reminiscences - Each of Their Feelings","volume":1},{"id":168654,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003284974738346004/Reminiscences_-_Farewell_Once_Again.mp3","fileSize":1331385,"name":"[SOJ] Reminiscences - Farewell, Once Again","volume":1},{"id":168693,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003284975031955456/Reminiscences_-_Inherited_Hopes.mp3","fileSize":4788166,"name":"[SOJ] Reminiscences - Inherited Hopes","volume":1},{"id":168696,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003284975476547604/Reminiscences_-_Smile_No_Matter_What.mp3","fileSize":3482997,"name":"[SOJ] Reminiscences - Smile, No Matter What","volume":1},{"id":168699,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003284975942119434/Spirit_of_Justice_-_Court_is_Now_in_Session_Trial_2016.mp3","fileSize":4158622,"name":"[SOJ] Spirit of Justice - Court is Now in Session [Trial 2016]","volume":1},{"id":168698,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003284976244117565/Spirit_of_Justice_-_Court_is_Now_in_Session_Abroad_Trial_2016.mp3","fileSize":4665906,"name":"[SOJ] Spirit of Justice - Court is Now in Session Abroad [Trial 2016]","volume":1},{"id":168704,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003284976600617030/Spirit_of_Justice_-_Ending.mp3","fileSize":7284715,"name":"[SOJ] Spirit of Justice - Ending","volume":1},{"id":168697,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003284976894222397/Spirit_of_Justice_-_Opening.mp3","fileSize":1308660,"name":"[SOJ] Spirit of Justice - Opening","volume":1},{"id":168706,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003284977225568266/The_Basics_of_the_Case.mp3","fileSize":4032812,"name":"[SOJ] The Basics of the Case","volume":1},{"id":168701,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003285175792316456/The_Court_of_Resignation.mp3","fileSize":6355409,"name":"[SOJ] The Court of Resignation","volume":1},{"id":168695,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003285176148828271/The_Dance_of_Devotion.mp3","fileSize":3247185,"name":"[SOJ] The Dance of Devotion","volume":1},{"id":168700,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003285176446627860/The_Holy_Mother_-_Teachings_of_Khurain.mp3","fileSize":5752882,"name":"[SOJ] The Holy Mother - Teachings of Khura'in","volume":1},{"id":168694,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003285176744411189/The_Plumed_Punisher_-_Warrior_of_Neo_Twilight_Realm.mp3","fileSize":4191187,"name":"[SOJ] The Plumed Punisher - Warrior of Neo Twilight Realm","volume":1},{"id":168705,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003285177012854855/The_Revolutionaries_-_Defiant_Dragons.mp3","fileSize":7322594,"name":"[SOJ] The Revolutionaries - Defiant Dragons","volume":1},{"id":168703,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003285177335812116/The_Truth_Revealed_Truth_2016.mp3","fileSize":6321369,"name":"[SOJ] The Truth Revealed [Truth 2016]","volume":1},{"id":168709,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003285177721683968/The_Woman_Freed.mp3","fileSize":6048550,"name":"[SOJ] The Woman Freed","volume":1},{"id":168707,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003285178019483700/Troupe_Gramarye_2016.mp3","fileSize":5167780,"name":"[SOJ] Troupe Gramarye 2016","volume":1},{"id":168702,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003285178287931492/Uendo_Toneido_-_Whirlwind_of_Laughter.mp3","fileSize":4114816,"name":"[SOJ] Uendo Toneido - Whirlwind of Laughter","volume":1},{"id":168708,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003285178547982456/Victory_-_Each_of_Their_Wins_Victory_2016.mp3","fileSize":7452589,"name":"[SOJ] Victory! - Each of Their Wins [Victory 2016]","volume":1},{"id":168692,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003285180104048750/Will_You_Marry_Me.mp3","fileSize":3476812,"name":"[SOJ] Will You Marry Me?","volume":1});
            if (socketStates.options['ost-tgaa1'] && !musicList.find(music => music.id === 168447)) musicList.push({"id":168447,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003282079045394482/The_Adventure_of_the_Great_Beginning_1.mp3","fileSize":1304525,"name":"[TGAA1] \"The Adventure of the Great Beginning\" (1)","volume":1},{"id":168450,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003282079422873600/The_Adventure_of_the_Great_Beginning_2.mp3","fileSize":701165,"name":"[TGAA1] \"The Adventure of the Great Beginning\" (2)","volume":1},{"id":168448,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003282079775215667/221B_Baker_Street.mp3","fileSize":4890863,"name":"[TGAA1] 221B Baker Street","volume":1},{"id":168449,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003282080190431282/A_Battle_of_Wits_-_Breakthrough.mp3","fileSize":4986397,"name":"[TGAA1] A Battle of Wits - Breakthrough","volume":1},{"id":168360,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003282080643432509/A_Battle_of_Wits_-_Opening_Moves.mp3","fileSize":5543774,"name":"[TGAA1] A Battle of Wits - Opening Moves","volume":1},{"id":168422,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003282081016709171/A_Farcial_Comedy_-_Boisterous_Folk.mp3","fileSize":3132830,"name":"[TGAA1] A Farcial Comedy - Boisterous Folk","volume":1},{"id":168453,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003282081448738887/A_Great_Blaze.mp3","fileSize":1744075,"name":"[TGAA1] A Great Blaze","volume":1},{"id":168460,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003282081780080700/A_Great_Twist_-_Suspense_I.mp3","fileSize":4544024,"name":"[TGAA1] A Great Twist - Suspense I","volume":1},{"id":168456,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003282082073673848/A_Great_Twist_-_Suspense_II.mp3","fileSize":4753017,"name":"[TGAA1] A Great Twist - Suspense II","volume":1},{"id":168458,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003282082455371786/Ambience_-_Sea_of_Japan.mp3","fileSize":2614333,"name":"[TGAA1] Ambience - Sea of Japan","volume":1},{"id":168461,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003282125199519814/Ambience_-_Strongharts_Cogwheels.mp3","fileSize":2092414,"name":"[TGAA1] Ambience - Stronghart's Cogwheels","volume":1},{"id":168465,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003282126583631932/Arrival.mp3","fileSize":677463,"name":"[TGAA1] Arrival","volume":1},{"id":168469,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003282125501517834/Arrival_Unused.mp3","fileSize":656998,"name":"[TGAA1] Arrival (Unused)","volume":1},{"id":168475,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003282126864658432/Barok_van_Zieks_-_The_Reaper_of_the_Bailey.mp3","fileSize":8355600,"name":"[TGAA1] Barok van Zieks - The Reaper of the Bailey","volume":1},{"id":168466,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003282127200190534/Citizens_of_the_Fog_-_Suspicious_Folk.mp3","fileSize":4267025,"name":"[TGAA1] Citizens of the Fog - Suspicious Folk","volume":1},{"id":168464,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003282127565107282/Complications_in_the_Proceedings.mp3","fileSize":3526526,"name":"[TGAA1] Complications in the Proceedings","volume":1},{"id":168483,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003282127900643428/Curtain_Call_Suite_-_Adventures_End.mp3","fileSize":6857038,"name":"[TGAA1] Curtain Call Suite - Adventures' End","volume":1},{"id":168480,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003282128223613038/Curtain_Call_Suite_-_The_Great_Ace_Attorney_Continues_Forth.mp3","fileSize":5153436,"name":"[TGAA1] Curtain Call Suite - The Great Ace Attorney Continues Forth","volume":1},{"id":168364,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003282128634650664/Dance_of_Deduction_-_Backstage_Type_A.mp3","fileSize":3675821,"name":"[TGAA1] Dance of Deduction - Backstage (Type A)","volume":1},{"id":168452,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003282128991170570/Dance_of_Deduction_-_Backstage_Type_C.mp3","fileSize":3953357,"name":"[TGAA1] Dance of Deduction - Backstage (Type C)","volume":1},{"id":168363,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003282185626857582/Dance_of_Deduction_Type_A.mp3","fileSize":4039449,"name":"[TGAA1] Dance of Deduction (Type A)","volume":1},{"id":168451,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003282185316475030/Dance_of_Deduction_Type_A_No_Intro.mp3","fileSize":3877276,"name":"[TGAA1] Dance of Deduction (Type A) (No Intro)","volume":1},{"id":168368,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003282185912062032/Dance_of_Deduction_Type_B.mp3","fileSize":3822873,"name":"[TGAA1] Dance of Deduction (Type B)","volume":1},{"id":168369,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003282186176307240/Dance_of_Deduction_Type_C.mp3","fileSize":4130705,"name":"[TGAA1] Dance of Deduction (Type C)","volume":1},{"id":168455,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003282186461524089/Daybreak_Over_the_Unspeakable_Story.mp3","fileSize":2604161,"name":"[TGAA1] Daybreak Over the Unspeakable Story","volume":1},{"id":168457,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003282187006779472/Gina_Lestrade_-_A_Blast_from_the_East_End.mp3","fileSize":3750885,"name":"[TGAA1] Gina Lestrade - A Blast from the East End","volume":1},{"id":168454,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003282186704785479/Gina_Lestrade_-_A_Blast_from_the_East_End_Unused.mp3","fileSize":4100740,"name":"[TGAA1] Gina Lestrade - A Blast from the East End (Unused)","volume":1},{"id":168481,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003282187287805973/Great_Cross-Examination_-_Allegro_2015.mp3","fileSize":5355279,"name":"[TGAA1] Great Cross-Examination - Allegro 2015","volume":1},{"id":168459,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003282187556245514/Great_Cross-Examination_-_Moderato_2015.mp3","fileSize":4211104,"name":"[TGAA1] Great Cross-Examination - Moderato 2015","volume":1},{"id":168384,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003282187820466176/Herlock_Sholmes_-_Great_Detective_of_Foggy_London_Town.mp3","fileSize":5555412,"name":"[TGAA1] Herlock Sholmes - Great Detective of Foggy London Town","volume":1},{"id":168463,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003282277486313532/Investigation_Unused.mp3","fileSize":5146826,"name":"[TGAA1] Investigation (Unused)","volume":1},{"id":168467,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003282277834444850/Investigation_Opening_2015.mp3","fileSize":6935371,"name":"[TGAA1] Investigation [Opening 2015]","volume":1},{"id":168477,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003282278169985034/Iris_Wilson_-_Young_Biographer.mp3","fileSize":3278076,"name":"[TGAA1] Iris Wilson - Young Biographer","volume":1},{"id":168478,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003282278652313720/Iris_Wilson_Unused.mp3","fileSize":3215880,"name":"[TGAA1] Iris Wilson (Unused)","volume":1},{"id":168462,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003282279843504128/Jezaille_Brett_-_Elegance..._and_Excellence.mp3","fileSize":3678601,"name":"[TGAA1] Jezaille Brett - Elegance... and Excellence","volume":1},{"id":168479,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003282280330039366/Kazuma_Asogi_-_Nocturne.mp3","fileSize":5603043,"name":"[TGAA1] Kazuma Asogi - Nocturne","volume":1},{"id":168471,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003282280736882749/Kazuma_Asogi_-_Samurai_on_a_Mission.mp3","fileSize":4858479,"name":"[TGAA1] Kazuma Asogi - Samurai on a Mission","volume":1},{"id":168484,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003282281047273593/Kazuma_Asogi_Unused.mp3","fileSize":5627783,"name":"[TGAA1] Kazuma Asogi (Unused)","volume":1},{"id":168474,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003282281412169778/Local_Prison_-_Rhapsody_in_Gloom.mp3","fileSize":5639148,"name":"[TGAA1] Local Prison - Rhapsody in Gloom","volume":1},{"id":168472,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003282281680613427/London_Town.mp3","fileSize":6736385,"name":"[TGAA1] London Town","volume":1},{"id":168470,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003282326337368125/Lord_Chief_Justice_Stronghart_-_Time-Keeper_of_the_Law.mp3","fileSize":6063058,"name":"[TGAA1] Lord Chief Justice Stronghart - Time-Keeper of the Law","volume":1},{"id":168482,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003282326609993738/Lord_Chief_Justice_Stronghart_Unused.mp3","fileSize":4549170,"name":"[TGAA1] Lord Chief Justice Stronghart (Unused)","volume":1},{"id":168468,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003282326886809600/Machinations_and_Deductions_Trick_2015.mp3","fileSize":4834137,"name":"[TGAA1] Machinations and Deductions [Trick 2015]","volume":1},{"id":168473,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003282327184621588/Music_Box_-_A_Novel_New_Sound.mp3","fileSize":1793340,"name":"[TGAA1] Music Box - A Novel, New Sound","volume":1},{"id":168441,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003282327482404974/Music_Box_-_Great_Detective_of_Foggy_London_Town.mp3","fileSize":1581390,"name":"[TGAA1] Music Box - Great Detective of Foggy London Town","volume":1},{"id":168476,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003282327780217042/Nikolina_Pavlova_-_A_Migrating_Russian_Breeze.mp3","fileSize":4194123,"name":"[TGAA1] Nikolina Pavlova - A Migrating Russian Breeze","volume":1},{"id":168485,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003282328069615706/Omen_I.mp3","fileSize":2238337,"name":"[TGAA1] Omen I","volume":1},{"id":168488,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003282328338047006/Omen_II.mp3","fileSize":2173681,"name":"[TGAA1] Omen II","volume":1},{"id":168491,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003282328610689125/One_Last_Tragedy_1.mp3","fileSize":1364071,"name":"[TGAA1] One Last Tragedy (1)","volume":1},{"id":168509,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003282328916865044/One_Last_Tragedy_2.mp3","fileSize":461959,"name":"[TGAA1] One Last Tragedy (2)","volume":1},{"id":168486,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003282382285197452/Ordinary_Londoners_Ordinary_Lives.mp3","fileSize":4367462,"name":"[TGAA1] Ordinary Londoners, Ordinary Lives","volume":1},{"id":168489,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003282382834647171/Prologue_-_A_Most_Mysterious_Mood.mp3","fileSize":4803709,"name":"[TGAA1] Prologue - A Most Mysterious Mood","volume":1},{"id":168522,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003282382553616434/Prologue_-_A_Most_Mysterious_Mood_Unused.mp3","fileSize":4323740,"name":"[TGAA1] Prologue - A Most Mysterious Mood (Unused)","volume":1},{"id":168492,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003282383128252426/Pursuit_-_A_Great_Turnabout_Pursuit_2015.mp3","fileSize":6491241,"name":"[TGAA1] Pursuit - A Great Turnabout [Pursuit 2015]","volume":1},{"id":168487,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003282383417643008/Reminiscences_-_An_Ashen_Waltz.mp3","fileSize":8134428,"name":"[TGAA1] Reminiscences - An Ashen Waltz","volume":1},{"id":168494,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003282383686090782/Reminiscences_-_Fallen_Angel.mp3","fileSize":5197592,"name":"[TGAA1] Reminiscences - Fallen Angel","volume":1},{"id":168501,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003282384248119366/Reminiscences_-_Ryunosukes_Flashback.mp3","fileSize":2376089,"name":"[TGAA1] Reminiscences - Ryunosuke's Flashback","volume":1},{"id":168495,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003282383958704198/Reminiscences_-_Ryunosukes_Flashback_Unused.mp3","fileSize":2906208,"name":"[TGAA1] Reminiscences - Ryunosuke's Flashback (Unused)","volume":1},{"id":168497,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003282384529145876/Reminiscences_-_Sympathy_for_the_Sinner_but_Not_the_Sin.mp3","fileSize":5923020,"name":"[TGAA1] Reminiscences - Sympathy for the Sinner, but Not the Sin","volume":1},{"id":168514,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003282384822734868/Ryunosuke_Naruhodo_-_Objection_2015.mp3","fileSize":4077661,"name":"[TGAA1] Ryunosuke Naruhodo - Objection 2015","volume":1},{"id":168511,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003282431668920330/Ryunosuke_Naruhodo_-_Overture_to_Adventures.mp3","fileSize":4064233,"name":"[TGAA1] Ryunosuke Naruhodo - Overture to Adventures","volume":1},{"id":168517,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003282431144644668/Ryunosuke_Naruhodo_-_Overture_to_Adventures_Unused.mp3","fileSize":4158248,"name":"[TGAA1] Ryunosuke Naruhodo - Overture to Adventures (Unused)","volume":1},{"id":168515,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003282431945748480/Soseki_Natsume_-_I_Am_Not_Guilty.mp3","fileSize":4690812,"name":"[TGAA1] Soseki Natsume - I Am Not Guilty","volume":1},{"id":168493,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003282432222568458/Summation_Examination.mp3","fileSize":6149523,"name":"[TGAA1] Summation Examination","volume":1},{"id":168500,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003282433535377498/Susato_Mikotoba_-_A_New_Bloom_in_the_New_World.mp3","fileSize":5045930,"name":"[TGAA1] Susato Mikotoba - A New Bloom in the New World","volume":1},{"id":168510,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003282432549728317/Susato_Mikotoba_-_A_New_Bloom_in_the_New_World_Unused.mp3","fileSize":4625099,"name":"[TGAA1] Susato Mikotoba - A New Bloom in the New World (Unused)","volume":1},{"id":168516,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003282433824792576/Susato_Mikotoba_-_Serenade.mp3","fileSize":4558326,"name":"[TGAA1] Susato Mikotoba - Serenade","volume":1},{"id":168498,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003282434198089779/The_Adventure_of_the_Great_Beginning_Unused.mp3","fileSize":1279683,"name":"[TGAA1] The Adventure of the Great Beginning (Unused)","volume":1},{"id":168502,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003282434500067398/The_Adventure_of_the_Runaway_Room.mp3","fileSize":2211233,"name":"[TGAA1] The Adventure of the Runaway Room","volume":1},{"id":168499,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003282434835623976/The_Adventure_of_the_Unbreakable_Speckled_Band_1.mp3","fileSize":2159653,"name":"[TGAA1] The Adventure of the Unbreakable Speckled Band (1)","volume":1},{"id":168523,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003282579866271794/The_Adventure_of_the_Unbreakable_Speckled_Band_2.mp3","fileSize":1485037,"name":"[TGAA1] The Adventure of the Unbreakable Speckled Band (2)","volume":1},{"id":168490,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003282580147273728/The_Defendants_Antechamber.mp3","fileSize":4044105,"name":"[TGAA1] The Defendants' Antechamber","volume":1},{"id":168506,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003282580889677824/The_Great_Ace_Attorney_-_Adjudication.mp3","fileSize":6345979,"name":"[TGAA1] The Great Ace Attorney - Adjudication","volume":1},{"id":168508,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003282580487028777/The_Great_Ace_Attorney_-_Adjudication_Unused.mp3","fileSize":5608706,"name":"[TGAA1] The Great Ace Attorney - Adjudication (Unused)","volume":1},{"id":168513,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003282581246201886/The_Great_Ace_Attorney_-_Court_is_Now_in_Session_Unused.mp3","fileSize":3918635,"name":"[TGAA1] The Great Ace Attorney - Court is Now in Session (Unused)","volume":1},{"id":168507,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003282581539790878/The_Great_Ace_Attorney_-_Court_is_Now_in_Session_Trial_2015.mp3","fileSize":6395214,"name":"[TGAA1] The Great Ace Attorney - Court is Now in Session [Trial 2015]","volume":1},{"id":168496,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003282581845970994/The_Great_Detectives_Morose_Mood.mp3","fileSize":2045775,"name":"[TGAA1] The Great Detective's Morose Mood","volume":1},{"id":168512,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003282582110228552/The_Heart_of_the_Matter_Core_2015.mp3","fileSize":5560373,"name":"[TGAA1] The Heart of the Matter [Core 2015]","volume":1},{"id":168504,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003282582399631370/The_SS_Burya.mp3","fileSize":4439466,"name":"[TGAA1] The SS Burya","volume":1},{"id":168520,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003282582722580601/The_Truth_Revealed_Unused_1.mp3","fileSize":5806737,"name":"[TGAA1] The Truth Revealed (Unused 1)","volume":1},{"id":168521,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003282659797119016/The_Truth_Revealed_Unused_2.mp3","fileSize":5079777,"name":"[TGAA1] The Truth Revealed (Unused 2)","volume":1},{"id":168503,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003282660094922822/The_Truth_Revealed_Truth_2015.mp3","fileSize":7118256,"name":"[TGAA1] The Truth Revealed [Truth 2015]","volume":1},{"id":168518,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003282660380115096/The_Witnesses_Take_the_Stand.mp3","fileSize":4806010,"name":"[TGAA1] The Witnesses Take the Stand","volume":1},{"id":168413,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003282660648554507/Theme_of_Deduction_-_At_the_End_of_a_Chain_of_Logical_Sequences.mp3","fileSize":4315483,"name":"[TGAA1] Theme of Deduction - At the End of a Chain of Logical Sequences","volume":1},{"id":168519,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003282660904423465/Tobias_Gregson_-_The_Great_Detectives_Great_Foe.mp3","fileSize":4549900,"name":"[TGAA1] Tobias Gregson - The Great Detective's Great Foe","volume":1},{"id":168505,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003282661172846592/Victory_-_In_Honour_of_My_Friend_Victory_2015.mp3","fileSize":5040446,"name":"[TGAA1] Victory - In Honour of My Friend [Victory 2015]","volume":1});
            if (socketStates.options['ost-tgaa2'] && !musicList.find(music => music.id === 168538)) musicList.push({"id":168538,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003282984251703296/A_Battle_of_Wits_-_Backstage_Partners_Version.mp3","fileSize":6237637,"name":"[TGAA2] A Battle of Wits - Backstage (Partners Version)","volume":1},{"id":168587,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003282984901812224/Ambience_-_The_Great_Exhibition.mp3","fileSize":1648386,"name":"[TGAA2] Ambience - The Great Exhibition","volume":1},{"id":168588,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003282984553697280/Ambience_-_The_Great_Exhibition_Stage.mp3","fileSize":1545890,"name":"[TGAA2] Ambience - The Great Exhibition Stage","volume":1},{"id":168589,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003282985216389150/Baker_Street_Ball_-_Waltz_for_Chronicles.mp3","fileSize":3788491,"name":"[TGAA2] Baker Street Ball - Waltz for Chronicles","volume":1},{"id":168586,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003282985505787904/Curtain_Call_Suite_-_Treasured_Melodies.mp3","fileSize":7373165,"name":"[TGAA2] Curtain Call Suite - Treasured Melodies","volume":1},{"id":168590,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003282985824559184/Daley_Vigil_-_The_Prison_Warders.mp3","fileSize":4406890,"name":"[TGAA2] Daley Vigil - The Prison Warders","volume":1},{"id":168591,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003282986118168606/Doctor_Sithe_-_Untouchable_Coroner.mp3","fileSize":5283613,"name":"[TGAA2] Doctor Sithe - Untouchable Coroner","volume":1},{"id":168592,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003282986424344696/Enoch_Drebber_-_Rondo_of_Science_and_Magic.mp3","fileSize":3970773,"name":"[TGAA2] Enoch Drebber - Rondo of Science and Magic","volume":1},{"id":168599,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003282987196108820/German_Song_-_Ode_an_die_Wut.mp3","fileSize":1203341,"name":"[TGAA2] German Song - 'Ode an die Wut'","volume":1},{"id":168593,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003282986843779122/German_Song_-_Ode_an_die_Wut_Unused_Instrumental.mp3","fileSize":3100325,"name":"[TGAA2] German Song - 'Ode an die Wut' (Unused Instrumental)","volume":1},{"id":168601,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003283291404779571/Grand_Finale_-_Epilogue.mp3","fileSize":4536111,"name":"[TGAA2] Grand Finale - Epilogue","volume":1},{"id":168600,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003283291962605659/Great_Pursuit_-_The_Resolve_of_Ryunosuke_Naruhodo.mp3","fileSize":4521868,"name":"[TGAA2] Great Pursuit - The Resolve of Ryunosuke Naruhodo","volume":1},{"id":168603,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003283291719348224/Great_Pursuit_-_The_Resolve_of_Ryunosuke_Naruhodo_Unused.mp3","fileSize":4502894,"name":"[TGAA2] Great Pursuit - The Resolve of Ryunosuke Naruhodo (Unused)","volume":1},{"id":168595,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003283292264599552/Kazuma_Asogi_-_A_Prosecutor_Reborn.mp3","fileSize":5868924,"name":"[TGAA2] Kazuma Asogi - A Prosecutor, Reborn","volume":1},{"id":168597,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003283292654682152/Kazuma_Asogi_-_His_Glorious_Return.mp3","fileSize":6342827,"name":"[TGAA2] Kazuma Asogi - His Glorious Return","volume":1},{"id":168608,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003283293279629362/Madame_Tusspells_-_Mysteries_Encased_in_Wax.mp3","fileSize":4194454,"name":"[TGAA2] Madame Tusspells - Mysteries Encased in Wax","volume":1},{"id":168610,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003283292990218250/Madame_Tusspells_-_Mysteries_Encased_in_Wax_Unused.mp3","fileSize":6419765,"name":"[TGAA2] Madame Tusspells - Mysteries Encased in Wax (Unused)","volume":1},{"id":168612,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003283293946519592/Murky_Murderous_Intentions.mp3","fileSize":6270869,"name":"[TGAA2] Murky Murderous Intentions","volume":1},{"id":168611,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003283293585817681/Murky_Murderous_Intentions_Unused.mp3","fileSize":2509623,"name":"[TGAA2] Murky Murderous Intentions (Unused)","volume":1},{"id":168615,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003283294256902244/Our_Separate_Paths.mp3","fileSize":6541653,"name":"[TGAA2] Our Separate Paths","volume":1},{"id":168535,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003283527837679646/Partners_-_The_game_is_afoot.mp3","fileSize":7533656,"name":"[TGAA2] Partners - The game is afoot!","volume":1},{"id":168529,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003283527133052978/Partners_-_The_game_is_afoot_Unused.mp3","fileSize":7304826,"name":"[TGAA2] Partners - The game is afoot! (Unused)","volume":1},{"id":168525,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003283527493759146/Partners_-_The_game_is_afoot_Variation.mp3","fileSize":6960078,"name":"[TGAA2] Partners - The game is afoot! (Variation)","volume":1},{"id":168531,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003283528236159026/Partners_With_Intro.mp3","fileSize":3945534,"name":"[TGAA2] Partners (With Intro)","volume":1},{"id":168558,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003283529095983175/Prelude_to_Pursuit.mp3","fileSize":4799709,"name":"[TGAA2] Prelude to Pursuit","volume":1},{"id":168528,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003283528756248637/Prelude_to_Pursuit_Unused.mp3","fileSize":4699231,"name":"[TGAA2] Prelude to Pursuit (Unused)","volume":1},{"id":168598,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003283529737699348/Professor_Harebrayne_-_Student_of_Science.mp3","fileSize":4358227,"name":"[TGAA2] Professor Harebrayne - Student of Science","volume":1},{"id":168594,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003283529431519293/Professor_Harebrayne_-_Student_of_Science_Unused.mp3","fileSize":4217765,"name":"[TGAA2] Professor Harebrayne - Student of Science (Unused)","volume":1},{"id":168616,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003283530039701584/Raiten_Menimemo_-_One_Journos_Menimemoism.mp3","fileSize":4393844,"name":"[TGAA2] Raiten Menimemo - One Journo's Menimemoism","volume":1},{"id":168602,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003283530412990565/Reminiscences_-_Disproved_Formulas.mp3","fileSize":6519804,"name":"[TGAA2] Reminiscences - Disproved Formulas","volume":1},{"id":168596,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003283596351639562/Reminiscences_-_In_Search_of_Family.mp3","fileSize":5328302,"name":"[TGAA2] Reminiscences - In Search of Family","volume":1},{"id":168604,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003283596628475985/Reminiscences_-_Killers_Crossroads.mp3","fileSize":6526837,"name":"[TGAA2] Reminiscences - Killers' Crossroads","volume":1},{"id":168605,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003283596896915537/Reminiscences_-_The_Fruits_of_Ambition.mp3","fileSize":7087264,"name":"[TGAA2] Reminiscences - The Fruits of Ambition","volume":1},{"id":168607,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003283597509267456/Ryunosuke_Naruhodo_-_Overture_to_Resolve.mp3","fileSize":4506691,"name":"[TGAA2] Ryunosuke Naruhodo - Overture to Resolve","volume":1},{"id":168613,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003283597249232946/Ryunosuke_Naruhodo_-_Overture_to_Resolve_Unused.mp3","fileSize":6115109,"name":"[TGAA2] Ryunosuke Naruhodo - Overture to Resolve (Unused)","volume":1},{"id":168606,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003283597811265586/Ryutaro_Naruhodo_-_Objection_2017.mp3","fileSize":4371463,"name":"[TGAA2] Ryutaro Naruhodo - Objection 2017","volume":1},{"id":168609,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003283598104875088/Ryutaro_Naruhodo_-_Prelude_to_the_Blossoming_Attorney.mp3","fileSize":4257391,"name":"[TGAA2] Ryutaro Naruhodo - Prelude to the Blossoming Attorney","volume":1},{"id":168617,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003283598662709258/Swirling_Void_of_Nothingness.mp3","fileSize":4332343,"name":"[TGAA2] Swirling Void of Nothingness","volume":1},{"id":168614,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003283598423625780/Swirling_Void_of_Nothingness_Unused.mp3","fileSize":2340089,"name":"[TGAA2] Swirling Void of Nothingness (Unused)","volume":1},{"id":168620,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003283598926946344/The_Great_Ace_Attorney_Continues_Forth_Music_Box.mp3","fileSize":3255437,"name":"[TGAA2] The Great Ace Attorney Continues Forth (Music Box)","volume":1},{"id":168618,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003283681537958009/The_Great_Closed_Trial_-_Court_is_Now_in_Session_Unused_1.mp3","fileSize":5972943,"name":"[TGAA2] The Great Closed Trial - Court is Now in Session (Unused 1)","volume":1},{"id":168628,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003283682225815652/The_Great_Closed_Trial_-_Court_is_Now_in_Session_Unused_2.mp3","fileSize":5555631,"name":"[TGAA2] The Great Closed Trial - Court is Now in Session (Unused 2)","volume":1},{"id":168633,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003283682511036426/The_Great_Closed_Trial_-_Court_is_Now_in_Session_Trial_2017.mp3","fileSize":7241451,"name":"[TGAA2] The Great Closed Trial - Court is Now in Session [Trial 2017]","volume":1},{"id":168623,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003283682850787459/The_Great_Closed_Trial_-_The_Defendants_Antechamber.mp3","fileSize":4353173,"name":"[TGAA2] The Great Closed Trial - The Defendants' Antechamber","volume":1},{"id":168629,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003283683421200495/The_Great_Exhibition.mp3","fileSize":4562734,"name":"[TGAA2] The Great Exhibition","volume":1},{"id":168624,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003283683165339669/The_Great_Exhibition_Unused.mp3","fileSize":2744817,"name":"[TGAA2] The Great Exhibition (Unused)","volume":1},{"id":168621,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003283683727397015/The_Legend_of_the_Baskervilles.mp3","fileSize":5616969,"name":"[TGAA2] The Legend of the Baskervilles","volume":1},{"id":168632,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003283684025172090/The_Professor_-_A_Spectre_Revived.mp3","fileSize":7317850,"name":"[TGAA2] The Professor - A Spectre Revived","volume":1},{"id":168619,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003283684306202754/The_Professor_-_Great_Gateway_to_the_Truth.mp3","fileSize":5555203,"name":"[TGAA2] The Professor - Great Gateway to the Truth","volume":1},{"id":168630,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003283684604006450/The_Reminiscences_of_Barok_van_Zieks.mp3","fileSize":7319871,"name":"[TGAA2] The Reminiscences of Barok van Zieks","volume":1},{"id":168631,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003283727935340554/The_Waxwork_Museum.mp3","fileSize":4632765,"name":"[TGAA2] The Waxwork Museum","volume":1},{"id":168625,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003283728384135178/Victory_-_One_Last_Great_Win_Unused.mp3","fileSize":8133256,"name":"[TGAA2] Victory - One Last Great Win (Unused)","volume":1},{"id":168627,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003283728753229965/Victory_-_One_Last_Great_Win_Victory_2017.mp3","fileSize":5248110,"name":"[TGAA2] Victory - One Last Great Win [Victory 2017]","volume":1},{"id":168622,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003283729130737774/William_Shamspeare_-_Back_Alley_Bard.mp3","fileSize":3875775,"name":"[TGAA2] William Shamspeare - Back Alley Bard","volume":1},{"id":168634,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003283729550151840/Words_of_Parting_-_His_Last_Bow.mp3","fileSize":2785474,"name":"[TGAA2] Words of Parting - His Last Bow","volume":1},{"id":168626,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003283729994743889/Yujin_Mikotoba_-_The_Great_Detectives_Great_Friend.mp3","fileSize":4751309,"name":"[TGAA2] Yujin Mikotoba - The Great Detective's Great Friend","volume":1});
            if (socketStates.options['ost-aai1'] && !musicList.find(music => music.id === 168987)) musicList.push({"id":168987,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003290557365358704/The_Kidnapped_Turnabout_-_Prelude_to_Kidnapping.mp3","fileSize":1774163,"name":"[AAI1] \"The Kidnapped Turnabout\" - Prelude to Kidnapping","volume":1},{"id":168997,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003290557608640532/The_Kidnapped_Turnabout_-_Tragedy_in_the_Haunted_House.mp3","fileSize":2279934,"name":"[AAI1] \"The Kidnapped Turnabout\" - Tragedy in the Haunted House","volume":1},{"id":168994,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003290557856100402/Turnabout_Ablaze.mp3","fileSize":2202887,"name":"[AAI1] \"Turnabout Ablaze\"","volume":1},{"id":168995,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003290558162292776/Turnabout_Airlines.mp3","fileSize":3717791,"name":"[AAI1] \"Turnabout Airlines\"","volume":1},{"id":168989,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003290558422335558/Turnabout_Reminiscence.mp3","fileSize":1068485,"name":"[AAI1] \"Turnabout Reminiscence\"","volume":1},{"id":168996,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003290558854340769/Ace_Attorney_Investigations_Miles_Edgeworth_-_Opening.mp3","fileSize":1878638,"name":"[AAI1] Ace Attorney Investigations Miles Edgeworth - Opening","volume":1},{"id":169027,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003290559194075166/Ace_Attorney_Investigations_Miles_Edgeworth_-_Triumphant_Return_2009.mp3","fileSize":7554194,"name":"[AAI1] Ace Attorney Investigations Miles Edgeworth - Triumphant Return 2009","volume":1},{"id":168998,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003290559466700840/Amusing_Folk.mp3","fileSize":4946359,"name":"[AAI1] Amusing Folk","volume":1},{"id":169000,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003290559881949245/Blue_Badger_March_-_Gatewater_Land_Theme.mp3","fileSize":6017105,"name":"[AAI1] Blue Badger March - Gatewater Land Theme","volume":1},{"id":169005,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003290560142004265/Calisto_Yew_-_Let_Me_Laugh_at_the_Cool.mp3","fileSize":5501349,"name":"[AAI1] Calisto Yew - Let Me Laugh at the Cool","volume":1},{"id":169023,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003290599761379368/Cammy_Meele_-_Good_Niiight.mp3","fileSize":3577569,"name":"[AAI1] Cammy Meele - Good Niiight","volume":1},{"id":169017,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003290600029831178/Confrontation_-_Allegro_2009.mp3","fileSize":5972813,"name":"[AAI1] Confrontation - Allegro 2009","volume":1},{"id":169002,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003290600356991019/Confrontation_-_Moderato_2009.mp3","fileSize":6546706,"name":"[AAI1] Confrontation - Moderato 2009","volume":1},{"id":169025,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003290600658960414/Confrontation_-_Presto_2009.mp3","fileSize":6106804,"name":"[AAI1] Confrontation - Presto 2009","volume":1},{"id":169019,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003290600960958544/Courtroom_-_Guardians_of_the_Law_Trial_2009.mp3","fileSize":4410305,"name":"[AAI1] Courtroom - Guardians of the Law [Trial 2009]","volume":1},{"id":169008,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003290601283915876/Crisis_of_Fate.mp3","fileSize":4820530,"name":"[AAI1] Crisis of Fate","volume":1},{"id":169004,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003290601606881350/Deduction_-_Contradiction_at_the_Crime_Scene.mp3","fileSize":5009658,"name":"[AAI1] Deduction - Contradiction at the Crime Scene","volume":1},{"id":169001,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003290601887903874/Dick_Gumshoe_-_I_Can_Do_It_When_It_Counts_Pal.mp3","fileSize":3494356,"name":"[AAI1] Dick Gumshoe - I Can Do It When It Counts, Pal!","volume":1},{"id":168993,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003290602223435796/Doubted_Folk.mp3","fileSize":5616529,"name":"[AAI1] Doubted Folk","volume":1},{"id":168986,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003290602575773776/Further_Investigation_Middle_2009.mp3","fileSize":6008931,"name":"[AAI1] Further Investigation [Middle 2009]","volume":1},{"id":168990,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003290625074016346/Heart_of_the_Investigation_Core_2009.mp3","fileSize":5514259,"name":"[AAI1] Heart of the Investigation [Core 2009]","volume":1},{"id":168988,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003290627141799936/Initial_Investigation_Opening_2009.mp3","fileSize":6715849,"name":"[AAI1] Initial Investigation [Opening 2009]","volume":1},{"id":168992,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003290627439611975/Kay_Faraday_-_The_Great_Truth_Thief.mp3","fileSize":4878666,"name":"[AAI1] Kay Faraday - The Great Truth Thief","volume":1},{"id":168991,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003290627754168320/Logic_-_Way_to_the_Truth_Trick_2009.mp3","fileSize":6662535,"name":"[AAI1] Logic - Way to the Truth [Trick 2009]","volume":1},{"id":169003,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003290628106502204/Miles_Edgeworth_-_Objection_2009.mp3","fileSize":5611060,"name":"[AAI1] Miles Edgeworth - Objection 2009","volume":1},{"id":168999,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003290628500771006/Noisy_Folk.mp3","fileSize":2997825,"name":"[AAI1] Noisy Folk","volume":1},{"id":169006,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003290628794363914/One_Prosecutors_Musings_-_Promise_to_Meet_Again.mp3","fileSize":6229452,"name":"[AAI1] One Prosecutor's Musings - Promise to Meet Again","volume":1},{"id":169024,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003290629050212452/Pursuit_-_Lying_Coldly_Pursuit_2009.mp3","fileSize":6533092,"name":"[AAI1] Pursuit - Lying Coldly [Pursuit 2009]","volume":1},{"id":169013,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003290629368975500/Quercus_Alba_-_The_Enemy_Who_Surpasses_the_Law.mp3","fileSize":6186063,"name":"[AAI1] Quercus Alba - The Enemy Who Surpasses the Law","volume":1},{"id":169022,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003290629670977656/Re-creation_-_The_Noble_Thiefs_Secret_Weapon.mp3","fileSize":4590528,"name":"[AAI1] Re-creation - The Noble Thief's Secret Weapon","volume":1},{"id":169010,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003290664856993893/Reminiscences_-_False_Relationships.mp3","fileSize":5381177,"name":"[AAI1] Reminiscences - False Relationships","volume":1},{"id":169020,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003290665163169812/Reminiscences_-_The_Countries_Torn_Apart.mp3","fileSize":6980285,"name":"[AAI1] Reminiscences - The Countries Torn Apart","volume":1},{"id":169026,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003290665448386590/Reminiscences_-_The_KG-8_Incident.mp3","fileSize":3973482,"name":"[AAI1] Reminiscences - The KG-8 Incident","volume":1},{"id":169007,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003290665729409125/Shi-Long_Lang_-_Speak_Up_Pup.mp3","fileSize":5410231,"name":"[AAI1] Shi-Long Lang - Speak Up, Pup!","volume":1},{"id":169011,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003290666043965540/Solution_-_Splendid_Deduction.mp3","fileSize":4957766,"name":"[AAI1] Solution! - Splendid Deduction","volume":1},{"id":169016,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003290666547302510/The_Truth_Revealed_Truth_2009.mp3","fileSize":4986975,"name":"[AAI1] The Truth Revealed [Truth 2009]","volume":1},{"id":169014,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003290666887036969/The_Two_Embassies_-_The_Countries_of_the_Butterfly_and_the_Flower.mp3","fileSize":4938984,"name":"[AAI1] The Two Embassies - The Countries of the Butterfly and the Flower","volume":1},{"id":169021,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003290667163852891/Tricks_and_Baroque_Trick_2009.mp3","fileSize":4898845,"name":"[AAI1] Tricks and Baroque [Trick 2009]","volume":1},{"id":169015,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003290667457466368/Tricks_and_Gimmicks_Trick_2009.mp3","fileSize":5536664,"name":"[AAI1] Tricks and Gimmicks [Trick 2009]","volume":1},{"id":169018,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003290667822354553/Tyrell_Badd_-_The_Truth_Isnt_Sweet.mp3","fileSize":5318073,"name":"[AAI1] Tyrell Badd - The Truth Isn't Sweet","volume":1},{"id":169009,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003290681290276864/Yatagarasu_-_The_Noble_Thief_Dancing_in_the_Dark_Night.mp3","fileSize":5259023,"name":"[AAI1] Yatagarasu - The Noble Thief Dancing in the Dark Night","volume":1},{"id":169012,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003290681571291268/Zinc_Lablanc_-_Time_is_Money.mp3","fileSize":2644531,"name":"[AAI1] Zinc Lablanc - Time is Money","volume":1});
            if (socketStates.options['ost-aai2'] && !musicList.find(music => music.id === 169035)) musicList.push({"id":169035,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003290888434352230/The_Forgotten_Turnabout.mp3","fileSize":1967314,"name":"[AAI2] \"The Forgotten Turnabout\"","volume":1},{"id":169058,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003290888795074581/The_Grand_Turnabout.mp3","fileSize":2063256,"name":"[AAI2] \"The Grand Turnabout\"","volume":1},{"id":169059,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003290889122222143/The_Imprisoned_Turnabout.mp3","fileSize":2083787,"name":"[AAI2] \"The Imprisoned Turnabout\"","volume":1},{"id":169057,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003290889461973093/The_Inherited_Turnabout.mp3","fileSize":2652589,"name":"[AAI2] \"The Inherited Turnabout\"","volume":1},{"id":169083,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003290889814286396/Confrontation_-_Allegro_2011.mp3","fileSize":5373105,"name":"[AAI2] Confrontation - Allegro 2011","volume":1},{"id":169034,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003290890166603806/Confrontation_-_Moderato_2011.mp3","fileSize":6007193,"name":"[AAI2] Confrontation - Moderato 2011","volume":1},{"id":169040,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003290890539901029/Confrontation_-_Presto_2011.mp3","fileSize":4241365,"name":"[AAI2] Confrontation - Presto 2011","volume":1},{"id":169045,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003290890900623401/Dane_Gustavia_-_Brandished_Flavor.mp3","fileSize":5842786,"name":"[AAI2] Dane Gustavia - Brandished Flavor","volume":1},{"id":169067,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003290891315838976/Deduction_-_Truths_of_the_Crime_Scene.mp3","fileSize":6565734,"name":"[AAI2] Deduction - Truths of the Crime Scene","volume":1},{"id":169039,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003290891714302014/Eureka_-_A_Calm_Moment.mp3","fileSize":5329162,"name":"[AAI2] Eureka! - A Calm Moment","volume":1},{"id":169046,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003290965580193872/Further_Investigation_Middle_2011.mp3","fileSize":5991961,"name":"[AAI2] Further Investigation [Middle 2011]","volume":1},{"id":169043,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003290965915734086/Gregory_Edgeworth_-_The_Wisdom_of_a_Seasoned_Attorney.mp3","fileSize":4901797,"name":"[AAI2] Gregory Edgeworth - The Wisdom of a Seasoned Attorney","volume":1},{"id":169036,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003290966213542020/Heart_of_the_Investigation_Core_2011.mp3","fileSize":6413367,"name":"[AAI2] Heart of the Investigation [Core 2011]","volume":1},{"id":169041,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003290966536507442/Initial_Investigation_Opening_2011.mp3","fileSize":5871713,"name":"[AAI2] Initial Investigation [Opening 2011]","volume":1},{"id":169042,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003290966834286622/Jeffrey_Master_-_Sweet_Sweet_Happiness.mp3","fileSize":4593790,"name":"[AAI2] Jeffrey Master - Sweet, Sweet Happiness","volume":1},{"id":169069,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003290967111123014/John_Marsh_-_An_Irritable_Child.mp3","fileSize":5293093,"name":"[AAI2] John Marsh - An Irritable Child","volume":1},{"id":169072,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003290967400534176/Justine_Courtney_-_The_Goddess_of_Law.mp3","fileSize":5564762,"name":"[AAI2] Justine Courtney - The Goddess of Law","volume":1},{"id":169055,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003290967698321488/Katherine_Hall_-_A_Sweet_Dance.mp3","fileSize":4299807,"name":"[AAI2] Katherine Hall - A Sweet Dance","volume":1},{"id":169056,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003290967970938990/Lamenting_Folk.mp3","fileSize":6353260,"name":"[AAI2] Lamenting Folk","volume":1},{"id":169038,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003290968264548382/Logic_Chess_-_Begin.mp3","fileSize":6643995,"name":"[AAI2] Logic Chess - Begin!","volume":1},{"id":169060,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003291005308641440/Logic_Chess_-_Endgame.mp3","fileSize":6498490,"name":"[AAI2] Logic Chess - Endgame","volume":1},{"id":169047,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003291005614837900/Miles_Edgeworth_-_Objection_2011.mp3","fileSize":6319930,"name":"[AAI2] Miles Edgeworth - Objection 2011","volume":1},{"id":169061,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003291005916819607/Patricia_Roland_-_Hugs_and_Kisses.mp3","fileSize":5670046,"name":"[AAI2] Patricia Roland - Hugs and Kisses","volume":1},{"id":169044,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003291006566924288/Prosecutors_Path_-_Ending.mp3","fileSize":7922605,"name":"[AAI2] Prosecutor's Path - Ending","volume":1},{"id":169037,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003291006952816640/Prosecutors_Path_-_Opening.mp3","fileSize":2914877,"name":"[AAI2] Prosecutor's Path - Opening","volume":1},{"id":169074,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003291007288348782/Prosecutorial_Investigation_Committee_-_Rigorous_Justice.mp3","fileSize":6448498,"name":"[AAI2] Prosecutorial Investigation Committee - Rigorous Justice","volume":1},{"id":169075,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003291007602917376/Prosecutors_Murmur_-_Each_Ones_Path.mp3","fileSize":6912252,"name":"[AAI2] Prosecutors' Murmur - Each One's Path","volume":1},{"id":169065,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003291007963648090/Pursuit_-_Reaching_the_Truth_Pursuit_2011.mp3","fileSize":5326411,"name":"[AAI2] Pursuit - Reaching the Truth [Pursuit 2011]","volume":1},{"id":169066,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003291008462758029/Raymond_Shields_-_How_About_a_Hug.mp3","fileSize":4574563,"name":"[AAI2] Raymond Shields - How About a Hug","volume":1},{"id":169076,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003291008844447744/Re-creation_-_The_Noble_Thiefs_Secret_Weapon_2011.mp3","fileSize":6033098,"name":"[AAI2] Re-creation - The Noble Thief's Secret Weapon 2011","volume":1},{"id":169082,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003291073654825001/Reminiscences_-_An_Amnesiac_Girl.mp3","fileSize":5719459,"name":"[AAI2] Reminiscences - An Amnesiac Girl","volume":1},{"id":169087,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003291073965199444/Reminiscences_-_The_House_of_Langs_Downfall.mp3","fileSize":4944775,"name":"[AAI2] Reminiscences - The House of Lang's Downfall","volume":1},{"id":169077,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003291074288156743/Reminiscences_-_The_IS-7_Incident.mp3","fileSize":6527491,"name":"[AAI2] Reminiscences - The IS-7 Incident","volume":1},{"id":169085,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003291074564988958/Reminiscences_-_The_SS-5_Incident.mp3","fileSize":5224149,"name":"[AAI2] Reminiscences - The SS-5 Incident","volume":1},{"id":169086,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003291074846003271/Restless_Folk.mp3","fileSize":5148863,"name":"[AAI2] Restless Folk","volume":1},{"id":169079,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003291075152191498/Ringtone_-_Justine_Courtney.mp3","fileSize":2430030,"name":"[AAI2] Ringtone - Justine Courtney","volume":1},{"id":169063,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003291075525492796/Sebastian_Debeste_-_A_First-Class_Farewell.mp3","fileSize":5016579,"name":"[AAI2] Sebastian Debeste - A First-Class Farewell","volume":1},{"id":169081,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003291075861028905/Sebastian_Debeste_-_First-Class_Reasoning.mp3","fileSize":5067565,"name":"[AAI2] Sebastian Debeste - First-Class Reasoning","volume":1},{"id":169084,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003291076116889690/Sirhan_Dogen_-_The_Tones_of_an_Assassin.mp3","fileSize":4719002,"name":"[AAI2] Sirhan Dogen - The Tones of an Assassin","volume":1},{"id":169062,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003291076448243772/Strange_Folk.mp3","fileSize":5345793,"name":"[AAI2] Strange Folk","volume":1},{"id":169068,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003291120039641198/The_Bonds_of_a_Trustful_Heart.mp3","fileSize":6589745,"name":"[AAI2] The Bonds of a Trustful Heart","volume":1},{"id":169080,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003291120354209892/The_Man_Who_Masterminds_the_Game.mp3","fileSize":6257710,"name":"[AAI2] The Man Who Masterminds the Game","volume":1},{"id":169073,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003291120643604481/The_Mighty_Moozilla.mp3","fileSize":5852036,"name":"[AAI2] The Mighty Moozilla","volume":1},{"id":169078,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003291121063047189/The_Truth_Revealed_Truth_2011.mp3","fileSize":5892182,"name":"[AAI2] The Truth Revealed [Truth 2011]","volume":1},{"id":169064,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003291121360830585/Trial_of_Fate.mp3","fileSize":4476187,"name":"[AAI2] Trial of Fate","volume":1},{"id":169071,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003291121637670972/Trick_Analysis_-_Allegro_Trick_2011.mp3","fileSize":5140891,"name":"[AAI2] Trick Analysis - Allegro [Trick 2011]","volume":1},{"id":169088,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003291121927069796/Trick_Analysis_-_Moderato_Trick_2011.mp3","fileSize":4265653,"name":"[AAI2] Trick Analysis - Moderato [Trick 2011]","volume":1},{"id":169070,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003291122283581440/Zheng_Fa_-_Land_of_the_Phoenix.mp3","fileSize":6895696,"name":"[AAI2] Zheng Fa - Land of the Phoenix","volume":1});
            if (socketStates.options['ost-pl'] && !musicList.find(music => music.id === 169094)) musicList.push({"id":169094,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003291233675911168/A_Faint_Voice.mp3","fileSize":823677,"name":"[PLvsPW] A Faint Voice","volume":1},{"id":169093,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003291234015641671/A_Familiar_Face.mp3","fileSize":409969,"name":"[PLvsPW] A Familiar Face","volume":1},{"id":169100,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003291234497998868/A_Mysterious_Fire.mp3","fileSize":1088207,"name":"[PLvsPW] A Mysterious Fire","volume":1},{"id":169092,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003291234820947978/A_Pleasant_Afternoon.mp3","fileSize":4143677,"name":"[PLvsPW] A Pleasant Afternoon","volume":1},{"id":169096,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003291235252973588/A_Strange_Story.mp3","fileSize":5640268,"name":"[PLvsPW] A Strange Story","volume":1},{"id":169097,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003291235571732480/About_Town.mp3","fileSize":4531599,"name":"[PLvsPW] About Town","volume":1},{"id":169098,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003291235928260620/An_Uneasy_Atmosphere.mp3","fileSize":4413821,"name":"[PLvsPW] An Uneasy Atmosphere","volume":1},{"id":169102,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003291236234440764/Bewitching_Puzzles.mp3","fileSize":5050179,"name":"[PLvsPW] Bewitching Puzzles","volume":1},{"id":169109,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003291236901339197/Confrontation.mp3","fileSize":6353117,"name":"[PLvsPW] Confrontation","volume":1},{"id":169099,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003291236561588384/Confrontation_-_The_Titantic_Knights.mp3","fileSize":793157,"name":"[PLvsPW] Confrontation - The Titantic Knights","volume":1},{"id":169101,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003291264038469662/Courtroom_Jester_-_Cheers.mp3","fileSize":3315100,"name":"[PLvsPW] Courtroom Jester - Cheers!","volume":1},{"id":169110,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003291264344666172/Courtroom_Lounge_-_Opening_Prelude_English_Turnabout_Mix.mp3","fileSize":2752591,"name":"[PLvsPW] Courtroom Lounge - Opening Prelude (English Turnabout Mix)","volume":1},{"id":169107,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003291264638263336/Courtroom_Magic.mp3","fileSize":7431554,"name":"[PLvsPW] Courtroom Magic","volume":1},{"id":169105,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003291264977993728/Crisis_-_PL_vs_PW_AA_Version.mp3","fileSize":3861162,"name":"[PLvsPW] Crisis - PL vs PW AA Version","volume":1},{"id":169103,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003291266940932268/Cross-Examination_-_Allegro_English_Turnabout_Mix.mp3","fileSize":2198771,"name":"[PLvsPW] Cross-Examination - Allegro (English Turnabout Mix)","volume":1},{"id":169106,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003291267251306586/Cross-Examination_-_Moderato_English_Turnabout_Mix.mp3","fileSize":2186010,"name":"[PLvsPW] Cross-Examination - Moderato (English Turnabout Mix)","volume":1},{"id":169108,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003291267553308763/Deathknell_Dungeon_-_The_Magical_Prelude.mp3","fileSize":6195234,"name":"[PLvsPW] Deathknell Dungeon - The Magical Prelude","volume":1},{"id":169104,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003291267872071830/Denouement.mp3","fileSize":4340024,"name":"[PLvsPW] Denouement","volume":1},{"id":169090,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003291268224405604/Escape.mp3","fileSize":1802468,"name":"[PLvsPW] Escape","volume":1},{"id":169091,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003291330417532928/Espellas_Theme_No._1_-_Memory.mp3","fileSize":4836292,"name":"[PLvsPW] Espella's Theme No. 1 - Memory","volume":1},{"id":169095,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003291268627046410/Espellas_Theme_No._2_-_Truth.mp3","fileSize":4342287,"name":"[PLvsPW] Espella's Theme No. 2 - Truth","volume":1},{"id":169117,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003291330769866832/Festival.mp3","fileSize":6343459,"name":"[PLvsPW] Festival","volume":1},{"id":169118,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003291331071840358/Fiery_Witnesses.mp3","fileSize":4654975,"name":"[PLvsPW] Fiery Witnesses","volume":1},{"id":169115,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003291331373826208/Granwyrm_-_Creation.mp3","fileSize":1263954,"name":"[PLvsPW] Granwyrm - Creation","volume":1},{"id":169112,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003291351380668517/Granwyrm_-_Roar.mp3","fileSize":1498354,"name":"[PLvsPW] Granwyrm - Roar","volume":1},{"id":169123,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003291351653302293/Hit_or_Miss_-_Suspense.mp3","fileSize":2870611,"name":"[PLvsPW] Hit or Miss - Suspense","volume":1},{"id":169114,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003291351925915708/In-Flight.mp3","fileSize":5450355,"name":"[PLvsPW] In-Flight","volume":1},{"id":169121,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003291352634765432/Into_the_Forest.mp3","fileSize":3595710,"name":"[PLvsPW] Into the Forest","volume":1},{"id":169116,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003291352961912832/Into_the_Ruins.mp3","fileSize":405358,"name":"[PLvsPW] Into the Ruins","volume":1},{"id":169111,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003291353230352455/Judgment_-_Witches_Court.mp3","fileSize":1185027,"name":"[PLvsPW] Judgment - Witches' Court","volume":1},{"id":169119,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003291387569119292/Labyrinthia.mp3","fileSize":4957337,"name":"[PLvsPW] Labyrinthia","volume":1},{"id":169122,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003291387908849734/Link.mp3","fileSize":5205549,"name":"[PLvsPW] Link","volume":1},{"id":169120,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003291388273762375/Logic_and_Trick_English_Turnabout_Mix.mp3","fileSize":2830021,"name":"[PLvsPW] Logic and Trick (English Turnabout Mix)","volume":1},{"id":169113,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003291388575748178/Logic_and_Witchcraft.mp3","fileSize":4686815,"name":"[PLvsPW] Logic and Witchcraft","volume":1},{"id":169130,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003291388873547876/Mass_Inquisition_-_Allegro_2012.mp3","fileSize":5330032,"name":"[PLvsPW] Mass Inquisition - Allegro 2012","volume":1},{"id":169132,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003291389129404507/Mass_Inquisition_-_Moderato_2012.mp3","fileSize":5160450,"name":"[PLvsPW] Mass Inquisition - Moderato 2012","volume":1},{"id":169128,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003291389406216292/Misgivings.mp3","fileSize":3448145,"name":"[PLvsPW] Misgivings","volume":1},{"id":169129,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003291389712412802/More_Puzzles.mp3","fileSize":4255007,"name":"[PLvsPW] More Puzzles","volume":1},{"id":169124,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003291390521901076/Newton_Belduke_-_Twilight_Memories.mp3","fileSize":5603432,"name":"[PLvsPW] Newton Belduke - Twilight Memories","volume":1},{"id":169126,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003291390891020379/Opening.mp3","fileSize":1230542,"name":"[PLvsPW] Opening","volume":1},{"id":169127,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003291440438325298/Phoenix_Wright_-_Objection_2012.mp3","fileSize":5578453,"name":"[PLvsPW] Phoenix Wright - Objection 2012","volume":1},{"id":169125,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003291439976955985/Phoenix_Wright_-_Objection_2012_English_Turnabout_Mix.mp3","fileSize":1984367,"name":"[PLvsPW] Phoenix Wright - Objection 2012 (English Turnabout Mix)","volume":1},{"id":169131,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003291440689991680/Phoenix_Wright_Ace_Attorney_-_Court_Begins_English_Turnabout_Mix.mp3","fileSize":2781718,"name":"[PLvsPW] Phoenix Wright Ace Attorney - Court Begins (English Turnabout Mix)","volume":1},{"id":169138,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003291440987783188/PL_vs_PW_AA_-_Ending_Theme.mp3","fileSize":5289691,"name":"[PLvsPW] PL vs PW AA - Ending Theme","volume":1},{"id":169134,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003291441272983562/PL_vs_PW_AA_-_Opening_Theme.mp3","fileSize":3757239,"name":"[PLvsPW] PL vs PW AA - Opening Theme","volume":1},{"id":169136,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003291441600155678/Prelude.mp3","fileSize":1363016,"name":"[PLvsPW] Prelude","volume":1},{"id":169140,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003291441872781383/Premonition_-_The_Two-Step_Turnabout.mp3","fileSize":3588220,"name":"[PLvsPW] Premonition - The Two-Step Turnabout","volume":1},{"id":169135,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003291442174758982/Professor_Laytons_Theme_I.mp3","fileSize":3166360,"name":"[PLvsPW] Professor Layton's Theme I","volume":1},{"id":169133,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003291442610962482/Professor_Laytons_Theme_II.mp3","fileSize":4860679,"name":"[PLvsPW] Professor Layton's Theme II","volume":1},{"id":169137,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003291442996854835/Pursuit_-_Cornered_English_Turnabout_Mix.mp3","fileSize":3189422,"name":"[PLvsPW] Pursuit - Cornered (English Turnabout Mix)","volume":1},{"id":169139,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003291482003865681/Pursuit_-_Spell-breaker_Pursuit_2012.mp3","fileSize":6227242,"name":"[PLvsPW] Pursuit - Spell-breaker [Pursuit 2012]","volume":1},{"id":169143,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003291482381361302/Puzzle_Deductions.mp3","fileSize":4442105,"name":"[PLvsPW] Puzzle Deductions","volume":1},{"id":169144,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003291482637226025/Quiet_Moments.mp3","fileSize":3715160,"name":"[PLvsPW] Quiet Moments","volume":1},{"id":169145,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003291482964373524/Rainy_Night.mp3","fileSize":1505177,"name":"[PLvsPW] Rainy Night","volume":1},{"id":169166,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003291483237007370/Reminiscing_-_A_Golden_Message.mp3","fileSize":3872408,"name":"[PLvsPW] Reminiscing - A Golden Message","volume":1},{"id":169171,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003291483614482482/Reminiscing_-_Fated_Magic.mp3","fileSize":5173199,"name":"[PLvsPW] Reminiscing - Fated Magic","volume":1},{"id":169162,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003291483887120414/Reminiscing_-_The_Legendary_Fire.mp3","fileSize":3142742,"name":"[PLvsPW] Reminiscing - The Legendary Fire","volume":1},{"id":169153,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003291484222656552/Rescue_and_Retribution.mp3","fileSize":2735464,"name":"[PLvsPW] Rescue and Retribution","volume":1},{"id":169170,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003291484595957830/Reunion.mp3","fileSize":4044792,"name":"[PLvsPW] Reunion","volume":1},{"id":169161,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003291485011197973/Sealed_-_The_Darkness_Within.mp3","fileSize":4688038,"name":"[PLvsPW] Sealed - The Darkness Within","volume":1},{"id":169146,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003291553600634890/Sealed_Memories.mp3","fileSize":1507514,"name":"[PLvsPW] Sealed Memories","volume":1},{"id":169167,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003291554233987163/Suspense.mp3","fileSize":5073020,"name":"[PLvsPW] Suspense","volume":1},{"id":169164,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003291553919406220/Suspense_English_Turnabout_Mix.mp3","fileSize":2206031,"name":"[PLvsPW] Suspense (English Turnabout Mix)","volume":1},{"id":169152,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003291554519208006/Taelende.mp3","fileSize":1195697,"name":"[PLvsPW] Taelende!!","volume":1},{"id":169159,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003291554808598638/Tavern.mp3","fileSize":2825538,"name":"[PLvsPW] Tavern","volume":1},{"id":169160,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003291555311923300/Tension.mp3","fileSize":3673690,"name":"[PLvsPW] Tension","volume":1},{"id":169148,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003291555626504282/That_Case.mp3","fileSize":927973,"name":"[PLvsPW] That Case","volume":1},{"id":169181,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003291555907510272/The_Audience_Room.mp3","fileSize":3744027,"name":"[PLvsPW] The Audience Room","volume":1},{"id":169151,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003291556213686342/The_Bell_Towers_Arrival.mp3","fileSize":1043410,"name":"[PLvsPW] The Bell Tower's Arrival","volume":1},{"id":169169,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003291556540862634/The_Creator_and_the_Alchemist.mp3","fileSize":7389564,"name":"[PLvsPW] The Creator and the Alchemist","volume":1},{"id":169154,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003291583082414201/The_Dark_Forest.mp3","fileSize":4541602,"name":"[PLvsPW] The Dark Forest","volume":1},{"id":169172,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003291583401177148/The_Final_Witness.mp3","fileSize":6842690,"name":"[PLvsPW] The Final Witness","volume":1},{"id":169150,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003291583761883226/The_Hidden_Garden.mp3","fileSize":3415571,"name":"[PLvsPW] The Hidden Garden","volume":1},{"id":169149,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003291584110022706/The_Light_of_Truth.mp3","fileSize":1469895,"name":"[PLvsPW] The Light of Truth","volume":1},{"id":169155,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003291584437170307/The_Magic_Book.mp3","fileSize":1499930,"name":"[PLvsPW] The Magic Book","volume":1},{"id":169168,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003291584785301514/The_Professors_Deductions.mp3","fileSize":3615958,"name":"[PLvsPW] The Professor's Deductions","volume":1},{"id":169156,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003291585175367710/The_Shady_Workshop.mp3","fileSize":3879343,"name":"[PLvsPW] The Shady Workshop","volume":1},{"id":169174,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003291585489948762/The_Sorrowful_Golden_Statue.mp3","fileSize":1142285,"name":"[PLvsPW] The Sorrowful Golden Statue","volume":1},{"id":169165,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003291585850650744/The_Storytellers_Theme_-_Parade.mp3","fileSize":2892071,"name":"[PLvsPW] The Storyteller's Theme - Parade","volume":1},{"id":169163,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003291586161016832/The_Storytellers_Tower.mp3","fileSize":3945975,"name":"[PLvsPW] The Storyteller's Tower","volume":1},{"id":169158,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003291653018230814/The_Town_at_Night.mp3","fileSize":4993266,"name":"[PLvsPW] The Town at Night","volume":1},{"id":169147,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003291653336993932/The_Towns_Past.mp3","fileSize":4094054,"name":"[PLvsPW] The Town's Past","volume":1},{"id":169184,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003291653668352041/The_Trial_of_the_Great_Witch.mp3","fileSize":5000054,"name":"[PLvsPW] The Trial of the Great Witch","volume":1},{"id":169157,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003291654133923870/The_Truth_Revealed_English_Turnabout_Mix.mp3","fileSize":1533442,"name":"[PLvsPW] The Truth Revealed (English Turnabout Mix)","volume":1},{"id":169176,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003291654461067274/The_Truth_Revealed_Truth_2012.mp3","fileSize":7687709,"name":"[PLvsPW] The Truth Revealed [Truth 2012]","volume":1},{"id":169173,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003291654779842600/The_Underground_Ruins.mp3","fileSize":5363328,"name":"[PLvsPW] The Underground Ruins","volume":1},{"id":169175,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003291655090217020/The_Winning_Combination.mp3","fileSize":6187314,"name":"[PLvsPW] The Winning Combination","volume":1},{"id":169179,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003291655371227136/Turnabout_Sisters_Music_Box_Melody.mp3","fileSize":7089449,"name":"[PLvsPW] Turnabout Sisters Music Box Melody","volume":1},{"id":169180,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003291655656460340/Witches_Court_Convenes.mp3","fileSize":4306879,"name":"[PLvsPW] Witches' Court Convenes","volume":1},{"id":169178,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003291655975223306/Witches_Theme_-_Assault.mp3","fileSize":1716480,"name":"[PLvsPW] Witches' Theme - Assault","volume":1},{"id":169177,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003291705400885341/Witches_Theme_-_Chase.mp3","fileSize":2412712,"name":"[PLvsPW] Witches' Theme - Chase","volume":1},{"id":169183,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003291705937760356/Won_the_Case_-_First_Victory_English_Turnabout_Mix.mp3","fileSize":2946653,"name":"[PLvsPW] Won the Case! - First Victory (English Turnabout Mix)","volume":1},{"id":169182,"url":"https://cdn.discordapp.com/attachments/999743497726861385/1003291706290077736/Zacharias_Barnham_-_The_Sword_of_Labyrinthia.mp3","fileSize":5833049,"name":"[PLvsPW] Zacharias Barnham - The Sword of Labyrinthia","volume":1});
        }
        app.__vue__.$watch('$store.state.assets.music.list', musicListListener);
        musicListListener(appState.assets.music.list);

        
        // Newline on shift+enter
        if (socketStates.options['newlines']) {
            const textArea = document.querySelector('textarea.frameTextarea');
            const textAreaInstance = textArea.parentElement.parentElement.__vue__;
            const origSend = textAreaInstance.send;
            textAreaInstance.send = function() {
                if (modifierKeys.shift) return;
                origSend(...arguments);
            }
            
            textArea.addEventListener('keydown', function (event) {
                if (!event.shiftKey || event.keyCode != 13) return;
                const start = textArea.selectionStart;
                const end = textArea.selectionEnd;
                const text = textArea.value.slice(0, start) + "\n" + textArea.value.slice(end);
                setValue(textArea, text);
                textArea.selectionEnd = end + 1;
            })
        }

        // Modifier keys for any options that need them
        if (socketStates.options['newlines']) {
            function checkModifierKeys(event) {
                modifierKeys.shift = event.shiftKey;
            }
            document.addEventListener('keydown', checkModifierKeys);
            document.addEventListener('keyup', checkModifierKeys);
        }

        
        if (socketStates.options['menu-auto-close']) {
            const MENUS_NOT_AUTO_CLOSE = ['Text Color'];
            const menus = app.querySelectorAll(':scope > div[role="menu"]');
            for (let menu of menus) {
                const titleElem = menu.querySelector('.v-list-item__title') || menu.querySelector('.v-label');
                if (titleElem == null) continue;
                
                const title = titleElem.innerText;
                if (!MENUS_NOT_AUTO_CLOSE.includes(title)) {
                    for (let button of menu.querySelectorAll('.v-btn:not(.success)')) {
                        if (button.querySelector('span.v-btn__content').textContent.slice(0, 6) === 'Manage') continue;
                        button.addEventListener('click', function() {
                            const comp = menu.__vue__.$parent.$parent;
                            comp.isActive = !comp.isActive;
                        });
                    }
                }
            }
        }

        if (socketStates.options['menu-hover']) {
            const buttons = document.querySelector('.mdi-palette').parentElement.parentElement.parentElement.querySelectorAll('button');
            for (let button of buttons) {
                button.addEventListener('mouseenter', function () {
                    for (let button of buttons) {
                        if (!button.__vue__) continue;
                        const comp = button.__vue__.$parent;
                        comp.isActive = false;
                    }

                    let toFocus = false;
                    const textArea = document.querySelector('textarea.frameTextarea')
                    if (document.activeElement == textArea) toFocus = true;
                    button.click();
                    if (toFocus) textArea.focus();
                });
            }
        }

        if (socketStates.options['old-bubbles']) {

            const buttonColumn = htmlToElement(/*html*/`
                <div class="theme--dark mr-2 d-block v-btn-toggle primary--text hil-speech-bubble-column"></div>
            `);

            const speechBubbleDropdown = document.querySelector('.v-input.v-input--hide-details.v-text-field.v-text-field--solo-flat.v-select');
            speechBubbleDropdown.style.display = 'none';
            speechBubbleDropdown.parentElement.style.position = 'relative';
            speechBubbleDropdown.parentElement.appendChild(buttonColumn);

            let activeButton = null;
            function addButton(bubble) {
                const button = htmlToElement(/*html*/`
                    <button class="${getTheme()} hil-themed v-btn v-btn--block v-size--small hil-classic-speech-button">${bubble.name}</button>
                `);
                button.addEventListener("click", function() {
                    if (button.classList.contains('v-btn--active')) {
                        button.classList.remove('v-btn--active');
                        activeButton = null;
                        speechBubbleDropdown.__vue__.selectItem(0);
                    } else {
                        if (activeButton !== null) activeButton.classList.remove('v-btn--active');
                        activeButton = button;
                        button.classList.add('v-btn--active');
    
                        speechBubbleDropdown.__vue__.selectItem(bubble.id);
                    }
                });
                buttonColumn.appendChild(button);
            }

            function updateBubbles() {
                activeButton = null;
                while (buttonColumn.lastElementChild) {
                    buttonColumn.removeChild(buttonColumn.lastElementChild);
                }
                const char = characterInstance.currentCharacter;
                if (char.id > 1000) {
                    // custom character
                    for (let bubble of characterInstance.currentCharacter.bubbles) {
                        addButton(bubble);
                    }
                } else {
                    // preset character
                    if (char.bubbleTypes[0] == '1') addButton({name: "Objection!", id: 1});
                    if (char.bubbleTypes[1] == '1') addButton({name: "Hold It!", id: 2});
                    if (char.bubbleTypes[2] == '1') addButton({name: "Take That!", id: 3});
                    if (char.bubbleTypes[3] == '1') addButton({name: "Gotcha!", id: 4});
                    if (char.bubbleTypes[4] == '1') addButton({name: "Eureka!", id: 5});
                }
                if (buttonColumn.childElementCount === 0) speechBubbleDropdown.style.removeProperty("display");
                if (buttonColumn.childElementCount > 0) speechBubbleDropdown.style.display = "none";
            }

            updateBubbles();
            characterInstance.$watch('currentCharacter.id', updateBubbles);

            speechBubbleDropdown.__vue__.$watch("selectedItems", function(selectedItems) {
                if (selectedItems[0] && selectedItems[0].value !== 0) return;
                if (activeButton !== null) activeButton.classList.remove('v-btn--active');
                activeButton = null;
            });
        }

        if (socketStates.options['extended-log']) {
            
            let settingsButton;
            let logColors;
            let saveColorsButton;

            const toggleButton = document.createElement('button');
            toggleButton.className = 'v-btn v-btn--has-bg hil-icon-button hil-expanded-log-button hil-themed ' + getTheme();
            const icon = createIcon("console");
            toggleButton.appendChild(icon);

            toggleButton.addEventListener('mouseenter', function () {
                if (toggleButton.tooltip === undefined) toggleButton.tooltip = createTooltip("Extended Log", toggleButton);
                toggleButton.tooltip.realign();
                toggleButton.tooltip.classList.remove('hil-hide');
            });
            toggleButton.addEventListener('mouseleave', () => toggleButton.tooltip.classList.add('hil-hide'));

            const chat = document.querySelector('.chat');
            const list = chat.querySelector('[role="list"]');

            const logDiv = document.createElement('div');
            logDiv.className = getTheme() + ` hil-themed hil-expanded-log hil-hide-muted`;
            logDiv.style.display = "none";

            const HIDABLE_CLASSES = {
                ".hil-hide-timestamps": ".hil-log-timestamp",
                ".hil-hide-plain": ".hil-log-plain",
                ".hil-hide-muted": ".hil-log-muted",
                ".hil-hide-tags": ".hil-log-tag",
                ".hil-hide-names": ".hil-log-name",
            }
            logDiv.addEventListener("copy", function(e) {
                const clipboardData = e.clipboardData || window.clipboardData;
                const selectionContents = getHTMLOfSelection();
                console.log(selectionContents.innerHTML);

                for (let hideClass in HIDABLE_CLASSES) {
                    if (logDiv.matches(hideClass)) {
                        for (let elem of selectionContents.querySelectorAll(HIDABLE_CLASSES[hideClass])) {
                            elem.remove();
                        }
                    }
                }
                if (logDiv.matches('.hil-no-breaks')) {
                    for (let elem of selectionContents.querySelectorAll('br')) {
                        elem.remove();
                    }
                } else {
                    for (let div of selectionContents.querySelectorAll(':scope > div')) {
                        const br = document.createElement('br');
                        div.appendChild(br);
                    }
                }

                for (let elem of selectionContents.querySelectorAll('*')) {
                    if (elem.style.color === "rgb(255, 255, 255)" || elem.style.color === "rgb(0, 0, 0)") elem.style.removeProperty('color');
                }

                console.log(selectionContents.innerHTML);
                clipboardData.setData('text/html', selectionContents.innerHTML);
                clipboardData.setData('text/plain', selectionContents.innerText);
                e.preventDefault();
            });
            chat.appendChild(logDiv);

            let extendedLog = false;
            toggleButton.addEventListener('click', function() {
                extendedLog = !extendedLog;
                if (extendedLog) {

                    list.style.display = "none";
                    logDiv.style.display = "";
                    toggleButton.tooltip.textContent = "Normal Chat Log";
                    toggleButton.tooltip.realign();
                    icon.classList.remove('mdi-console');
                    icon.classList.add('mdi-list-box-outline');
                    settingsButton.classList.add('hil-shown');
                    
                } else {

                    logDiv.style.display = "none";
                    list.style.display = "";
                    toggleButton.tooltip.textContent = "Extended Log";
                    toggleButton.tooltip.realign();
                    icon.classList.remove('mdi-list-box-outline');
                    icon.classList.add('mdi-console');
                    settingsButton.classList.remove('hil-shown');

                }
            });

            chat.parentElement.appendChild(toggleButton);


            const LOG_TYPES = {
                message: 0,
                chatlog: 1,
                info: 2,
                popup: 4,
            }
            let lastSpeaker = null;
            let forceNewDiv = false;
            let nameColors = {};
            function addSpaceBeforeBR(br) {
                const space = document.createElement('span');
                space.textContent = " ";
                space.classList.add("hil-space");
                if (br.classList.contains('hil-log-muted')) space.classList.add("hil-log-muted");
                br.parentElement.insertBefore(space, br);
            }
            function registerMessage(name, text, type, muted=false, logArgs=null) {
                let div;
                let newDiv = false;
                let mutedSpan = false;
                if (forceNewDiv || name != lastSpeaker || type == LOG_TYPES.popup) {
                    forceNewDiv = false;
                    newDiv = true;
                    div = document.createElement('div');

                    if (muted) {
                        div.classList.add('hil-log-muted');
                    }

                    if (type === LOG_TYPES.message) {
                        div.dataset.name = name;
                        if (nameColors[name]) div.style.color = nameColors[name];
                    } else if (type == LOG_TYPES.chatlog || type == LOG_TYPES.info) {
                        div.classList.add("hil-log-plain");
                    } else if (type == LOG_TYPES.popup) {
                        if (logArgs !== null) div.style.color = logArgs;
                        div.classList.add('hil-log-shout');
                        forceNewDiv = true;
                    }
                    
                    logDiv.appendChild(div);
                } else {
                    div = logDiv.lastElementChild;
                    if (muted) mutedSpan = true;
                }

                const spanName = document.createElement('span');
                if (newDiv && type != LOG_TYPES.popup) {

                    const spanTimestamp = document.createElement('span');
                    spanTimestamp.classList.add( "hil-log-timestamp");
                    if (mutedSpan) spanTimestamp.classList.add( "hil-log-muted");
                    const hours = String(new Date().getHours()).padStart(2, 0);
                    const minutes = String(new Date().getMinutes()).padStart(2, 0);
                    spanTimestamp.textContent = `(${hours}:${minutes}) `;
                    div.appendChild(spanTimestamp);

                    spanName.classList.add("hil-log-name");
                    spanName.textContent += `${name}`;
                    if (type !== LOG_TYPES.info) spanName.textContent += ":";
                    spanName.textContent += " ";
                    div.appendChild(spanName);

                }

                const spanMain = document.createElement('span');
                if (type !== LOG_TYPES.message) {
                    spanMain.textContent += text;
                    spanMain.textContent = spanMain.textContent.trim();
                }

                if (spanMain.textContent.length > 0) {
                    if (mutedSpan) spanMain.classList.add("hil-log-muted");
                    div.appendChild(spanMain);
                }

                if (type === LOG_TYPES.message) {
                    const REGEX_TAG = /(\[\/#\])|(\[#.*?\])/g;
                    const REGEX_COLOR_TAG = /\[#\/([0-9a-zA-Z]*?)\]$/g;
                    const REGEX_UNCOLOR_TAG = /\[\/#\]$/g;
                    let currentColor = null;
                    for (let str of text.split(REGEX_TAG)) {
                        if (!str) continue;
                        const span = document.createElement('span');
                        if (mutedSpan) span.classList.add("hil-log-muted");
                        if (str.match(REGEX_TAG)) span.classList.add("hil-log-tag");

                        if (str.match(REGEX_COLOR_TAG) && currentColor === null) {
                            let color = str.replace(REGEX_COLOR_TAG, "$1");
                            if (color == "r") currentColor = "#f77337";
                            if (color == "g") currentColor = "#00f61c";
                            if (color == "b") currentColor = "#6bc7f6";
                            if (color[0] == "c") {
                                color = color.slice(1);
                                currentColor = "#" + color;
                            }
                        }

                        if (currentColor !== null) span.style.color = currentColor;
                        if (str.match(REGEX_UNCOLOR_TAG)) currentColor = null;
                        span.textContent = str;
                        div.appendChild(span);
                    }
                }

                if (spanMain.textContent.length > 0 || (type === LOG_TYPES.message && text.length > 0)) {
                    const br = document.createElement('br');
                    div.appendChild(br);
                    if (logDiv.classList.contains('hil-no-breaks')) addSpaceBeforeBR(br);
                    if (mutedSpan) br.classList.add("hil-log-muted");
                }

                lastSpeaker = name;
            }
            addMessageListener(window, 'log-message', function(data) {
                registerMessage('(Info)', data.text, LOG_TYPES.info);
            });
            addMessageListener(window, 'plain_message', function(data) {
                const muted = muteInputInstance.selectedItems.find(item => item.id === data.userId);
                registerMessage('(Chat) ' + data.username, data.text, LOG_TYPES.chatlog, muted);
            });
            addMessageListener(window, 'receive_message', function(data) {
                const muted = muteInputInstance.selectedItems.find(item => item.id === data.userId);

                const name = data.frame.username;
                if (!(name in nameColors)) {
                    nameColors[name] = "#ffffff";

                    const colorRow = htmlToElement(/*html*/`
                        <div class="hil-log-settings-row">
                            <div class="hil-log-settings-color-name" data-name="${name}">Color: ${name}</div>
                            <div class="hil-log-settings-color">
                                <input type="color">
                                <button class="v-btn v-btn--has-bg hil-icon-button hil-themed theme--dark"><i class="v-icon notranslate mdi hil-themed mdi-delete theme--dark"></i></button>
                            </div>
                        </div>
                    `);
                    colorRow.querySelector('input').value = nameColors[name];
                    colorRow.querySelector('button').addEventListener('click', function() {
                        delete nameColors[name];
                        colorRow.remove();
                        for (let div of logDiv.querySelectorAll(`div[data-name="${name}"]`)) {
                            div.style.removeProperty("color");
                        }
                    });
                    logColors.appendChild(colorRow);
                    saveColorsButton.classList.remove('v-btn--disabled');
                }

                if (data.frame.bubbleType) {
                    let bubbleName = null;
                    if (data.frame.bubbleType <= 5) {
                        if (data.frame.bubbleType === 1) bubbleName = "OBJECTION!";
                        if (data.frame.bubbleType === 2) bubbleName = "HOLD IT!";
                        if (data.frame.bubbleType === 3) bubbleName = "TAKE THAT!";
                        if (data.frame.bubbleType === 4) bubbleName = "GOTCHA!";
                        if (data.frame.bubbleType === 5) bubbleName = "EUREKA!";
                    } else if (frameInstance.customCharacters[data.frame.characterId]) {
                        // registerMessage(data.frame.username, "", LOG_TYPES.default, muted);
                        const bubble = frameInstance.customCharacters[data.frame.characterId].bubbles.find(bubble => bubble.id === data.frame.bubbleType);
                        if (bubble) {
                            bubbleName = bubble.name.toUpperCase();
                        }
                    }
                    if (bubbleName !== null) registerMessage(data.frame.username, bubbleName, LOG_TYPES.popup, muted, "#f44");
                }

                if (data.frame.frameActions) for (let action of data.frame.frameActions) {
                    if (action.actionId !== 7) continue;
                    if (action.actionParam == "1") registerMessage(data.frame.username, "-- WITNESS TESTIMONY --", LOG_TYPES.popup, muted, "#2084ff");
                    if (action.actionParam == "2") registerMessage(data.frame.username, "-- CROSS EXAMINATION --", LOG_TYPES.popup, muted, "#ff2133");
                    if (action.actionParam == "4") registerMessage(data.frame.username, "-- GUILTY --", LOG_TYPES.popup, muted);
                    if (action.actionParam == "5") registerMessage(data.frame.username, "-- NOT GUILTY --", LOG_TYPES.popup, muted);
                }

                registerMessage(data.frame.username, data.frame.text, LOG_TYPES.message, muted);
            });


            settingsButton = document.createElement('button');
            settingsButton.className = 'v-btn v-btn--has-bg hil-icon-button hil-expanded-log-button hil-expanded-log-settings-button hil-themed ' + getTheme();
            settingsButton.appendChild(createIcon("cog"));

            settingsButton.addEventListener('mouseenter', function () {
                if (settingsButton.tooltip === undefined) settingsButton.tooltip = createTooltip("Log Settings", settingsButton);
                settingsButton.tooltip.realign();
                settingsButton.tooltip.classList.remove('hil-hide');
            });
            settingsButton.addEventListener('mouseleave', () => settingsButton.tooltip.classList.add('hil-hide'));
            chat.parentElement.appendChild(settingsButton);

            const settingsCard = htmlToElement(/*html*/`
                <div class="hil-hide hil-card hil-log-settings hil-themed ${getTheme()}">
                    <div class="hil-log-settings-row"><div>Show timestamps</div></div>
                    <div class="hil-log-settings-row"><div>Show names</div></div>
                    <div class="hil-log-settings-row"><div>Show chat log messages</div></div>
                    <div class="hil-log-settings-row"><div>Show tags</div></div>
                    <div class="hil-log-settings-row"><div>Separate message lines</div></div>
                    <div class="hil-log-settings-row"><div>Show muted messages</div></div>
                    <hr class="v-divider hil-themed ${getTheme()}" style="margin-bottom: 0">
                    <div class="hil-log-colors"></div>
                </div>
            `);

            const TOGGLE_CLASSES = ["hil-hide-timestamps", "hil-hide-names", "hil-hide-plain", "hil-hide-tags", "hil-no-breaks", "hil-hide-muted"];
            for (let i = 0; i < TOGGLE_CLASSES.length; i++) {
                const cls = TOGGLE_CLASSES[i];
                const enabledDefault = (cls === "hil-hide-muted") ? false : true;
                const swtch = createSwitch(function(value) {
                    logDiv.classList[value ? "remove" : "add"](cls);
                    if (cls === "hil-no-breaks") {
                        for (let br of logDiv.querySelectorAll('br')) {
                            if (!br.previousElementSibling) continue;
                            if (value) {
                                if (br.previousElementSibling.classList.contains("hil-space")) br.previousElementSibling.remove();
                            } else {
                                addSpaceBeforeBR(br);
                            }
                            if (value) br.previousElementSibling.textContent = br.previousElementSibling.textContent.trim();
                            else br.previousElementSibling.textContent += " ";
                        }
                    }
                }, enabledDefault);
                settingsCard.children[i].appendChild(swtch);
            }

            logColors = settingsCard.querySelector('.hil-log-colors');
            saveColorsButton = createButton(
                function() {
                    const updated = {};
                    for (let row of logColors.children) {
                        const name = row.querySelector('.hil-log-settings-color-name').dataset.name;
                        const color = row.querySelector('input').value;
                        if (nameColors[name] != color) {
                            updated[name] = true;
                        }
                        nameColors[name] = color;
                    }
                    for (let div of logDiv.querySelectorAll('div[data-name]')) {
                        if (updated[div.dataset.name]) div.style.color = nameColors[div.dataset.name];
                    }
                },
                'Save Colors',
                'hil-log-colors-button v-btn--disabled',
            );
            settingsCard.appendChild(saveColorsButton);
            app.appendChild(settingsCard);

            document.addEventListener('click', function () {
                if (document.querySelector('.hil-log-settings:hover')) return;
                if (document.querySelector('.hil-expanded-log-settings-button:hover')) return;
                settingsCard.classList.add('hil-hide');
            });

            settingsButton.addEventListener('click', function() {
                settingsCard.classList.toggle("hil-hide");
                if (!settingsCard.classList.contains("hil-hide")) {
                    settingsCard.style.right = 0;
                    const rect = settingsButton.getClientRects()[0];
                    settingsCard.style.top = (rect.y + rect.height + 17) + "px";
                }
            });

        }
    });


    const origOnevent = socket.onevent;
    socket.onevent = function (e) {
        const [action, data] = e.data;

        if (action === 'spectate_success') {
            socketStates.spectating = true;
        } else if ((action === 'join_success' || action === 'join_discord_success') && socketStates.spectating) {
            location.reload();
        } else if (action === 'receive_message') {

            if (socketStates.options['tts'] && socketStates['tts-enabled']) data.frame.frameActions.push({ "actionId": 5 });
            if (socketStates.options['testimony-mode'] && socketStates['testimony-music']) {
                const matches = data.frame.text.match(/\[#bgm([0-9s]|fo|fi)*?\]/g);
                if (matches && matches.find(match => match !== socketStates['testimony-music'])) socketStates['testimony-music-state'] = false;
            }
            if (socketStates.options['list-moderation'] && socketStates.options['mute-character']) {
                const unwatch = frameInstance.$watch('frame', function (frame) {
                    if (!compareShallow(frame, data.frame, ['text', 'poseId', 'bubbleType', 'username', 'mergeNext', 'doNotTalk', 'goNext', 'poseAnimation', 'flipped', 'backgroundId', 'characterId', 'popupId'])) return;
                    unwatch();

                    if (data.userId in socketStates['mutedCharUsers']) {
                        const muteCharacter = getMuteCharacter(frameInstance.character.id, frame.poseId);
                        if (frameInstance.pairConfig?.characterId === frameInstance.character.id) frameInstance.pairConfig.characterId = muteCharacter.characterId;
                        else if (frameInstance.pairConfig?.characterId2 === frameInstance.character.id) frameInstance.pairConfig.characterId2 = muteCharacter.characterId;
                        frame.characterId = muteCharacter.characterId;
                        frame.poseId = muteCharacter.poseId;
                    }

                    if (Object.values(muteCharacters).map(character => character.poseId).includes(frame.pairPoseId)) return;
                    const pairedUser = roomInstance.pairs.find(pair => pair.userId1 === data.userId)?.userId2 || roomInstance.pairs.find(pair => pair.userId2 === data.userId)?.userId1;
                    if (!(pairedUser in socketStates['mutedCharUsers'])) return;

                    const pairIs2 = frameInstance.character.id === frameInstance.pairConfig.characterId;
                    const muteCharacter = getMuteCharacter(pairIs2 ? frameInstance.pairConfig.characterId2 : frameInstance.pairConfig.characterId, frame.pairPoseId);
                    frameInstance.frame.pairPoseId = muteCharacter.poseId;
                    if (pairIs2) frameInstance.pairConfig.characterId2 = muteCharacter.characterId;
                    else frameInstance.pairConfig.characterId = muteCharacter.characterId;
                });
            }
            socketStates['prev-message'] = data;
            
            if (socketStates.options['extended-log']) {
                window.postMessage(['receive_message', data]);
            }

        } else if (action === 'receive_plain_message') {
            window.postMessage(['plain_message', {
                text: data.text,
                userId: data.userId,
                username: roomInstance.users.find(user => user.id === data.userId).username,
            }]);
        } else if (action === 'user_left') {
            if (socketStates.options['remute'] && data.authUsername) {
                if (muteInputInstance.selectedItems.find(user => user.id === data.id)) {
                    socketStates['mutedLeftCache'][data.authUsername] = true;
                }
                if (socketStates.options['mute-character'] && data.id in socketStates['mutedCharUsers']) {
                    socketStates['hiddenLeftCache'][data.authUsername] = true;
                }
            }
            if (socketStates.options['chat-moderation']) {
                for (let buttonContainer of document.querySelectorAll('div.hil-user-action-buttons[data-user-id="' + data.id + '"]')) {
                    buttonContainer.removeWithTooltips();
                }
            }
        } else if (action === 'set_mods') {
            for (let icon of document.querySelectorAll('.hil-userlist-mod > i.mdi-crown')) {
                const button = icon.parentElement;
                if (!data.includes(parseInt(button.parentElement.dataset.userId))) continue;
                icon.classList.add('mdi-account-arrow-down');
                icon.classList.remove('mdi-crown');
                button.tooltip?.realign('Remove moderator');
            }
            for (let icon of document.querySelectorAll('.hil-userlist-mod > i.mdi-account-arrow-down')) {
                const button = icon.parentElement;
                if (data.includes(parseInt(button.parentElement.dataset.userId))) continue;
                icon.classList.remove('mdi-account-arrow-down');
                icon.classList.add('mdi-crown');
                button.tooltip?.realign('Make moderator');
            }
        } else if (action === 'user_joined') {
            if (socketStates.options['remute'] && data.authUsername) {
                function addJoinText(text) {
                    const checkLastMessage = () => {
                        if (chatInstance.messages[chatInstance.messages.length - 1].text.slice(0, -' joined.'.length) !== data.username) return false;
                        chatInstance.messages[chatInstance.messages.length - 1].text += ' ' + text;
                        return true;
                    }
                    if (checkLastMessage() === false) {
                        const unwatch = chatInstance.$watch('messages', function () {
                            if (checkLastMessage()) unwatch();
                        });
                    }
                }

                if (data.authUsername in socketStates['mutedLeftCache']) {
                    muteInputInstance.selectItem(data.id);
                    delete socketStates['mutedLeftCache'][data.authUsername];
                    addJoinText('(Automatically re-muted)');
                } else if (socketStates.options['mute-character'] && data.authUsername in socketStates['hiddenLeftCache']) {
                    addJoinText('(Automatically re-hidden)');
                }
                if (socketStates.options['mute-character'] && data.authUsername in socketStates['hiddenLeftCache']) {
                    socketStates['mutedCharUsers'][data.id] = true;
                    delete socketStates['hiddenLeftCache'][data.authUsername];
                }
            }
        }

        origOnevent(e);
    }

    const origEmit = socket.emit;
    socket.emit = function (action, data) {
        let delay = 0;

        if (action === 'message') {
            if (socketStates['no-talk'] || data.frame.text.includes('[##nt]')) data.frame.doNotTalk = true;
            if (socketStates['dont-delay'] || data.frame.text.includes('[##dd]')) data.frame.keepDialogue = true;
            if (data.frame.text.includes('[##mn]')) data.frame.mergeNext = true;
            if (data.frame.text.includes('[##ct]')) data.frame.frameActions.push({ "actionId": 9 });
            if (data.frame.text.includes('[##tm]')) data.testimony = true;

            if (socketStates.options['smart-tn'] && data.frame.poseAnimation && socketStates['prev-char'] === characterInstance.currentCharacter.id && data.frame.poseId !== socketStates['prev-pose']) {
                (function () {
                    let useTN = socketStates.options['tn-toggle-value'];
                    useTN = useTN === undefined ? true : useTN;
                    useTN = data.frame.text.includes('[##tn]') ? !useTN : useTN;
                    if (!useTN) return;

                    if (socketStates['prev-message'] !== undefined) {
                        const prevFrame = socketStates['prev-message'].frame;
                        if (prevFrame.text.match(/\[#evd[0-9]+?\]/g) || prevFrame.characterId !== data.frame.characterId || (prevFrame.pairId === data.frame.pairId && data.frame.pairId !== null)) return;
                    }

                    const patterns = socketStates.options['smart-tn-patterns'] || ['TN'];
                    const charPoses = characterInstance.currentCharacter.poses;
                    const prevPoseName = charPoses.find(pose => pose.id === socketStates['prev-pose']).name;
                    const currentPoseName = charPoses.find(pose => pose.id === data.frame.poseId).name;
                    let poseIsTN = false;
                    for (let substr of patterns) {
                        if (prevPoseName.includes(substr)) poseIsTN = true;
                        if (currentPoseName.includes(substr)) poseIsTN = true;
                    }
                    if (poseIsTN) return;

                    let tnPoses = [];
                    for (let substr of patterns) {
                        tnPoses = tnPoses.concat(charPoses.filter(pose => pose.name.includes(substr)));
                    }
                    if (tnPoses.length === 0) return;
                    const [tnPoseName, distance] = closestMatch(prevPoseName, tnPoses.map(pose => pose.name));
                    if (!tnPoseName) return;
                    const ratio = (prevPoseName.length + tnPoseName.length - distance) / (prevPoseName.length + tnPoseName.length);
                    if (ratio < 0.63) return;
                    const tnPoseId = charPoses.find(pose => pose.name === tnPoseName).id;
                    const tnData = JSON.parse(JSON.stringify(data));
                    tnData.frame.poseId = tnPoseId;
                    tnData.frame.text = '';
                    origEmit.call(socket, action, tnData);
                    delay = 1000;
                })();
            }
            if (socketStates.options['testimony-mode']) (function () {
                if (data.frame.text.includes('[##ce]')) data.testimony = false;

                const match = /\[##tmid([0-9]+?)\]/g.exec(data.frame.text);
                if (match === null) return;
                const statementId = parseInt(match[1]);
                
                if (!socketStates['testimony-music-state'] && socketStates['testimony-music'] && !data.frame.text.includes('[##nt]')) {
                    data.frame.text = socketStates['testimony-music'] + data.frame.text;
                    socketStates['testimony-music-state'] = true;
                }

                if (socketStates.testimonyPoses[statementId]) {
                    data.frame.poseId = socketStates.testimonyPoses[statementId];
                } else {
                    socketStates.testimonyPoses[statementId] = poseInstance.currentPoseId;
                    window.postMessage([
                        'set_statement_pose_name',
                        {
                            id: statementId,
                            name: poseInstance.characterPoses.find(pose => pose.id === poseInstance.currentPoseId).name,
                        }
                    ]);
                }
            })();

            socketStates['prev-pose'] = data.frame.poseId;
            socketStates['prev-char'] = characterInstance.currentCharacter.id;

            if (socketStates.options['more-color-tags']) {
                data.frame.text = data.frame.text.replaceAll('[#/y]', '[#/cf3ff00]');
                data.frame.text = data.frame.text.replaceAll('[#/w]', '[#/cbbb]');
                data.frame.text = data.frame.text.replaceAll('[#/dr]', '[#/cf00]');
            }

            if (socketStates.options['fix-tag-nesting']) {
                data.frame.text = fixTagNesting(data.frame.text);
            }

            data.frame.text = data.frame.text.replaceAll(/\[##.*?\]/g, '');
            if (data.frame.text.length > 500) {
                data.frame.text = data.frame.text.slice(0, 500);
                toolbarInstance.$snotify.info('Your message ended up being above 500 character limit, and was cropped.');
            }
        }

        if (delay === 0) origEmit.call(socket, action, data);
        else setTimeout(() => origEmit.call(socket, action, data), delay);
    }
}

main();

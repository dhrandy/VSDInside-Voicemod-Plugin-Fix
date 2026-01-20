/* ============================================================
   GLOBALS: SOCKET, STATE, CACHE
   ============================================================ */

let voiceSocket = null;
let socketId = "100";
let voiceStatus = false;
let voiceKey = true;
let isConnecting = false;
let vmReady = false;

let cache = {
    voicesArr: null,
    currentVoice: null,
    soundboards: null,
    backgroundEffectStatus: null,
    muteMicStatus: null,
    hearMyselfStatus: null,
    muteMemeForMeStatus: null
};

/* ============================================================
   VOICEMOD SOCKET HELPERS
   ============================================================ */

const voiceSend = (action, payload, id = socketId) => {
    if (voiceSocket && voiceSocket.readyState === 1) {
        voiceSocket.send(JSON.stringify({ action, payload, id }));
    }
};

const connect = (isReset = false) => {
    if (isConnecting) return;
    if (voiceSocket && voiceSocket.readyState !== 3) return;

    isConnecting = true;

    voiceSocket = new WebSocket("ws://localhost:59129/v1/");

    voiceSocket.onopen = () => {
        isConnecting = false;
        voiceSend("registerClient", { clientKey: "streamer-l6hy23914" });
    };

    voiceSocket.onerror = () => {
        isConnecting = false;
        reconnect();
    };

    voiceSocket.onclose = () => {
        isConnecting = false;
        reconnect();
    };

    voiceSocket.onmessage = (v) => {
        const data = JSON.parse(v.data);

        if (data.actionID) {
            socketId = data.actionID;
            voiceStatus = true;
        }

        if (data.action === "registerClient") {
            vmReady = true;
        }

        for (const key in $data) {
            $data[key].onmessage?.(data);
        }
    };

    if (isReset) {
        voiceStatus = false;
        const errImg = [
            '../static/img/key-select-voice.png',
            '../static/img/key-random-voice-idle.png',
            '../static/img/key-voice-changer-off.png',
            '../static/img/key-hear-my-voice-off.png',
            '../static/img/key-ambient-sound-off.png',
            '../static/img/key-mute-sounds-off.png',
            '../static/img/key-push-bad-language-on-2.png',
            '../static/img/key-voice-changer-on-1.png',
            '../static/img/key-new-sound.png',
            '../static/img/key-stop-all-sounds.png',
            '../static/img/key-mute-for-me-idle.png'
        ];

        actionArr.forEach((item, i) => {
            for (const ctx in $data[item].context_pool) {
                $SD.setSettings(ctx, { voiceStatus });
                $SD.setImage(ctx, errImg[i]);
            }
        });
    }
};

const reconnect = () => {
    if (!voiceKey) return;
    voiceKey = false;

    setTimeout(() => {
        voiceKey = true;
        connect(true);
    }, 1000);
};

/* ============================================================
   ACTION DEFINITIONS
   ============================================================ */

let actionArr = [
    'com.hotspot.streamdock.voicemod.action1',
    'com.hotspot.streamdock.voicemod.action2',
    'com.hotspot.streamdock.voicemod.action3',
    'com.hotspot.streamdock.voicemod.action4',
    'com.hotspot.streamdock.voicemod.action5',
    'com.hotspot.streamdock.voicemod.action6',
    'com.hotspot.streamdock.voicemod.action7',
    'com.hotspot.streamdock.voicemod.action8',
    'com.hotspot.streamdock.voicemod.action9',
    'com.hotspot.streamdock.voicemod.action10',
    'com.hotspot.streamdock.voicemod.action11'
];

let $data = {

    /* 变声器选项 */
    [actionArr[0]]: {
        voicesArr: [],
        currentVoice: '',
        context_pool: {},
        onmessage(data) {
            if (data.actionType === "getVoices") {
                cache.currentVoice = data.payload.currentVoice;
                cache.voicesArr = data.payload.voices.filter(item => item.isEnabled || item.enabled);
                this.currentVoice = cache.currentVoice;
                this.voicesArr = cache.voicesArr;

                for (let key in this.context_pool) {
                    $SD.setSettings(key, {
                        voiceStatus,
                        voicesArr: this.voicesArr,
                        active: this.context_pool[key].active || ''
                    });
                    if (this.context_pool[key].active) {
                        voiceSend("getBitmap", { voiceID: this.context_pool[key].active }, key);
                    }
                }
            }

            if (data.actionType === "getBitmap" && data.actionObject.voiceID) {
                let base64 = data.actionObject.voiceID === this.currentVoice
                    ? data.actionObject.result.selected
                    : data.actionObject.result.transparent;

                if (this.voicesArr.some(item => item.id === this.context_pool[data.actionID].active)) {
                    $SD.setImage(data.actionID, "data:image/png;base64," + base64);
                } else {
                    $SD.setImage(data.actionID, "../static/img/key-select-voice.png");
                }
            }

            if (data.actionType === "voiceLoadedEvent" && data.actionObject) {
                this.currentVoice = data.actionObject.voiceID;
                cache.currentVoice = this.currentVoice;
                for (let key in this.context_pool) {
                    if (this.context_pool[key].active) {
                        voiceSend("getBitmap", { voiceID: this.context_pool[key].active }, key);
                    }
                }
            }
        },
        didReceiveSettings(data) {
            let active = data.payload.settings.active;

            if (active) {
                this.context_pool[data.context].active = active;
                voiceSend("getBitmap", { voiceID: active }, data.context);
            } else {
                $SD.setImage(data.context, "../static/img/key-select-voice.png");
            }
        },
        keyUp(data) {
            if (data.payload.settings.active) {
                voiceSend("loadVoice", { voiceID: data.payload.settings.active });
            }
        },
        willAppear(data) {
            if (!this.context_pool[data.context]) this.context_pool[data.context] = {};
            if (data.payload.settings.active) this.context_pool[data.context] = data.payload.settings;

            if (cache.voicesArr) {
                this.voicesArr = cache.voicesArr;
                this.currentVoice = cache.currentVoice;
                $SD.setSettings(data.context, {
                    voiceStatus,
                    voicesArr: this.voicesArr,
                    active: this.context_pool[data.context].active || ''
                });
                if (this.context_pool[data.context].active) {
                    voiceSend("getBitmap", { voiceID: this.context_pool[data.context].active }, data.context);
                }
            }
        }
    },

    /* 随机语音 */
    [actionArr[1]]: {
        context_pool: {},
        voicesArr: [],
        checkoutBg() {
            let src = "../static/img/key-random-voice-idle.png";
            if (voiceStatus) src = "../static/img/key-random-voice-idle-1.png";

            for (let key in this.context_pool) {
                $SD.setImage(key, src);
                $SD.setSettings(key, { voiceStatus });
            }
        },
        onmessage(data) {
            if (data.actionType === "getVoices") {
                cache.currentVoice = data.payload.currentVoice;
                cache.voicesArr = data.payload.voices.filter(item => item.isEnabled || item.enabled);
                this.voicesArr = cache.voicesArr;
            }
        },
        willAppear(data) {
            if (!this.context_pool[data.context]) this.context_pool[data.context] = {};
            this.checkoutBg();

            if (cache.voicesArr) {
                this.voicesArr = cache.voicesArr;
            }
        },
        keyUp() {
            if (!this.voicesArr.length) return;
            let id = this.voicesArr[Math.floor(Math.random() * this.voicesArr.length)].id;
            voiceSend("loadVoice", { voiceID: id });
        }
    },

    /* 语音转换器开/关 */
    [actionArr[2]]: {
        context_pool: {},
        checkoutBg(status) {
            let src = "../static/img/key-voice-changer-off.png";
            if (status) src = "../static/img/key-voice-changer-on.png";

            for (let key in this.context_pool) {
                $SD.setImage(key, src);
                $SD.setSettings(key, { voiceStatus });
            }
        },
        onmessage(data) {
            if (data.actionType === "toggleVoiceChanger") {
                this.checkoutBg(data.actionObject.value);
            }
            if (data.actionType === "voiceChangerDisabledEvent") this.checkoutBg(false);
            if (data.actionType === "voiceChangerEnabledEvent") this.checkoutBg(true);
        },
        willAppear(data) {
            if (!this.context_pool[data.context]) this.context_pool[data.context] = {};
            // Use last known state if needed (no explicit cache here)
        },
        keyUp() {
            voiceSend("toggleVoiceChanger");
        }
    },

    /* 听见自己的声音开/关 */
    [actionArr[3]]: {
        context_pool: {},
        checkoutBg(status) {
            let src = "../static/img/key-hear-my-voice-off.png";
            if (status) src = "../static/img/key-hear-my-voice-on.png";

            for (let key in this.context_pool) {
                $SD.setImage(key, src);
                $SD.setSettings(key, { voiceStatus });
            }
        },
        onmessage(data) {
            if (data.actionType === "toggleHearMyVoice") {
                cache.hearMyselfStatus = data.actionObject.value;
                this.checkoutBg(data.actionObject.value);
            }
            if (data.actionType === "hearMySelfDisabledEvent") {
                cache.hearMyselfStatus = false;
                this.checkoutBg(false);
            }
            if (data.actionType === "hearMySelfEnabledEvent") {
                cache.hearMyselfStatus = true;
                this.checkoutBg(true);
            }
        },
        willAppear(data) {
            if (!this.context_pool[data.context]) this.context_pool[data.context] = {};
            if (cache.hearMyselfStatus !== null) {
                this.checkoutBg(cache.hearMyselfStatus);
            }
        },
        keyUp() {
            voiceSend("toggleHearMyVoice");
        }
    },

    /* 背景效果开/关 */
    [actionArr[4]]: {
        context_pool: {},
        checkoutBg(status) {
            let src = "../static/img/key-ambient-sound-off.png";
            if (status) src = "../static/img/key-ambient-sound-on.png";

            for (let key in this.context_pool) {
                $SD.setImage(key, src);
                $SD.setSettings(key, { voiceStatus });
            }
        },
        onmessage(data) {
            if (data.actionType === "toggleBackground") {
                cache.backgroundEffectStatus = data.actionObject.value;
                this.checkoutBg(data.actionObject.value);
            }
            if (data.actionType === "backgroundEffectsDisabledEvent") {
                cache.backgroundEffectStatus = false;
                this.checkoutBg(false);
            }
            if (data.actionType === "backgroundEffectsEnabledEvent") {
                cache.backgroundEffectStatus = true;
                this.checkoutBg(true);
            }
        },
        willAppear(data) {
            if (!this.context_pool[data.context]) this.context_pool[data.context] = {};
            if (cache.backgroundEffectStatus !== null) {
                this.checkoutBg(cache.backgroundEffectStatus);
            }
        },
        keyUp() {
            voiceSend("toggleBackground");
        }
    },

    /* 静音开/关 */
    [actionArr[5]]: {
        context_pool: {},
        checkoutBg(status) {
            let src = "../static/img/key-mute-sounds-off.png";
            if (status) src = "../static/img/key-mute-sounds-on.png";

            for (let key in this.context_pool) {
                $SD.setImage(key, src);
                $SD.setSettings(key, { voiceStatus });
            }
        },
        onmessage(data) {
            if (data.actionType === "toggleMuteMic") {
                cache.muteMicStatus = data.actionObject.value;
                this.checkoutBg(data.actionObject.value);
            }
            if (data.actionType === "muteMicrophoneDisabledEvent") {
                cache.muteMicStatus = false;
                this.checkoutBg(false);
            }
            if (data.actionType === "muteMicrophoneEnabledEvent") {
                cache.muteMicStatus = true;
                this.checkoutBg(true);
            }
        },
        willAppear(data) {
            if (!this.context_pool[data.context]) this.context_pool[data.context] = {};
            if (cache.muteMicStatus !== null) {
                this.checkoutBg(cache.muteMicStatus);
            }
        },
        keyUp() {
            voiceSend("toggleMuteMic");
        }
    },

    /* 即时哔哔声 */
    [actionArr[6]]: {
        status: 0,
        context_pool: {},
        willAppear(data) {
            if (!this.context_pool[data.context]) this.context_pool[data.context] = {};
            for (let key in this.context_pool) {
                $SD.setSettings(key, { voiceStatus });
            }
        },
        onmessage(data) {
            if (data.action === "registerClient") {
                for (let key in this.context_pool) {
                    $SD.setSettings(key, { voiceStatus });
                }
            }
        },
        keyUp() {
            this.status = !this.status;
            voiceSend("setBeepSound", { badLanguage: this.status });
        }
    },

    /* 推送到语音转换器 */
    [actionArr[7]]: {
        isKeyDown: null,
        context_pool: {},
        willAppear(data) {
            if (!this.context_pool[data.context]) this.context_pool[data.context] = {};
            for (let key in this.context_pool) {
                $SD.setSettings(key, { voiceStatus, longpress: true });
            }
        },
        onmessage(data) {
            if (data.action === "registerClient") {
                for (let key in this.context_pool) {
                    $SD.setSettings(key, { voiceStatus, longpress: true });
                }
            }

            if (data.actionType === "toggleVoiceChanger") {
                if ((this.isKeyDown && !data.actionObject.value) ||
                    (this.isKeyDown === false && data.actionObject.value)) {
                    voiceSend("toggleVoiceChanger");
                }
            }
        },
        keyDown() {
            this.isKeyDown = true;
            voiceSend("getVoiceChangerStatus");
        },
        keyUp() {
            this.isKeyDown = false;
            voiceSend("getVoiceChangerStatus");
        }
    },

    /* 音板播放 */
    [actionArr[8]]: {
        usableBoards: [],
        context_pool: {},
        willAppear(data) {
            if (!this.context_pool[data.context]) this.context_pool[data.context] = {};

            if (data.payload.settings.active) {
                this.context_pool[data.context].active = data.payload.settings.active;
            }

            if (cache.soundboards) {
                this.usableBoards = cache.soundboards;
                $SD.setSettings(data.context, {
                    voiceStatus,
                    usableBoards: this.usableBoards,
                    active: this.context_pool[data.context].active || ''
                });
                if (this.context_pool[data.context].active) {
                    voiceSend("getBitmap", {
                        memeId: this.context_pool[data.context].active
                    }, data.context);
                }
            }
        },
        didReceiveSettings(data) {
            this.context_pool[data.context].active = data.payload.settings.active;

            if (data.payload.settings.active) {
                voiceSend("getBitmap", {
                    memeId: data.payload.settings.active
                }, data.context);
            } else {
                $SD.setImage(data.context, "../static/img/key-new-sound.png");
            }
        },
        onmessage(data) {
            if (data.actionType === "getAllSoundboard") {
                cache.soundboards = data.actionObject.soundboards.filter(item => item.enabled);
                this.usableBoards = cache.soundboards;

                for (let key in this.context_pool) {
                    $SD.setSettings(key, {
                        voiceStatus,
                        usableBoards: this.usableBoards,
                        active: this.context_pool[key].active || ''
                    });

                    if (this.context_pool[key].active) {
                        voiceSend("getBitmap", {
                            memeId: this.context_pool[key].active
                        }, key);
                    }
                }
            }

            if (data.actionType === "getBitmap" && data.actionObject.memeId) {
                let img = data.actionObject.result.default;

                if (img) {
                    $SD.setImage(data.actionID, "data:image/png;base64," + img);
                } else {
                    $SD.setImage(data.actionID, "../static/img/noting.png");
                }
            }
        },
        keyUp(data) {
            if (!this.context_pool[data.context].active) return;
            voiceSend("playMeme", {
                FileName: this.context_pool[data.context].active,
                IsKeyDown: true
            });
        }
    },

    /* 停止所有模因 */
    [actionArr[9]]: {
        context_pool: {},
        willAppear(data) {
            if (!this.context_pool[data.context]) this.context_pool[data.context] = {};
            for (let key in this.context_pool) {
                $SD.setSettings(key, { voiceStatus });
            }
        },
        onmessage(data) {
            if (data.action === "registerClient") {
                for (let key in this.context_pool) {
                    $SD.setSettings(key, { voiceStatus });
                }
            }
        },
        keyUp() {
            voiceSend("stopAllMemeSounds");
        }
    },

    /* 为我静音开/关 */
    [actionArr[10]]: {
        context_pool: {},
        checkoutBg(status) {
            let src = "../static/img/key-mute-for-me-idle.png";
            if (status) src = "../static/img/key-mute-for-me-on.png";

            for (let key in this.context_pool) {
                $SD.setImage(key, src);
                $SD.setSettings(key, { voiceStatus });
            }
        },
        onmessage(data) {
            if (data.actionType === "toggleMuteForMeMeme") {
                cache.muteMemeForMeStatus = data.actionObject.value;
                this.checkoutBg(data.actionObject.value);
            }
            if (data.actionType === "muteMemeForMeDisabledEvent") {
                cache.muteMemeForMeStatus = false;
                this.checkoutBg(false);
            }
            if (data.actionType === "muteMemeForMeEnabledEvent") {
                cache.muteMemeForMeStatus = true;
                this.checkoutBg(true);
            }
        },
        willAppear(data) {
            if (!this.context_pool[data.context]) this.context_pool[data.context] = {};
            if (cache.muteMemeForMeStatus !== null) {
                this.checkoutBg(cache.muteMemeForMeStatus);
            }
        },
        keyUp() {
            voiceSend("toggleMuteMemeForMe");
        }
    }
};

/* ============================================================
   STREAM DECK SOCKET REGISTRATION
   ============================================================ */

async function connectElgatoStreamDeckSocket(inPort, inPluginUUID, inRegisterEvent, inInfo) {
    websocket = new WebSocket("ws://127.0.0.1:" + inPort);

    websocket.onopen = function () {
        websocket.send(JSON.stringify({
            event: inRegisterEvent,
            uuid: inPluginUUID
        }));
    };

    websocket.onmessage = function (e) {
        const data = JSON.parse(e.data);
        const { event, action } = data;
        $data[action]?.[event]?.(data);
    };
}

/* ============================================================
   STARTUP: CONNECT ONCE + INITIAL SYNC
   ============================================================ */

connect();

setTimeout(() => {
    if (voiceSocket && voiceSocket.readyState === 1) {
        voiceSend("getVoices");
        voiceSend("getAllSoundboard");
        voiceSend("getBackgroundEffectStatus");
        voiceSend("getMuteMicStatus");
        voiceSend("getHearMyselfStatus");
        voiceSend("getMuteMemeForMeStatus");
    }
}, 500);
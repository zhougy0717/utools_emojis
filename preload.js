changeStyle = () => {
    style = document.createElement("style");
    style.innerHTML = (`
    .list .list-item-content .list-item-title {
        padding-top: unset;
        height: unset;
        line-height: unset;
        font-size: 2rem;
        float: left;}
    .list .list-item-content .list-item-description {
        color: rgba(0, 0, 0, 0.5);
        line-height: 3rem;
        font-size: 1rem;
        padding-left: 10px;
    `);
    document.head.appendChild(style);
}

let emojis_code, emojis;
let emojesClickCount;

utools.onPluginReady(() => {
    changeStyle();
})



// 列表模式
window.exports = {
    "emoji": {
        mode: "list",
        args: {
            enter: async (action, callbackSetList) => {
                //changeStyle();
                if (!emojis) {
                    console.log('init emojis')
                    emojis = require('./emojis.json')
                    emojesClickCount = utools.db.get("emojesClickCount");
                    if(!emojesClickCount) emojesClickCount = {
                        _id:"emojesClickCount",
                        c:{}
                    }
                    emojis.forEach(e => {
                        e.title = e._id;
                        e.keyword += e._id;
                        e.c = emojesClickCount.c[e._id]??0;
                    });
                    emojis.sort((a,b)=>b.c-a.c);
                }

                callbackSetList(emojis)
            },
            search: (action, searchWord, callbackSetList) => {
                searchWord = searchWord.trim();
                if (!searchWord) return callbackSetList(emojis);
                let kw = searchWord.toLowerCase().split(' ');
                let sRet = emojis.filter(x => {
                    for (let k of kw) {
                        if (k) {
                            if (!x.keyword.includes(k)) return false;
                        }
                    }
                    return true;
                });
                if (/^[a-zA-Z]+$/.test(searchWord)) {
                    //纯粹英文进行排序
                    let reg = new RegExp("\\b" + searchWord + "\\b", "i");
                    sRet.sort((a, b) => {
                        if(a.c == b.c)   return reg.test(a.keyword) ? -1 : 1;
                        return b.c-a.c;
                    });
                }
                callbackSetList(sRet);
            },
            select: async (action, itemData, callbackSetList) => {
                utools.copyText(itemData._id);
                itemData.c++;

                utools.hideMainWindow();
                utools.simulateKeyboardTap('v', utools.isWindows() ? 'ctrl' : 'command')
                emojis.sort((a,b)=>b.c-a.c);
                //将点击次数保存到数据库。
                if(itemData.c<50000) {
                    emojesClickCount.c[itemData._id]=itemData.c;
                    utools.db.put(emojesClickCount);
                }

            },
            placeholder: "搜索，回车发送到活动窗口"
        }
    },
    "emojicode": {
        mode: "list",
        args: {
            enter: async (action, callbackSetList) => {
                //changeStyle();
                if (!emojis_code) {
                    console.log('init emojis_code')
                    emojis_code = require('./emojiscode.json')
                }
                callbackSetList(emojis_code)
            },
            search: (action, searchWord, callbackSetList) => {
                searchWord = searchWord.trim();
                if (!searchWord) return callbackSetList(emojis_code);
                let kw = searchWord.toLowerCase().split(' ');
                callbackSetList(emojis_code.filter(x => {
                    for (let k of kw) {
                        if (k) {
                            if (!x.keyword.includes(k)) return false;
                        }
                    }
                    return true;
                }))
            },
            select: async (action, itemData, callbackSetList) => {
                utools.copyText(itemData.description);
                //utools.copyText(JSON.stringify(action));
                utools.hideMainWindow();
                utools.simulateKeyboardTap('v', utools.isWindows() ? 'ctrl' : 'command')
            },
            placeholder: "搜索，回车发送代码到活动窗口"
        }
    }
}
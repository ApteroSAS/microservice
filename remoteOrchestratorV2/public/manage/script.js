const IN_APP_WEB_BROWSER_PROTOCOL = "web-browser:";
const IN_APP_WEB_BROWSER_TRAIL = "/web-browser.mp4";

function init() {
    const paramHost = new URL(window.location.href).searchParams.get("host");
    window.service = {
        host: paramHost || (window.location.host.startsWith("localhost")?"vm.aptero.co":window.location.host)
    }
    console.log(window.service.host);

    document.addEventListener("DOMContentLoaded", (event) => {
        let urlEl = document.getElementById("explain-link-3d");
        urlEl.addEventListener("change", async () => {
            await explainVMUpdate();
        })
    })

    $("document").ready(function () {
        //document.getElementById("sessionid").value = document.getElementById("sessionid").value + "-" + makeid(5);
        document.getElementById("password").value = document.getElementById("password").value + "-" + makeid(5);
    });

    fillList();
}

/**
 * generic
 * @param sessionID
 * @param width
 * @param height
 * @param image
 * @param imageParams
 * @param password
 * @returns {string}
 */
function generateNewFrame(sessionID, width, height, image, imageParams, password) {
    if (!imageParams) {
        imageParams = {}
    }
    imageParams["PASSWORD"] = password;
    return "web-browser:" + btoa(JSON.stringify({
        sessionID,
        width,
        height,
        image,
        imageParams
    })) + "/web-browser.mp4";
}

/**generic
 * @param screenSRC
 * @returns {Promise<unknown>}
 */
async function getNoVNCLink(screenSRC) {
    return new Promise((resolve, reject) => {
        screenSRC = screenSRC.replace(IN_APP_WEB_BROWSER_PROTOCOL, "");
        screenSRC = screenSRC.replace(IN_APP_WEB_BROWSER_TRAIL, "");
        let metaData = JSON.parse(atob(screenSRC));
        axios.post("https://" + window.service.host + "/service/remote/orchestrator/create", {
            localSessionID: "none",
            remoteScreenSessionId: metaData.sessionID,
            screenSizeX: metaData.width,
            screenSizeY: metaData.height,
            dockerImage: metaData.image,
            imageParams: metaData.imageParams
        }).then(async resp => {
            resp = resp.data;
            let url1 = new URL(resp.url);
            const url = "wss://" + url1.host + "/reverse/" + resp.ip + "/" + resp.port + "/websockify";
            resolve({
                url,
                password: metaData.imageParams ? metaData.imageParams.PASSWORD : undefined,
                vmsid: resp.vmsid
            });
        }).catch(err => {
            console.log(err);
            reject(err);
        });
    });
}

/**
 * Ephemeral VM
 */

function ephemeralVMCreate(){
    let urlEl = document.getElementById("ephemeral_link_url");
    const novncURL = new URL("https://" + window.service.host + "/service/remote/orchestrator/static/manage/vnc/vnc_once.html")
    //const novncURL = new URL("https://novnc.com/noVNC/vnc_lite.html");
    novncURL.searchParams.set("url", new URL(urlEl.value).toString());
    document.getElementById("ephemeral_link_result").value = novncURL.toString();
}


/**
 * Permanent VM
 */

function permanentVMCreate(){
    permanentVMDisplay();
    permanentVMGenerateLink();
}

function permanentGenerateNoVNCLink(vmUrl, password, vmsid) {
    vmUrl = vmUrl.replace("wss", "https"); //replace first
    vmUrl = new URL(vmUrl);
    const host = vmUrl.host;
    const port = vmUrl.port === "" ? 443 : vmUrl.port;
    const path = vmUrl.pathname.replace("/", ""); //remove first slash
    const novncURL = new URL("https://" + window.service.host + "/service/remote/orchestrator/static/manage/vnc/vnc_lite.html")
    //const novncURL = new URL("https://novnc.com/noVNC/vnc_lite.html");
    novncURL.searchParams.set("host", host);
    novncURL.searchParams.set("port", port);
    novncURL.searchParams.set("path", path);
    novncURL.searchParams.set("scale", true);
    novncURL.searchParams.set("password", password);
    novncURL.searchParams.set("vmsid", vmsid)
    //https://novnc.com/noVNC/vnc_lite.html?host=meet.aptero.co&port=443&path=reverse/172.20.0.7/8080/websockify&scale=true
    return novncURL.toString();
}

async function permanentVMGenerateLink() {
    let screenSRC = document.getElementById("result-link-3d-permanent").value
    let data = await getNoVNCLink(screenSRC);
    const vmVNCLink = permanentGenerateNoVNCLink(data.url, data.password, data.vmsid);
    document.getElementById("result-link-2d-permanent").value = vmVNCLink;
    //window.open(vmVNCLink, '_blank').focus();
    /*const atag = document.getElementById("result-link-2d-permanent");
    atag.style.visibility = "visible";
    atag.href = vmVNCLink;
    atag.textContent = vmVNCLink;*/
}

function permanentVMDisplay() {
    const sessionid = document.getElementById("sessionid").value;
    const width = document.getElementById("width").value;
    const height = document.getElementById("height").value;
    const image = document.getElementById("type").value;
    const password = document.getElementById("password").value;
    if (sessionid === "" || sessionid.length < 6 || sessionid.indexOf("public") !== -1) {
        alert("invalid sessionid")
        return;
    }
    const imageParams = JSON.parse(document.getElementById("image_params").value);
    document.getElementById("result-link-3d-permanent").value = generateNewFrame(sessionid, width, height, image, imageParams, password);
}

/***
 * EXPlain VM
 */

async function explainVMUpdate() {
    let screenSRC = document.getElementById("explain-link-3d").value;
    screenSRC = screenSRC.replace(IN_APP_WEB_BROWSER_PROTOCOL, "");
    screenSRC = screenSRC.replace(IN_APP_WEB_BROWSER_TRAIL, "");
    let metaData = JSON.parse(atob(screenSRC));
    document.getElementById("explain-sessionid").value = metaData.sessionID;
    document.getElementById("explain-width").value = metaData.width;
    document.getElementById("explain-height").value = metaData.height;
    document.getElementById("explain-type").value = metaData.image;
    document.getElementById("explain-image_params").value = JSON.stringify(metaData.imageParams);
    document.getElementById("explain-password").value = metaData.imageParams ? metaData.imageParams.PASSWORD : "";
}

/***
 * LIST SCRIPT
 */

//wss://meet.aptero.co/reverse/172.20.0.7/8080/websockify
function createEntry(data) {
    /*0001retail:{
        "container": "web-renderer-0001retail",
      "agent": {
        "url": "vm1.aptero.co/service/remote/orchestrator"
    }
    }*/
    const vmName = data.container.replace("web-renderer-","");
    let element = document.createElement('li');
    element.innerHTML = vmName + " ";

    let elementARemove = document.createElement('a');
    elementARemove.href = "https://" + window.service.host + "/service/remote/orchestrator/vm/remove/" + vmName;
    elementARemove.innerHTML = "remove"

    /*let elementAControl = document.createElement('a');
    elementAControl.href="#";
    elementAControl.innerHTML="ctrl"*/

    let space = document.createElement('span')
    space.innerHTML = " ";

    element.appendChild(elementARemove);
    element.appendChild(space);
    //element.appendChild(elementAControl);
    return element;
}

async function fillList() {
    let vmList = document.getElementById("vm_list");
    axios.get("https://" + window.service.host + "/service/remote/orchestrator/vm/list").then(async resp => {
        resp = resp.data;
        for (const respKey in resp) {
            const data = resp[respKey];
            vmList.appendChild(createEntry(data));
        }
    }).catch(err => {
        console.log(err);
        reject(err);
    });
}


/**
 * Generic
 */

function makeid(length)
{
    var result = "";
    var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
/**
 * Start the script
 */

init();

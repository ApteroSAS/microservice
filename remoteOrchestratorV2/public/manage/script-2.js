const IN_APP_WEB_BROWSER_PROTOCOL = "web-browser:";
const IN_APP_WEB_BROWSER_TRAIL = "/web-browser.mp4";

function init() {
  const paramHost = new URL(window.location.href).searchParams.get("host");
  window.service = {
    host: paramHost || "vm1.aptero.co/service/remote/orchestrator",
  }
  console.log(window.service.host);
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
function generateNewFrame(width, height, imageParams, password, agentServerUrl) {
  if (!imageParams) {
    imageParams = {}
  }
  imageParams["PASSWORD"] = password;
  return IN_APP_WEB_BROWSER_PROTOCOL + btoa(JSON.stringify({
    sessionID: "ephemeral-" + makeid(12),
    width,
    height,
    image: "",
    imageParams,
    agentServerUrl
  })) + IN_APP_WEB_BROWSER_TRAIL;
}


/**
 * Ephemeral VM
 */

function ephemeralVMCreate() {
  let urlEl = document.getElementById("ephemeral_link_url");
  let urlStr = new URL(urlEl.value).toString()
  const sessionid = "ephemeral-" + makeid(12);
  const width = document.getElementById("width").value;
  const height = document.getElementById("height").value;
  //const width = 1024;
  //const height = 768;
  const password = makeid(12);
  if (sessionid === "" || sessionid.length < 6 || sessionid.indexOf("public") !== -1) {
    alert("invalid sessionid")
    return;
  }
  const imageParams = {
    URL: urlStr
  };
  document.getElementById("ephemeral_link_result").value = generateNewFrame(width, height, imageParams, password, window.service.host);
}

/**
 * Generic
 */

function makeid(length) {
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

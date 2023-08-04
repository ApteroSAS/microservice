import Hyperbeam from "./hyperbeam_web@0.0.30.js" //https://unpkg.com/@hyperbeam/web@latest/dist/index.js

function readQueryVariable(name, defaultValue) {
  const re = new RegExp('.*[?&]' + name + '=([^&#]*)'),
    match = document.location.href.match(re);

  if (match) {
    return decodeURIComponent(match[1]);
  }

  return defaultValue;
}

function getRegionFromLocale() {
  const locale = navigator.language;
  let region = 'NA'; // default region

  if (locale) {
    const localeRegion = locale.split('_')[1];

    if (localeRegion) {
      switch (localeRegion) {
        case 'US':
        case 'CA':
        case 'MX':
          region = 'NA';
          break;
        case 'GB':
        case 'FR':
        case 'DE':
          region = 'EU';
          break;
        case 'CN':
        case 'JP':
        case 'KR':
          region = 'AS';
          break;
      }
    }
  }

  return region;
}


let hb; // Declare hb at a higher scope so it can be accessed in the resize event

function styleShadowRoot(){
  const root = document.getElementById("cloudComputerDiv").shadowRoot.children[0];
  root.children[3].style.filter = "";
  root.removeChild(root.children[1]);
}

async function start(){
  let url = readQueryVariable('url', "www.aptero.co");
  let session = readQueryVariable('session', "");//session_id : for multiplayer frame
  if (!(url.startsWith("http://") || url.startsWith("https://"))) {
    url = "https://" + url;
  }
  const response = await fetch('/computer', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      session: session? session : undefined,
      start_url: url,
      region: getRegionFromLocale(),
      width: window.innerWidth,
      height: window.innerHeight,
      webgl:true,
    })
  });

  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  const data = await response.json();
  const url2 = new URL(window.location.href);
  url2.searchParams.set('session', data.session_id);

  window.history.replaceState({}, '', url2.toString());
  hb = await Hyperbeam(cloudComputerDiv, data.embed_url)

  setInterval(() => {
    hb.ping();
  }, 1000);

  setTimeout(() => {
    styleShadowRoot();
  },1000);
}

window.onresize = () => {
  // When the window is resized, update the size of the Hyperbeam instance
  console.log(window.innerWidth, window.innerHeight);
  hb.resize(window.innerWidth, window.innerHeight);
};

const promise = start();
promise.then(() => {
  console.log("done");
});
promise.catch((err) => {
  console.log(err);
});

/*gotoYouTubeBtn.addEventListener("click", () => {
  hb.tabs.update({ url: "https://youtube.com" }) // Programmatic navigation
})
hb.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.title)
    currentSite.innerText = changeInfo.title // Listen to tab changes
})*/

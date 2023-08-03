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

async function start(){
  let url = readQueryVariable('url', "www.aptero.co");

  const response = await fetch('/computer', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      start_url: url,
      region: getRegionFromLocale(),
      width: window.innerWidth,
      height: window.innerHeight,
    }),
  });

  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  const data = await response.json()
  hb = await Hyperbeam(cloudComputerDiv, data.embed_url)

  setInterval(() => {
    hb.ping();
  }, 1000);
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

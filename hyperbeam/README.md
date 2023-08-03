Get started
The Hyperbeam API is composed of two parts, the Backend API and the Client API.
Backend (NodeJS)
Get your API key from the Hyperbeam Dashboard and set it as process.env.HB_API_KEY.
const express = require('express')
const axios = require('axios')

const app = express()
let computer

// Get a cloud computer object. If no object exists, create it.
app.get('/computer', async (req, res) => {
if (computer) {
res.send(computer)
return
}
const resp = await axios.post('https://engine.hyperbeam.com/v0/vm', {}, {
headers: { 'Authorization': `Bearer ${process.env.HB_API_KEY}` }
})
computer = resp.data
res.send(computer)
})
Frontend (IFrame)
Load the Client SDK from npm or unpkg and embed it in your site.
<div style="font-family: sans-serif">
  <button id="gotoYouTubeBtn">Open Youtube.com</button>
  <p>Current website: <span id="currentSite"></p>
</div>
<div id="cloudComputerDiv" style="height:720px;width:1280px"></div>
<script type="module">
  import Hyperbeam from "https://unpkg.com/@hyperbeam/iframe@latest/dist/index.js"
  const resp = await fetch("/computer")
  const data = await resp.json()
  const hb = await Hyperbeam(cloudComputerDiv, data.embed_url)
  gotoYouTubeBtn.addEventListener("click", () => {
    hb.tabs.update({ url: "https://youtube.com" }) // Programmatic navigation
  })
  hb.tabs.onUpdated.addListener((tabId, changeInfo) => {
    if (changeInfo.title)
      currentSite.innerText = changeInfo.title // Listen to tab changes
  })
</script>

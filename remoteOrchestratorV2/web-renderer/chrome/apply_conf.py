import os
import json

print("URL : "+os.environ.get("URL"))#mandatory
print("MODE : "+os.environ.get("MODE"))#mandatory
print("LANG : "+os.environ.get("LANG"))#mandatory
print("KIOSK_BTN : "+str(os.environ.get("KIOSK_BTN")))
print("EXTENSION_LIST : "+str(os.environ.get("EXTENSION_LIST")))

extMap = {
    "virtual-keyboard":"/home/chrome/.config/google-chrome/chrome-virtual-keyboard-master-updated/",
    "kiosk-button":"/home/chrome/.config/google-chrome/kiosk-button/"
}

activatedExts = []
if os.environ.get("EXTENSION_LIST"):
    extList = '{"exts":'+os.environ.get("EXTENSION_LIST")+'}' #format ["",""]
    jsonData = json.loads(extList)
    activatedExts = jsonData["exts"]
else:
    #fallback deprecated mode Kiosk btn not activated with variable and keyboard activated by default
    if os.environ.get("KIOSK_BTN") == "true":
        activatedExts = ["virtual-keyboard","kiosk-button"]
    else:
        activatedExts = ["virtual-keyboard"]

activatedExtsPath = []
for entry in activatedExts:
    print(entry + " activated")
    activatedExtsPath.append(extMap[entry])

if not activatedExtsPath:
    extStringConf = ""
else:
    extStringConf = "--load-extension="+','.join(activatedExtsPath)

print(extStringConf)

#####################
#apply config
####################
def applySpecificExtConfig(ext):
    if ext == "kiosk-button":
        os.system("sed -i 's,%KIOSK_URL%,'"+os.environ.get("URL")+"',g' /home/chrome/.config/google-chrome/kiosk-button/js/fullScreener.js")

os.system("sed -i 's|%EXT%|'"+extStringConf+"'|g' /app/conf.d/chrome.conf")

for entry in activatedExts:
    applySpecificExtConfig(entry)

os.system("sed -i 's,%URL%,'"+os.environ.get("URL")+"',g' /app/conf.d/chrome.conf")
os.system("sed -i 's,%MODE%,'"+os.environ.get("MODE")+"',g' /app/conf.d/chrome.conf")
#os.system("sed -i 's,%LANG%,'"+os.environ.get("LANG")+"',g' /app/conf.d/chrome.conf")

# local-gen takes time and not that useful
#os.system("sed -i '/"+os.environ.get("LANG")+"/s/^# //g' /etc/locale.gen && locale-gen")

if(os.environ.get("PASSWORD")):
    #change password
    print("password set")
    os.system("x11vnc -storepasswd "+os.environ.get("PASSWORD")+" /root/.vnc/passwd")



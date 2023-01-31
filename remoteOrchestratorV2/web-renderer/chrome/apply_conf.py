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

#display version
f = open('/app/VERSION.TXT', 'r')
file_contents = f.read()
print ("Version : ")
print (file_contents)
f.close()

import re
def findAndReplace(A,B, path):
    source = open(path)
    destination = open(path, 'w')
    for line in source:
        #A = r'MANAGER_ID=\d*'
        #B = r'MANAGER_ID='
        new_line = re.sub(A, B, line)
        destination.write(new_line)

def applySpecificExtConfig(ext):
    if ext == "kiosk-button":
        findAndReplace('%KIOSK_URL%',"'"+os.environ.get("URL")+"'","/home/chrome/.config/google-chrome/kiosk-button/js/fullScreener.js")

findAndReplace('%EXT%',"'"+extStringConf+"'","/app/conf.d/chrome.conf")

for entry in activatedExts:
    applySpecificExtConfig(entry)

findAndReplace('%URL%',"'"+os.environ.get("URL")+"'","/app/conf.d/chrome.conf")
findAndReplace('%MODE%',"'"+os.environ.get("MODE")+"'","/app/conf.d/chrome.conf")
#os.system("sed -i 's,%LANG%,'"+os.environ.get("LANG")+"',g' /app/conf.d/chrome.conf")

# local-gen takes time and not that useful
#os.system("sed -i '/"+os.environ.get("LANG")+"/s/^# //g' /etc/locale.gen && locale-gen")

if(os.environ.get("PASSWORD")):
    #change password
    print("password set")
    os.system("x11vnc -storepasswd "+os.environ.get("PASSWORD")+" /root/.vnc/passwd")



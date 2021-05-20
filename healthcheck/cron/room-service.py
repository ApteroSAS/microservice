import datetime
today = datetime.date.today()
print(str(today))

# Using the requests library:
import requests

def sendok():
    try:
        requests.get("https://hc-ping.com/aff704ca-be58-4a54-9885-32058fa21bfa", timeout=10)
    except requests.RequestException as e:
        # Log ping failure here...
        print("Ping failed: %s" % e)
        
def microserviceRoom():    
    resp = requests.get("https://hub.aptero.co/service/room/room/q2XuoUT", timeout=3)
    return resp.status_code == 200 
    
def alwaysfail():    
    return False 
        
try:
    globalStatus = True
    globalStatus = globalStatus and microserviceRoom()
    #globalStatus = globalStatus and alwaysfail()
    if (globalStatus):
        sendok()
        print("ok")
    else:
        raise Exception("check has failed check log file")
        
except requests.RequestException as e:
    # Log ping failure here...
    print("Ping failed: %s" % e)
    

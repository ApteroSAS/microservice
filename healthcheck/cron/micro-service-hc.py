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

def testGetUrl(url):
    resp = requests.get(url, timeout=3)
    if resp.status_code == 200:
        return True
    else:
        print("url failed:")
        print(url)
        return False

def microserviceRoom():
    return testGetUrl("https://meet.aptero.co/service/room/room/q2XuoUT")

def microserviceLoadBalancer():
    return testGetUrl("https://meet.aptero.co/service/loadbalancer/meta?url=https%3A%2F%2Fmeet.aptero.co%2Fq2XuoUT%2Froom")

def microserviceUser():
    return testGetUrl("https://meet.aptero.co/service/user/get/user/admin@aptero.co")

def alwaysfail():    
    return False 
        
try:
    globalStatus = True
    globalStatus = globalStatus and microserviceRoom()
    globalStatus = globalStatus and microserviceLoadBalancer()
    globalStatus = globalStatus and microserviceUser()
    #globalStatus = globalStatus and alwaysfail()
    if (globalStatus):
        sendok()
        print("ok")
    else:
        raise Exception("check has failed check log file : cat /cron/log/hc-service.log")
        
except requests.RequestException as e:
    # Log ping failure here...
    print("Ping failed: %s" % e)
    

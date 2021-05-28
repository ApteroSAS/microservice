#https://pypi.org/project/k-means-constrained/
from k_means_constrained import KMeansConstrained
import numpy as np
import sys, json
print("log:start computation")
def main():
    params = json.loads(sys.stdin.readline())
    raw = json.loads(sys.stdin.readline())
    X = np.array(raw)
    minSize = min(len(raw),int(params['min']))
    maxSize = min(len(raw),int(params['max']))
    target = max(((minSize+maxSize)/2),params['target'])
    N = int(round(len(raw) / target))
    N = max(N,1)
    if(maxSize * N < len(raw)):
        N = N + 1
    print("log: N:"+str(N)+ " minSize:"+str(minSize)+ " maxSize:"+str(maxSize)+ " X:"+str(len(raw)))
    clf = KMeansConstrained(n_clusters=N,size_min=minSize,size_max=maxSize,random_state=0)
    print(json.dumps(clf.fit_predict(X).tolist()))

main()

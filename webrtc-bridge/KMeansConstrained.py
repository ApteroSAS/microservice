#https://pypi.org/project/k-means-constrained/
from k_means_constrained import KMeansConstrained
import numpy as np
import sys, json

def main():
    params = json.loads(sys.stdin.readline())
    raw = json.loads(sys.stdin.readline())
    X = np.array(raw)
    maxSize = min(len(raw),int(params['max']))
    N = int(len(raw) / ((int(params['min'])+maxSize)/2))
    clf = KMeansConstrained(n_clusters=N,size_min=int(params['min']),size_max=maxSize,random_state=0)
    print(json.dumps(clf.fit_predict(X).tolist()))

main()

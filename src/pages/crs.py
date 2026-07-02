def get(i,j,val,rowPtr,colInd):
   
    
    for k in range(rowPtr[i],rowPtr[i+1]):
        
        if(colInd[k]==j):
            return val[k]
        
    return 0.0

 
val=[10,-2,3,9,3,7,8,7]
    
colInd=[0,4,0,1,5,1,2,3]
rowPtr=[0,2,5]

print(get(0,0,val,rowPtr,colInd))
    

import sys
import heapq

def reduceArray(arr):
  heapq.heapify(arr)
  size = len(arr)
  cost = 0



  while size > 1:
    smallest = heapq.heappop(arr)
    second = heapq.heappop(arr)
    addition = smallest+second
    cost += addition
    heapq.heappush(arr, addition)
    size = len(arr)

  
  return cost



    


# HackerRank standard I/O boilerplate (useful if running standalone)
if __name__ == '__main__':
    input_data = sys.stdin.read().split()
    if input_data:
        n = int(input_data[0])
        arr = [int(x) for x in input_data[1:n+1]]
        result = reduceArray(arr)
        print(result)

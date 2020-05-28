function computeTrend(arg1) { //newleaf trends
 array = arg1.toString().split(",");
  for (i = 0;i < (array.length);i++){
   array[i] = Number(array[i]); 
  }
  
  //spike check
  
  var spikes = 0;
  var spikeProgress = 0;
  
  for (i = 1;i < (array.length);i++){
    if (array[i] > array[i-1]){
      spikeProgress++; 
    }
    if (array[i] < array[i-1] && array[i] > 0){
      if (spikeProgress > 0 && spikeProgress < 3) {
        return "RANDOM";
      }
    }
    if (spikeProgress == 3 && array[i] > 300){
      return "HIGH SPIKE";
    }
    if (spikeProgress == 4 && array[i] > 200){
      return "LOW SPIKE";
    }
    
    if ((array[i] > array[i-1]) && (array[i] > array[i+1])) {
      spikes++;
    }
  }
  
  if (array[1] > array[0] || array[1] > 100 || spikes > 1) 
    return "RANDOM";

  if (spikes == 1)
    return "SPIKING";

    if (spikes == 0) 
    return "DECLINING";
}
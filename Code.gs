// Copyright 2020 Ben Johnson

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

function tPPL(prices,trend) { //TurnipProphet PermaLink
  array = prices.toString().split(","); //turn prices into array
  url="https://turnipprophet.io/?prices="; //set up url
  for (i = 0;i < (array.length);i++) { //sub in prices separated by periods, if empty replace with period
    array[i] = Number(array[i]);
    if (array[i] == "") {
      url += ".";
    }
    url+=array.join(".");
    tr = "";  //append pattern depending on previous trend
    if (trend=="Fluctuating"){
      tr="&pattern=0";
    } else if (trend=="Large Spike") {
      tr="&pattern=1";
    } else if (trend=="Decreasing") {
      tr="&pattern=2";
    } else if (trend=="Small Spike") {
      tr="&pattern=3";
    }
    url+=tr
    return url; //return completed url
  }
}
//the big boi, ACNH turnipprophet immitation code. accept no genuines!
function predict(open,priceData,trendData,previousTrend) {
  var trendNames = ["Fluctuating","Small Spike","Large Spike","Decreasing"]
  var seg=0; //used to increment through day periods
  var range = []; //used for max/min display
  var scaleout = open/100; //used to scale prices
  var tDataBackup = trendData; //used to scale prices
  var probability = [] //array of base probabilites for each trend. previous trends dictate current probabilties.
  if (previousTrend == "Fluctuating") {
    probability = [0.20,0.35,0.30,0.15]      
  } else if (previousTrend == "Small Spike") {
     probability = [0.45,0.15,0.25,0.15]
  } else if (previousTrend == "Large Spike") {
      probability = [0.50,0.25,0.05,0.20]
  } else if (previousTrend == "Decreasing") {
      probability = [0.25,0.25,0.45,0.05]
  } else {
      probability = [0.346,0.259,0.247,0.148] //if unknown, use an averaged probability
  } 
  priceData=priceData.toString().split(","); //store prices in array
  var originalPrices = Array.from(priceData) //make a copy of the original prices
  originalPrices.unshift("-1") //i dont think this gets used anymore.
  for (var item in priceData) { 
    priceData[item] = (Number(priceData[item])/open)*100; //scale prices to match trend data
  }
  var priceSeq = []                           
  for (var index in priceData) {
    var item = priceData[index]; //for each price 
    for (var row=0;row<trendData.length;row++) { //check each trend to see if the price matches it. if it doesnt, remove it from the list of possible trends
      if (Math.floor(Number(item)) == 0){break;} 
      if (Math.floor(Number(item))<Math.floor(Number(trendData[row][seg].split(",")[0])) || Math.floor(Number(item))>Math.floor(Number(trendData[row][seg].split(",")[1]))){
        trendData.splice(row,1);
        row--;
      }
    }
    if (priceData[index]) {priceSeq.push([seg,priceData[index]])}
    range[seg] = [660,0]; //set up part of range
    seg++;
  }
  
  /*
  this part counts how many of each trend type you have
  this was because it originally only displayed how many of each trend your data matched to, 
  but it was later repurposed to be used in calculating the percentages by virtue of telling us whether we match a type of trend or not.
  */
  var tCount =[0,0,0,0];
  for (var item in trendData) {
    if (trendData[item][12] == "Fluctuating") {
      tCount[0]++;
    }
    if (trendData[item][12] == "Large Spike") {
      tCount[2]++;
    }
    if (trendData[item][12] == "Decreasing") {
      tCount[3]++;
    }
    if (trendData[item][12] == "Small Spike") {
      tCount[1]++;
    }
  }
  
  if (trendData.length == 0){return "No matching trend found. Please check your prices.";} //Trend list should never end up empty. If trend list is empty, you fucked up your prices.
  for (var i in trendData){ //this part goes through the remaining trends and finds the minimum and maximum for each segment, then scales it to your price and saves it into range
    row=trendData[i];
    for (var j = 0;j<12;j++) {
      var piece = row[j];
      if (Number(range[j][0]) > Number(row[j].split(",")[0])){ //minimums
        range[j][0] = Math.floor(Number(row[j].split(",")[0])*scaleout);
        
      }
      if (Number(range[j][1]) < Number(row[j].split(",")[1])) { //maximums
        range[j][1] = Math.floor(Number(row[j].split(",")[1])*scaleout);
      }
    }
  }
  /*
  var lastPrice = 0  
  var priceIndex = 1
  for (var i in originalPrices) {
    if (i > 0) {
      if (tCount[0] == 0 && Number(originalPrices[i] > 0)) {
        lastPrice = Number(originalPrices[i])
        priceIndex = 1
        range[i][0] = Number(originalPrices[i]) - 5
      } else if (tCount[0] == 0 && i < 12) {
        //return lastPrice
        range[i][0] = lastPrice - (5*priceIndex)
      }
      priceIndex++
    }
  }
  */
  
  
  for (var c in range){ //this part just merges some data to display in the cells properly
    range[c] = range[c][0] + "-" + range[c][1];
  }

  
  //this mostly works but breaks in certain situations. but in general, if a price drops by 3 it cant be fluctating, if it drops by 6+ it has to be fluctuating
  for (item in priceSeq) { 
    if (tCount[0] == 0 || tCount[1]+tCount[2]+tCount[3] == 0 ){break}
    if (item > 0) { //dont operate on the first one, dingus. theres no previous price
      var dif = priceSeq[item-1][1] - priceSeq[item][1] //find differences between previous price and current price
      var segs = priceSeq[item][0] - priceSeq[item-1][0]//find how many segs between prices
      if (dif < 4*segs && dif > 0) {
        //return tCount
        tCount[0] = 0 //cant be fluctuating
      }
      else if (dif > 5*segs && dif < 11*segs && tCount[1] > 0 ) {
        tCount[1] = tCount[2] = tCount[3] = 0 //cant be anything but fluctuating
      }
    }    
  }
  
  //this part goes through the remaining trends and displays what types of trends you could have
  var pattern = ""
  var pArray = []
  for (item in tCount) {
    if (tCount[item] > 0) {
      pArray.push(trendNames[item])
    }
  }
  pattern = pArray.join("/"); //mash it together for single cell display  
  
 //this is the percentage calculation. it calcs the chance of a certain price showing up in your possible trends and then scales them to 100%
  var tRanges = [2380,400,35,5]
  if (trendData.length < 72) {
    for (item in tCount){
      probability[item] *= tCount[item]/tRanges[item]
    }
    var pTotal = probability[0]+probability[1]+probability[2]+probability[3]
    for (item in probability) {
      probability[item] /= pTotal
    }
  }
  for (item in probability) {
    probability[item] = Math.floor(probability[item].toFixed(2) *100) //round shit off otherwise you get big ass doubles.
  }
  //var matches = tCount.join("-"); //mash it together for single cell display
  var probs = probability.join("-")
  
  range.push(pattern) //add the pattern possibilites to the end of the range array
  range.unshift(probs) //add the pattern counts to the start of the range array 
  //this shit is so it displays across in one row instead of down in a column
  var fin = []
  fin[0] = range;
  return fin;
}
//the big boi, ACNH turnipprophet immitation code. accept no genuines!
function predict2(open,priceData,trendData,previousTrend) {
  var trendNames = ["Fluctuating","Small Spike","Large Spike","Decreasing"]
  var seg=0; //used to increment through day periods
  var range = []; //used for max/min display
  var scaleout = open/100; //used to scale prices
  var tDataBackup = trendData; //used to scale prices
  var probability = []
  if (previousTrend == "Fluctuating") {
    probability = [0.20,0.35,0.30,0.15]      
  } else if (previousTrend == "Small Spike") {
     probability = [0.45,0.15,0.25,0.15]
  } else if (previousTrend == "Large Spike") {
      probability = [0.50,0.25,0.05,0.20]
  } else if (previousTrend == "Decreasing") {
      probability = [0.25,0.25,0.45,0.05]
  } else {
      probability = [0.346,0.259,0.247,0.148]
  }
  priceData=priceData.toString().split(","); //store prices in array
  var originalPrices = Array.from(priceData) //make a copy of the original prices
  originalPrices.unshift("-1")
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
  
  //this part counts how many of each trend type you have
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
  
  for (var c in range){ //this part just merges some data to display in the cells properly
    range[c] = range[c][0] + "-" + range[c][1];
  }

  
  for (item in priceSeq) {
    if (tCount[0] == 0 || tCount[1]+tCount[2]+tCount[3] == 0 ){break}
    if (item > 0) { //dont operate on the first one, dingus. theres no previous price
      var dif = Math.abs(priceSeq[item-1][1] - priceSeq[item][1]) //find differences between previous price and current price
      var segs = priceSeq[item][0] - priceSeq[item-1][0]//find how many segs between prices
      if (dif < 4*segs) {
        //return tCount
        tCount[0] = 0 //cant be fluctuating
      }
      else if (dif > 5*segs && dif < 11*segs ) {
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
    probability[item] = Math.floor(probability[item].toFixed(2) *100)
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
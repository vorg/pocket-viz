var items   = require('./items.json');
var fs      = require('fs');
var d3_path = require('d3-path');
var moment  = require('moment');

//pathElement.setAttribute("d", context.toString());

  //console.log(ids.length);

var addedByDay = {};
var addedDays = [];
var readByDay = {};
var readDays = [];

for(var i=0; i<items.length; i++) {
    var item = items[i];
    var added = new Date(item.time_added*1000)
    var year = added.getFullYear();
    var month = added.getMonth() + 1;
    var date = added.getDate();
    if (month < 10) month = '0' +month;
    if (date < 10) date = '0' +date;
    var read = item.time_read > 0;
    var day = year + '-' + month + '-' + date;
    //if (i == 120) console.log(item);
    //if (i == 120) console.log(year, month, date, read);
    if (!addedByDay[day]) {
      var o = { day: day, count: 0 };
      addedByDay[day] = o;
      addedDays.push(o);
    }
    addedByDay[day].count++;
    if (read) {
      if (!readByDay[day]) {
        var o = { day: day, count: 0 };
        readByDay[day] = o;
        readDays.push(o);
      }
      readByDay[day].count++;
    }
};

addedDays.sort(function(a, b) {
    if (a.day < b.day) return -1;
    if (a.day > b.day) return 1;
    if (a.day == b.day) return 0;
})
readDays.sort(function(a, b) {
    if (a.day < b.day) return -1;
    if (a.day > b.day) return 1;
    if (a.day == b.day) return 0;
})

var startDate = moment(addedDays[0].day);
var endDate = moment(new Date(Math.max(
    moment(addedDays[addedDays.length-1].day).toDate().getTime(),
    moment(readDays[readDays.length-1].day).toDate().getTime()
)));


console.log(addedDays[0].day, addedDays[addedDays.length-1].day)
console.log(readDays[0].day, readDays[readDays.length-1].day)

var totalDays = endDate.diff(startDate, 'days');
var articleCount = items.length;


var w = 800;
var h = 500;
var m = 50;

var addedPath = d3_path.path();
addedPath.moveTo(m, h-m);
var addedTotal = 0;
var ax, ay;
addedDays.forEach(function(date) {
    var diffDays = moment(date.day).diff(startDate, 'days');
    addedTotal += date.count;

    ax = m + diffDays / totalDays * (w - 2 * m);
    ay = h - addedTotal/articleCount * (h - 2 * m) - m;

    addedPath.lineTo(ax, ay);
})

var readPath = d3_path.path();
readPath.moveTo(m, h-m);
var readTotal = 0;
var rx, ry;
readDays.forEach(function(date) {
    var diffDays = moment(date.day).diff(startDate, 'days');
    readTotal += date.count;

    rx = m + diffDays / totalDays * (w - 2 * m);
    ry = h - readTotal/articleCount * (h - 2 * m) - m;

    readPath.lineTo(rx, ry);
})

var svg = '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="'+w+'" height="'+h+'">\n';
svg += '<path d="'+addedPath.toString()+'" stroke="#E9265E" stroke-width="2" fill="none" />\n';
svg += '<path d="'+readPath.toString()+'" stroke="#9BC854" stroke-width="2" fill="none" />\n';
svg += '<text x="' + (m) + '" y="' + (m) + '" fill="black" style="text-anchor: start; font-family: Arial; font-size: 32px;">Pocket articles</text>\n';
svg += '<text x="' + (ax - 0) + '" y="' + (ay - 10) + '" fill="#E9265E" style="text-anchor: end; font-family: Arial; font-size: 24px">Added ' + addedTotal + '</text>\n';
svg += '<text x="' + (rx - 0) + '" y="' + (ry - 10) + '" fill="#9BC854" style="text-anchor: end; font-family: Arial; font-size: 24px">Read ' + readTotal + '</text>\n';
svg += '<line x1="' + (m) + '" y1="' + (h - m + 2) + '" x2="' + (w - m) + '" y2="' + (h - m + 2) + '" stroke="#666"/>\n';
svg += '<text x="' + (m) + '" y="' + (h-m/2) + '" fill="#666" style="text-anchor: start; font-family: Arial; font-size: 16px;">'+startDate.format('YYYY-MM-DD')+'</text>\n';
svg += '<text x="' + (w-m) + '" y="' + (h-m/2) + '" fill="#666" style="text-anchor: end; font-family: Arial; font-size: 16px;">'+endDate.format('YYYY-MM-DD')+'</text>\n';
svg += '</svg>\n'

fs.writeFileSync(__dirname + '/pocket-viz.svg', svg);

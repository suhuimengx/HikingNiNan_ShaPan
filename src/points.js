var RodeArray = [
    [118.958233, 32.129368], //宿舍区0   0
    [118.967152, 32.115939], //南门      1
    [118.969093, 32.117235], //行政南楼  2
    [118.967116, 32.118837], //图书馆    3
    [118.965225, 32.116791], //教学楼    4
    [118.962791, 32.116463], //实验楼    5
    [118.962081, 32.117877], //体育馆    6
    [118.96492 , 32.118603], //活动中心  7
    [118.961543, 32.119081], //宿舍区1   8
    [118.960963, 32.120305], //宿舍区2   9
    [118.963047, 32.119632], //快递中心  10
    [118.960393, 32.121356], //校医院    11
    [118.961839, 32.121914], //九食堂    12
    [118.961327, 32.122923], //气象楼    13
    [118.959485, 32.123668], //环境学院  14
    [118.967391, 32.121562], //信息中心  15
    [118.965392, 32.121524], //游泳馆    16
    [118.968783, 32.119143], //美术馆    17
    [118.96956 , 32.121715], //宿舍区3   18
    [118.963739, 32.122174], //宿舍区4   19
    [118.96267 , 32.12337 ], //宿舍区5   20
    [118.960415, 32.125438], //医学院    21
    [118.960375, 32.128118], //建设银行  22
    [118.963115, 32.126012]  //现工院    23
]

//创建点数组
var PointSets = [
    new BMapGL.Point(RodeArray[0 ][0], RodeArray[0 ][1]),       //宿舍区0   0
    new BMapGL.Point(RodeArray[1 ][0], RodeArray[1 ][1]),     //南门      1
    new BMapGL.Point(RodeArray[2 ][0], RodeArray[2 ][1]),     //行政南楼  2
    new BMapGL.Point(RodeArray[3 ][0], RodeArray[3 ][1]),     //图书馆    3
    new BMapGL.Point(RodeArray[4 ][0], RodeArray[4 ][1]),     //教学楼    4
    new BMapGL.Point(RodeArray[5 ][0], RodeArray[5 ][1]),     //实验楼    5
    new BMapGL.Point(RodeArray[6 ][0], RodeArray[6 ][1]),     //体育馆    6
    new BMapGL.Point(RodeArray[7 ][0], RodeArray[7 ][1]),     //活动中心  7
    new BMapGL.Point(RodeArray[8 ][0], RodeArray[8 ][1]),     //宿舍区1   8
    new BMapGL.Point(RodeArray[9 ][0], RodeArray[9 ][1]),     //宿舍区2   9
    new BMapGL.Point(RodeArray[10][0], RodeArray[10][1]),     //快递中心  10
    new BMapGL.Point(RodeArray[11][0], RodeArray[11][1]),     //校医院    11
    new BMapGL.Point(RodeArray[12][0], RodeArray[12][1]),     //九食堂    12
    new BMapGL.Point(RodeArray[13][0], RodeArray[13][1]),     //气象楼    13
    new BMapGL.Point(RodeArray[14][0], RodeArray[14][1]),     //环境学院  14
    new BMapGL.Point(RodeArray[15][0], RodeArray[15][1]),     //信息中心  15
    new BMapGL.Point(RodeArray[16][0], RodeArray[16][1]),     //游泳馆    16
    new BMapGL.Point(RodeArray[17][0], RodeArray[17][1]),     //美术馆    17
    new BMapGL.Point(RodeArray[18][0], RodeArray[18][1]),     //宿舍区3   18
    new BMapGL.Point(RodeArray[19][0], RodeArray[19][1]),     //宿舍区4   19
    new BMapGL.Point(RodeArray[20][0], RodeArray[20][1]),     //宿舍区5   20
    new BMapGL.Point(RodeArray[21][0], RodeArray[21][1]),     //医学院    21
    new BMapGL.Point(RodeArray[22][0], RodeArray[22][1]),     //建设银行  22
    new BMapGL.Point(RodeArray[23][0], RodeArray[23][1]),     //现工院    23
    
]
// console.log(PointSets.length);

//创建标记点
var MarkerSets = [];
for (let point of PointSets) {
    MarkerSets.push(new BMapGL.Marker(point));
}

//创建标签集
var LabelSets = [];
for(let i=0; i<PointSets.length; i++){
    LabelSets.push(new BMapGL.Label(i,{
        position:PointSets[i],
        offset:new BMapGL.Size(-8,-23)
    }));
}
for (let label of LabelSets){
    label.setStyle({
        color: '#000',
        fontSize: '1px',
        backgroundColor: '#ff001a',
        opacity:0.4
    })
}

export {
    RodeArray,
    PointSets,
    MarkerSets,
    LabelSets
}



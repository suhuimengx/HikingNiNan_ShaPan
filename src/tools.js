/**
 * brief:根据距离获取两个坐标点中间的路径点
 * @param prevPoint 起点，{lat: 32.119015805344lng: 118.96139314057}对象
 * @param newPoint 终点
 * @param num      中间点数量
 * @return stepPoints 路径的中间节点, 类型为BMapGL.Point对象
 * attention：东北方向为lng和lat的增大方向
 */
export function getPoints(prevPoint, newPoint, num) {
    var dlat; //纬度增量
    var dlng; //经度增量
    var stepPoints = [];

    dlat = (newPoint.lat - prevPoint.lat) / (num + 1);
    dlng = (newPoint.lng - prevPoint.lng) / (num + 1);
    stepPoints[0] = prevPoint;
    for (let i = 1; i < num; i++) {
        let new_lng = prevPoint.lng + dlng * i;
        let new_lat = prevPoint.lat + dlat * i;
        stepPoints.push(new BMapGL.Point(new_lng, new_lat));
    }
    return stepPoints
}

/**
 * @brief: 根据关键转弯点估算出全部中间节点
 * @param {关键转弯点} stepArray 
 * @param {点分布m/s} distribution 
 * @param {起点} start 
 * @param {终点} end 
 * @returns 
 */
export function GetSteps(stepArray, distribution, start, end) {
    let stepPoints = []
    let prevPoint = start
    for (let i = 0; i < stepArray.length; i++) {
        let step = stepArray[i]
        let num = Math.round(step._distance / distribution)
        let temp = i < (stepArray.length - 1) ? stepArray[i + 1]._point : end
        console.log(step._description, temp)
        let newGroup = getPoints(prevPoint, temp, num)
        // console.log(newGroup.length)
        //将中间点push到步径数组
        Array.prototype.push.apply(stepPoints, newGroup)
        prevPoint = temp  //更新起始位置
    }
    return stepPoints
}

/**
 * @abstract 展示车里行驶轨迹
 * @param {路径数组} stepPoints 
 * @param {小车id} car_id 
 * @param {Bmap对象}  map
 * @param {图标刷新的频率}  freq
 */
export function DriveCar(stepPoints, car_id, map, freq) {
    let index = 0
    let car_address
    switch (car_id) {
        case 1:
            car_address = "src/assets/bus1.png"
            break
        case 2:
            car_address = "src/assets/bus2.png"
            break
        default:
            car_address = "src/assets/bus1.png"
            break;
    }
    let icon = new BMapGL.Icon(car_address, new BMapGL.Size(25, 25))
    let MarkerCar = new BMapGL.Marker(stepPoints[0], { icon: icon });
    map.addOverlay(MarkerCar);
    let CarInterval = setInterval(() => {
        MarkerCar.setPosition(stepPoints[index])
        index++
        if (index >= stepPoints.length) {
            clearInterval(CarInterval)
            console.log("定时结束")
        }
    }, Math.round(1000 / freq));
}

export function ComputeRotation(prevPoint, newPoint, map) {
    var prevPixel = map.pointToPixel(prevPoint)
    var newPixel = map.pointToPixel(newPoint)
    var dy = newPixel.y - prevPixel.y
    var dx = newPixel.x - prevPixel.x
    var angle = Math.atan2(dy, dx)
    if (0 <= angle && angle <= 90) {
        return (90 - angle)
    }
    if (-180 <= angle && angle < 0) {
        return (-angle + 90)
    }
    if (90 < angle && angle <= 180) {
        return (450 - angle)
    }
}

export function MoveMapCenter(marker1, marker2, marker3) {
    var lng1 = marker1.getPosition().lng, lng2 = marker2.getPosition().lng, lng3 = marker3.getPosition().lng
    var lat1 = marker1.getPosition().lat, lat2 = marker2.getPosition().lat, lat3 = marker3.getPosition().lat
    var centerPoint = new BMapGL.Point((lng1 + lng2 + lng3) / 3, (lat1 + lat2 + lat3) / 3)
    return centerPoint
}

/****************执行路径*******************/
// const GetRiding1 = () => {
//     //注意！路径规划是异步执行的，所以逻辑需要在回调中实现
//     const walking1 = new BMapGL.WalkingRoute(map, {
//         onSearchComplete: (res) => {
//             let routes = res.getPlan(0)._routes[0]
//             //获取关键转弯点
//             stepArray1 = routes._steps
//             //获取全部中间点
//             routeArray1 = routes._points
//             //百度api的数据获取完成，阔以开始运动了
//             flag1 = true
//         }
//     })
//     var start = PointSets[2];
//     var end = PointSets[9];
//     walking1.search(start, end);
//     let stepPoints = []
//     if (flag1) {
//         console.log(stepArray1)
//         let speed = 50; //速度   m/s
//         let freq = 5;   //点频率 点/s
//         let distribution = Math.round(speed / freq)  //点分布 m/点
//         /*************获取路径点********************/
//         stepPoints = GetSteps(stepArray1, distribution, start, end)
//         console.log(stepPoints)
//         //获取路径点后，运行车辆
//         DriveCar(stepPoints, 1, map, freq)
//     }
// }
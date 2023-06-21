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

    dlat = (newPoint.lat - prevPoint.lat) / num;
    dlng = (newPoint.lng - prevPoint.lng) / num;
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
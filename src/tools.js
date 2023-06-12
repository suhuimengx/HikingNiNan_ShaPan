/**
 * brief:根据距离获取两个坐标点中间的路径点
 * @param prevPoint 起点，{lat: 32.119015805344lng: 118.96139314057}对象
 * @param newPoint 终点
 * @param num      中间点数量
 * @return stepPoints 路径的中间节点, 类型为BMapGL.Point对象
 * attention：东北方向为lng和lat的增大方向
 */
export default function getPoints(prevPoint, newPoint,num) {
    var dlat; //纬度增量
    var dlng; //经度增量
    var stepPoints = [];

    dlat = (newPoint.lat - prevPoint.lat) / num;
    dlng = (newPoint.lng - prevPoint.lng) / num;
    stepPoints[0] = prevPoint;
    for (let i = 1; i < num ; i++) {
        let new_lng = prevPoint.lng + dlng * i;
        let new_lat = prevPoint.lat + dlat * i;
        stepPoints.push(new BMapGL.Point(new_lng, new_lat));
    }
    return stepPoints
}
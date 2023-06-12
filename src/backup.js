//仅供存储注释代码

onPolylinesSet: () => {
    console.log("开始移动")
    var MarkerCar = new BMapGL.Marker(PointSets[8]);
    map.addOverlay(MarkerCar);
    let index = 0;
    if (index < routeArray.length) {
        setInterval(() => {
            MarkerCar.setPosition(new BMapGL.Point(routeArray[index].lng, routeArray[index].lat));  //将标点移动到路径点上
            index++;
            console.log(index);
        }, 200)
    }
}
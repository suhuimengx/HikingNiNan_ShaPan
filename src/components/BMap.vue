<template>
    <p v-if="data">data1:{{ data.previousData }}</p>
    <button style="position: relative;" @click="GetData">按我按我</button>
    <button @click="GetRiding">出发</button>
    <div id="allmap"></div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { RodeArray, PointSets, MarkerSets, LabelSets } from "../points.js"
import getPoints from "../tools.js"
import axios from 'axios'

var map = null
//创建规划对象
var routeArray = null   //全部中间节点
var stepArray = null      //step对象数组
var flag = false

/****************执行路径*******************/
const GetRiding = () => {
    //注意！路径规划是异步执行的，所以逻辑需要在回调中实现
    const walking = new BMapGL.WalkingRoute(map, {
        // renderOptions: {
        //     map: map,
        //     autoViewport: true
        // },
        onSearchComplete: (res) => {
            let routes = res.getPlan(0)._routes[0]
            //获取关键转弯点
            stepArray = routes._steps
            //获取全部中间点
            routeArray = routes._points
            //百度api的数据获取完成，阔以开始运动了
            flag = true
        }
    })
    var start = PointSets[8];
    var end = PointSets[14];
    walking.search(start, end);
    var stepPoints = []
    if (flag) {
        console.log(stepArray)
        let speed = 50; //速度   m/s
        let freq = 5;   //点频率 点/s
        let distribution = Math.round(speed / freq)  //点分布 m/点
        let prevPoint = start //起点
        for (let i = 0; i < stepArray.length; i++) {
            let step = stepArray[i]
            let temp =i< (stepArray.length-1) ? stepArray[i+1]._point : end
            // let temp = new BMapGL.Point(step._point.lng, step._point.lat)
            console.log(step._description,temp)
            let num = Math.round(step._distance / distribution)
            let newGroup = getPoints(prevPoint, temp, num)
            console.log(newGroup.length)
            //将中间点push到步径数组
            Array.prototype.push.apply(stepPoints, newGroup)
            prevPoint = temp  //更新起始位置
        }
        console.log(stepPoints)
        //获取路径点后，运行车辆
        var index = 0
        var MarkerCar = new BMapGL.Marker(stepPoints[0]);
        map.addOverlay(MarkerCar);
        var CarInterval = setInterval(() => {
            MarkerCar.setPosition(stepPoints[index])
            index++
            if (index >= stepPoints.length) {
                clearInterval(CarInterval)
                console.log("定时结束")
            }
        }, Math.round(1000/freq));

    }

}
/*****************后端交互************* */
const data = ref(null)
const GetData = () => {
    axios.get("http://127.0.0.1:5000/getdata").then(res => {
        data.value = res.data
        console.log(res)
    }).catch(error => {
        console.error('Error:', error)
    })
}
onMounted(() => {
    //初始化地图
    map = new BMapGL.Map("allmap")
    map.enableScrollWheelZoom();
    map.centerAndZoom(new BMapGL.Point(118.966003, 32.121746), 18);
    // map.setHeading(90);
    map.setTilt(40);
    // //显示点标记
    // for (let marker of MarkerSets) {
    //     map.addOverlay(marker);
    // }
    //显示标签
    for (let label of LabelSets) {
        map.addOverlay(label);
    }

})
</script>

<style>
#allmap {
    width: 100%;
    height: 100%;
    position: relative;
    z-index: 10;
    /* overflow: hidden; */
}
</style>
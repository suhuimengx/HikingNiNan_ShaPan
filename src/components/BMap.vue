<template>
    <div class="common-layout">
        <el-container>
            <el-aside width="15vh">
                <button @click="GetRiding1">1出发</button>
                <button @click="GetRiding2">2出发</button>
                <button @click="GetLocation">华为云测试</button>
            </el-aside>
            <el-container style="padding-top: 0%;">
                <el-main style="height:90vh;">
                    <div id="allmap" style="width: 100%;height: 100%;position: relative;"></div>
                </el-main>
                <el-footer>
                    <el-progress :percentage="percentage" :stroke-width="12" striped striped-flow>
                        <span>time</span>
                    </el-progress>
                </el-footer>
            </el-container>
        </el-container>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { RodeArray, PointSets, MarkerSets, LabelSets } from "../points.js"
import { getPoints, GetSteps, DriveCar } from "../tools.js"
import axios from 'axios'

const percentage = ref(10)

var map = null
//创建规划对象
var routeArray1 = null   //全部中间节点
var stepArray1 = null    //step对象数组
var flag1 = false
//创建规划对象
var routeArray2 = null   //全部中间节点
var stepArray2 = null    //step对象数组
var flag2 = false


/****************执行路径*******************/
const GetRiding1 = () => {
    //注意！路径规划是异步执行的，所以逻辑需要在回调中实现
    const walking1 = new BMapGL.WalkingRoute(map, {
        onSearchComplete: (res) => {
            let routes = res.getPlan(0)._routes[0]
            //获取关键转弯点
            stepArray1 = routes._steps
            //获取全部中间点
            routeArray1 = routes._points
            //百度api的数据获取完成，阔以开始运动了
            flag1 = true
        }
    })
    var start = PointSets[2];
    var end = PointSets[9];
    walking1.search(start, end);
    let stepPoints = []
    if (flag1) {
        console.log(stepArray1)
        let speed = 50; //速度   m/s
        let freq = 5;   //点频率 点/s
        let distribution = Math.round(speed / freq)  //点分布 m/点
        /*************获取路径点********************/
        stepPoints = GetSteps(stepArray1, distribution, start, end)
        console.log(stepPoints)
        //获取路径点后，运行车辆
        DriveCar(stepPoints, 1, map, freq)
    }
}
/****************执行路径*******************/
const GetRiding2 = () => {
    //注意！路径规划是异步执行的，所以逻辑需要在回调中实现
    const walking2 = new BMapGL.WalkingRoute(map, {
        onSearchComplete: (res) => {
            let routes = res.getPlan(0)._routes[0]
            //获取关键转弯点
            stepArray2 = routes._steps
            //获取全部中间点
            routeArray2 = routes._points
            //百度api的数据获取完成，阔以开始运动了
            flag2 = true
        }
    })
    var start = PointSets[18];
    var end = PointSets[19];
    walking2.search(start, end);
    let stepPoints = []
    if (flag2) {
        console.log(stepArray2)
        let speed = 50; //速度   m/s
        let freq = 5;   //点频率 点/s
        let distribution = Math.round(speed / freq)  //点分布 m/点
        /*************获取路径点********************/
        stepPoints = GetSteps(stepArray2, distribution, start, end)
        console.log(stepPoints)
        //获取路径点后，运行车辆
        DriveCar(stepPoints, 2, map, freq)
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
    map.setHeading(90);
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
<template>
    <div class="common-layout">
        <el-container>
            <!-- 左侧部分 -->
            <el-aside width="38vh">
                <div class="test-button">
                    <button @click="SocketConnect">socket connect</button>
                    <button @click="SocketDisconnect">socket disconnect</button>
                    <button @click="GetData">华为云测试</button>
                </div>
                <div class="timeline-container">
                    <el-timeline class="timeline">
                        <el-timeline-item v-for="(activity, index) in activities" :key="index"
                            :timestamp="activity.timestamp">
                            {{ activity.content }}</el-timeline-item>
                    </el-timeline>
                    <el-timeline class="timeline">
                        <el-timeline-item v-for="(activity, index) in activities" :key="index"
                            :timestamp="activity.timestamp">
                            {{ activity.content }}</el-timeline-item>
                    </el-timeline>
                    <el-timeline class="timeline">
                        <el-timeline-item v-for="(activity, index) in activities" :key="index"
                            :timestamp="activity.timestamp">
                            {{ activity.content }}</el-timeline-item>
                    </el-timeline>

                </div>
                <div class="box-card">
                    <el-card>
                        <template #header>
                            <div class="card-header">
                                <span>智慧园区车辆状态</span>
                                <!-- <el-button class="button" text>Operation button</el-button> -->
                            </div>
                        </template>
                        <div>
                            <el-table :data="car_status">
                                <el-table-column prop="car_id" label="车辆编号"></el-table-column>
                                <el-table-column prop="PassengerNum" label="载客量"></el-table-column>
                                <el-table-column prop="TravlledDistance" label="行驶里程"></el-table-column>
                            </el-table>
                        </div>
                    </el-card>
                </div>
                <div id="gdmap" style="width: 100%;height: 40vh;position: relative;"></div>
                <p>{{ real_location }}</p>
            </el-aside>
            <!-- 主体地图部分 -->
            <el-container style="padding-top: 0%;height: 100vh;">
                <el-main>
                    <div id="allmap" style="width: 100%;height: 100%;position: relative;"></div>
                </el-main>
                <!-- 底部时间轴 -->
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
import styleJson from '/src/assets/map_style2.json'
import io from 'socket.io-client'

const percentage = ref(10)
const real_location = ref(0)
var huawei_token = ""

var socket = null
var map = null
var gdmap = null
var marker_gd = null
var passedPolyline = null
var lushu = null
//创建规划对象
var routeArray1 = null   //全部中间节点
var stepArray1 = null    //step对象数组
var flag1 = false
//创建规划对象
var routeArray2 = null   //全部中间节点
var stepArray2 = null    //step对象数组
var flag2 = false

const SocketConnect = () => {
    var icon = new BMapGL.Icon("src/assets/bus1.png", new BMapGL.Size(25, 25))
    var MarkerCar = new BMapGL.Marker(PointSets[0], { icon: icon });
    map.addOverlay(MarkerCar)
    socket = io("http://localhost:5000/")
    socket.on('connect', () => {
        console.log('websocket connected...')
    })
    socket.on('send_message', (res) => {
        var temp_array = res.location_array
        var temp_array_gd = res.location_array_amap
        car_status.value[0].PassengerNum = res.PassengerNum
        console.log(res)
        var duration_gd = 500
        var waitTime = (temp_array_gd.length / 2 * 500) | 0
        marker_gd.moveAlong(temp_array_gd, {
            //每一段的时长
            duration: duration_gd,
            autoRotation: true,
        })
        //车辆运行一半时间后，开始cover乘客图标
        setTimeout(() => {
            var passengerMarker = new AMap.Marker({
                map: gdmap,
                position: temp_array_gd[temp_array_gd.length - 1],
                icon: new AMap.Icon({
                    size: new AMap.Size(32, 32),
                    image: "/src/assets/person.png",
                    imageSize: new AMap.Size(32, 32),
                    imageOffset: new AMap.Pixel(0, 0),
                })
            })
            gdmap.add(passengerMarker)
            setTimeout(() => {
                gdmap.remove(passengerMarker)
            }, waitTime + 600);
        }, waitTime);

    })
    socket.on('send_location', (res) => {
        // console.log(res)
        let prevPoint = MarkerCar.getPosition()
        let lng = res[0], lat = res[1]
        let tempPoint = new BMapGL.Point(lng, lat)
        let patharray = getPoints(prevPoint, tempPoint, 10)
        let index = 1, length = patharray.length
        let smoothTimer = setInterval(() => {
            if (index >= length) {
                clearInterval(smoothTimer)
                MarkerCar.setPosition(tempPoint)
            }
            if (index < length - 1) MarkerCar.setPosition(patharray[index++])
        }, 56);
    })
}
const SocketDisconnect = () => {
    if (socket) {
        socket.disconnect()
    }
    console.log('websocket disconnected...')
}

var activities = [
    {
        content: '接到一位乘客',
        timestamp: '7:30',
    },
    {
        content: '一位乘客下车',
        timestamp: '7:38',
    },
    {
        content: '一位乘客下车',
        timestamp: '7:41',
    },
]
const car_status = ref([
    { car_id: "car_01", PassengerNum: 0, TravlledDistance: 100 },
    { car_id: "car_02", PassengerNum: 0, TravlledDistance: 100 },
    { car_id: "car_03", PassengerNum: 0, TravlledDistance: 100 },
])

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
/*************初始化页面*********** */
onMounted(() => {
    //初始化地图
    map = new BMapGL.Map("allmap")
    map.enableScrollWheelZoom();
    map.centerAndZoom(new BMapGL.Point(118.965069, 32.120852), 19);
    map.setMapStyleV2({
        // styleId:"a480e565a09dfa2adfdbeb6622602504"
        styleJson: styleJson
    })
    map.setHeading(108);
    map.setTilt(34);
    // //显示点标记
    // for (let marker of MarkerSets) {
    //     map.addOverlay(marker);
    // }
    //显示标签
    for (let label of LabelSets) {
        map.addOverlay(label);
    }

    gdmap = new AMap.Map("gdmap", {
        resizeEnable: true,
        center: [118.951742391866, 32.123405409006],
        zoom: 20,
        pitch: 55.94919957310569,
        rotation: -0.7908261543741522,
        viewMode: '3D', //开启3D视图,默认为关闭
        buildingAnimation: true, //楼块出现是否带动画
    })

    passedPolyline = new AMap.Polyline({
        map: gdmap,
        showDir: true,
        strokeColor: "#28F", //线颜色
        strokeWeight: 6, //线宽
    });
    let icon_gd = new AMap.Icon({
        size: new AMap.Size(26, 52),
        image: "https://a.amap.com/jsapi_demos/static/demo-center-v2/car.png",
        imageSize: new AMap.Size(26, 52),
        imageOffset: new AMap.Pixel(0, 0),
    })
    marker_gd = new AMap.Marker({
        map: gdmap,
        // position: new AMap.LngLat(118.951742391866,32.123405409006),
        position: [118.951742391866, 32.123405409006],
        icon: icon_gd,
        offset: new AMap.Pixel(-13, -26),
    });
    gdmap.add(marker_gd)
    marker_gd.on('moving', function (e) {
        passedPolyline.setPath(e.passedPath);
        // 设置地图中心点
        gdmap.setCenter(e.target.getPosition())
        // 设置旋转角
        gdmap.setRotation(-e.target.getOrientation())
    });

    gdmap.setFitView();
    AMap.plugin('AMap.MoveAnimation', () => {
        console.log("动画插件加载完毕")
    })
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

.test-button {
    padding-bottom: 5vh;
}

.timeline-container {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(2, 1fr);
    grid-gap: 10px;
    max-height: 70vh;
    overflow: auto;
}

.timeline {
    /* border: 1px solid #ccc; */
    padding: 4px;

}

.card-header {
    display: flex;
    justify-content: center;
}

.card-content {
    font-size: 14px;
    margin-bottom: 1vh;
}
</style>
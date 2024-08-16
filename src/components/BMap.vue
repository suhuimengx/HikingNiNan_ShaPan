<template>
    <div class="common-layout">
        <el-container>
            <!-- 左侧部分 -->
            <el-aside width="17vh" style="margin-top: 0%;">
                <div class="test-button">
                    <button @click="SocketConnect">connect</button>
                    <button @click="SocketDisconnect">disconnect</button>
                    <button @click="test">reset</button>
                </div>
            </el-aside>
            <!-- 主体地图部分 -->
            <el-container style="padding-top: 0%;height: 100vh;padding-left: 100px;">
                <el-main>
                    <div id="allmap">
                        <div class="car car0" :style="car0style">
                        </div>
                        <div class="car car1" :style="car1style">
                        </div>
                        <div class="passenger_car" v-if="isPassenger0Visible" :class="{ 'blink': isPassenger0Visible }"
                            :style="passenger0style"></div>
                        <div class="passenger_car" v-if="isPassenger1Visible" :class="{ 'blink': isPassenger1Visible }"
                            :style="passenger1style"></div>

                        <div class="passenger" v-if="car0_passenger1" :class="{ 'blink': car0_passenger1 }"
                            :style="car0_passengerStyle1"></div>
                        <div class="passenger" v-if="car0_passenger2" :class="{ 'blink': car0_passenger2 }"
                            :style="car0_passengerStyle2"></div>
                        <div class="passenger" v-if="car1_passenger1" :class="{ 'blink': car1_passenger1 }"
                            :style="car1_passengerStyle1"></div>
                        <div class="passenger" v-if="car1_passenger2" :class="{ 'blink': car1_passenger2 }"
                            :style="car1_passengerStyle2"></div>
                    </div>
                </el-main>
            </el-container>
        </el-container>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElNotification, ElMessage } from 'element-plus'
import io from 'socket.io-client'

const percentage = ref(0)
const real_time = ref("7:20:00")

var socket = null
var MarkerCar_01 = null
var MarkerCar_02 = null
var insert1_flag = true
var insert2_flag = true

const SocketDisconnect = () => {
    if (socket) {
        socket.disconnect()
    }
    console.log('websocket disconnected...')
}

const test = () => {
    let carId = 1;
    let end_id = 12;
    let point_position = realTimeOrder_Position[end_id];
    if (carId == 0) {
        passenger0style.value.left = point_position[0] + 'px';
        passenger0style.value.top = point_position[1] + 'px';
        // 开始闪烁乘客图标
        isPassenger0Visible.value = true;
        // 3s后停止闪烁
        setTimeout(() => {
            isPassenger0Visible.value = false;
        }, 3000);
    }
    else if (carId == 1) {
        passenger1style.value.left = point_position[0] + 'px';
        passenger1style.value.top = point_position[1] + 'px';
        // 开始闪烁乘客图标
        isPassenger1Visible.value = true;
        // 3s后停止闪烁
        setTimeout(() => {
            isPassenger1Visible.value = false;
        }, 3000);
    }
}


//上车点的坐标
const realTimeOrder_Position = [
    [0, 0],      //[y,x]
    //[35, 485],   //1号点
    //[192, 547],  //2号点
    //[170, 397],  //3号点
    //[171, 335],  //4号点
    //[21, 386],   //5号点
    //[68, 21],    //6号点
    //[382, 22],   //7号点
    //[170, 21],   //8号点
    //[217, 330],  //9号点
    //[547, 228],  //10号点
    //[306, 547],  //11号点
    //[547, 547],  //12号点

    [494, -16],   //1号点
    [555, 177],  //2号点
    [484, 177],  //3号点
    [341, 127],  //4号点
    [396, -47],   //5号点
    [39, -44],    //6号点
    [75, 267],   //7号点
    [-39, 145],   //8号点
    [326, 150],  //9号点
    [282, 519],  //10号点
    [530, 324],  //11号点
    [589, 521],  //12号点
]

const car0_passengerStyle1 = ref({
    left: '0px',
    top: '0px',
})
const car0_passengerStyle2 = ref({
    left: '0px',
    top: '0px',
})
const car1_passengerStyle1 = ref({
    left: '0px',
    top: '0px',
})
const car1_passengerStyle2 = ref({
    left: '0px',
    top: '0px',
})

const passenger0style = ref({
    left: '0px',
    top: '0px',
})
const passenger1style = ref({
    left: '0px',
    top: '0px',
})

const car0_position = ref({
    pos_y: 80,
    pos_x: 547,
})
const car1_position = ref({
    pos_y: 300,
    pos_x: 22,
})

const car0_passenger1 = ref(false)
const car0_passenger2 = ref(false)
const car1_passenger1 = ref(false)
const car1_passenger2 = ref(false)

const isPassenger0Visible = ref(false)
const isPassenger1Visible = ref(false)


const reset = () => {
    car0_passenger1.value = false;
    car0_passenger2.value = false;
    car1_passenger1.value = false;
    car1_passenger2.value = false;
}

/*计算属性实时更新车辆位置*/
const car0style = computed(() => {
    return {
        left: `${car0_position.value.pos_y - 12}px`,
        top: `${car0_position.value.pos_x - 12}px`,
    }
})
const car1style = computed(() => {
    return {
        left: `${car1_position.value.pos_y - 12}px`,
        top: `${car1_position.value.pos_x - 12}px`,
    }
})

const getDistance = (x1, y1, x2, y2) => {
    var dx = x2 - x1;
    var dy = y2 - y1;
    var distance = Math.sqrt(dx * dx + dy * dy);
    return distance;
}

/* 与python后台服务 */
const SocketConnect = () => {
    socket = io("http://localhost:5000/")
    socket.on('connect', () => {
        console.log('websocket connected...')
    })
    /**检测乘客上下车动作 */
    socket.on('send_message_arrive', (res) => {
        console.log(res)
        let carId = res.car_id;
        let end_id = res.arrive_id;
        let point_position = realTimeOrder_Position[end_id];
        if (carId == 0) {
            passenger0style.value.left = point_position[0] + 'px';
            passenger0style.value.top = point_position[1] + 'px';
            // 开始闪烁乘客图标
            isPassenger0Visible.value = true;
            // 3s后停止闪烁
            setTimeout(() => {
                isPassenger0Visible.value = false;
            }, 4000);
        }
        else if (carId == 1) {
            passenger1style.value.left = point_position[0] + 'px';
            passenger1style.value.top = point_position[1] + 'px';
            // 开始闪烁乘客图标
            isPassenger1Visible.value = true;
            // 3s后停止闪烁
            setTimeout(() => {
                isPassenger1Visible.value = false;
            }, 4000);
        }

    })
    /**监测并显示实时订单 */
    socket.on('send_message_realTimeOrder', (res) => {
        console.log(res);
        let carId = res.car_id;
        let text = `一个实时订单分配给${carId}号小车`;
        let start_id = res.originId;
        let end_id = res.destId;
        ElMessage({
            message: text,
            type: 'warning',
            offset: 400,
            center: true,
            duration: 8000,
        })
        // 在实时订单上下车点显示乘客图标
        let start_position = realTimeOrder_Position[start_id]
        let end_position = realTimeOrder_Position[end_id]
        if (carId == 0) {
            car0_passengerStyle1.value.left = start_position[0] + 'px';
            car0_passengerStyle1.value.top = start_position[1] + 'px';
            car0_passengerStyle2.value.left = end_position[0] + 'px';
            car0_passengerStyle2.value.top = end_position[1] + 'px';
            //开始闪烁乘客图标
            car0_passenger1.value = true;
            car0_passenger2.value = true;
            //4s后停止闪烁
            setTimeout(() => {
                car0_passenger1.value = false;
                car0_passenger2.value = false;
            }, 4000);
        }
        else if (carId == 1) {
            car0_passengerStyle1.value.left = start_position[0] + 'px';
            car0_passengerStyle1.value.top = start_position[1] + 'px';
            car0_passengerStyle2.value.left = end_position[0] + 'px';
            car0_passengerStyle2.value.top = end_position[1] + 'px';
            //开始闪烁乘客图标
            car1_passenger1.value = true;
            car1_passenger2.value = true;
            //4s后停止闪烁
            setTimeout(() => {
                car1_passenger1.value = false;
                car1_passenger2.value = false;
            }, 4000);
        }
    })
    /**刷新车辆实时位置 */
    socket.on('send_message_location', (res) => {
        console.log({
            "tagid0": res.id0,
            "tagid1": res.id1,
        })
        /*刷新车辆位置*/
        car0_position.value.pos_x = res.posx0;
        car0_position.value.pos_y = res.posy0;
        car1_position.value.pos_x = res.posx1;
        car1_position.value.pos_y = res.posy1;
    })

}

/*************初始化页面*********** */
onMounted(() => {

})
</script>

<style>
#allmap {
    width: 570px;
    height: 570px;
    /* background-image: url('https://img1.imgtp.com/2023/08/06/W4kfVNW4.svg'); */
    background-image: url('src/assets/map_dis.svg');
    background-repeat: no-repeat;
    background-size: 100% 100%;
    position: relative;
    /* overflow: hidden; */
}


.car-tag {
    display: flex;
    justify-content: space-between;
    margin-left: 15%;
    margin-right: 6%;
    margin-top: 0;
}

.passenger {
    position: absolute;
    background-size: contain;
    width: 35px;
    height: 35px;
    background-image: url("src/assets/hail.png");
}

.passenger_car {
    position: absolute;
    background-size: contain;
    width: 35px;
    height: 35px;
    background-image: url("src/assets/passenger.png");
}

.label {
    position: absolute;
    top: 50%;
    /* 将标签垂直居中 */
    left: 40px;
    /* 调整标签与图标之间的距离 */
    transform: translateY(-50%);
    /* 垂直居中 */
    background-color: #fff;
    padding: 1px 3px;
    border: 1px solid #ccc;
    border-radius: 4px;
    white-space: nowrap;
    /* 防止标语换行 */
}

.car {
    position: absolute;
    width: 36px;
    height: 36px;
    background-size: contain;
}

.car0 {
    background-image: url("src/assets/bus1.png");
}

.car1 {
    background-image: url("src/assets/bus2.png");
}

@keyframes blink {
    0% {
        opacity: 0;
    }

    100% {
        opacity: 1;
    }
}

.blink {
    animation: blink 0.3s alternate infinite;
}

.test-button {
    padding-bottom: 1vh;
}

.timeline-container {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    /* grid-template-rows: repeat(2, 1fr); */
    grid-gap: 8px;
    max-height: 70vh;
    overflow: auto;
}

.timeline {
    /* border: 1px solid #ccc; */
    padding: 3px;

}

.card-header {
    display: flex;
    justify-content: center;
}

.card-content {
    font-size: 14px;
    margin-bottom: 1vh;
}</style>
import axios from 'axios'

var token_data = {
    auth: {
        identity: {
            methods: [
                "password"
            ],
            password: {
                user: {
                    domain: {
                        name: "hw_008618992630121_01"        //IAM用户所属帐号名
                    },
                    name: "yuanyi",             //IAM用户名
                    password: "963852741yy!"      //IAM用户密码
                }
            }
        },
        scope: {
            project: {
                name: "cn-north-4"               //项目名称
            }
        }
    }
}

async function GetToken() {
    try {
        let url = 'https://iam.cn-north-4.myhuaweicloud.com/v3/auth/tokens'
        var res = await axios.post(url, token_data)
        return res.headers["x-subject-token"]
    } catch (error) {
        console.error(error)
    }
}

function GetProduct(token) {
    let config = {
        method: 'get',
        url: 'https://56a997deb6.st1.iotda-app.cn-north-4.myhuaweicloud.com/v5/iot/26b5bd8fed6f4e93949b34c87c81f45a/products',
        headers: {
            'Content-Type': "application/json",
            'X-Auth-Token': token
        },
    }
    axios(config).then((res)=>{
        console.log(JSON.stringify(res.data))
    }).catch((ex)=>{
        console.log(ex)
    })
}

export {GetProduct, GetToken}



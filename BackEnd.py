from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
# 动态解决前段跨域问题
CORS(app,supports_credentials=True)
@app.route('/getdata')
def GetData():
    data = {
        'previousData':3,
        'currentData':5
    }
    return jsonify(data)

if __name__ == '__main__':
    app.run(port=5000)
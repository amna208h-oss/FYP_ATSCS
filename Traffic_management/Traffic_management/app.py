from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})  # Allow cross-origin requests for development



# Example route for traffic data
@app.route('/api/traffic-data', methods=['GET'])
def traffic_data():
    data = {
        "trafficFlow": [50, 70, 100, 80, 60],
        "emergencyVehiclesCount": 2,
        "emergencyVehicles": [
            {"name": "Ambulance 1", "location": "Downtown"},
            {"name": "Ambulance 2", "location": "Main Street"}
        ],
        "incidents": [5, 3, 8, 2]
    }
    return jsonify(data)

if __name__ == '__main__':
    app.run(debug=True)

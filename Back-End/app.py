from flask import Flask, render_template, session, redirect, url_for, jsonify
from flask_cors import CORS, cross_origin
from flask_sqlalchemy import SQLAlchemy
from flask_restful import Api, Resource, reqparse, abort, fields, marshal_with, request
import mysql.connector
import pymysql 
import datetime as dt
import requests

connection= mysql.connector.connect(host='localhost', port='3306',
                                    database='db_locations', user='root',
                                    password='root')

cursor=connection.cursor() 


API_KEY1 = '***API_KEY1***'

def getCoord(address):
    params = {
        'key': API_KEY1,
        'address': address.replace(' ', '+')
    }

    base_url = 'https://maps.googleapis.com/maps/api/geocode/json?'
    response = requests.get(base_url, params=params)
    data = response.json()
    if data['status'] == 'OK':
        result = data['results'][0]
        location = result['geometry']['location']
        return location['lat'], location['lng']
    else:
        return None, None

def getWeath(address):

    API_KEY2 = '906c4cb4a977693045fcd7c0224247cd'
    
    lat, lng=getCoord(address)
    
    params = {
        'appid': API_KEY2,
        'lat': lat,
        'lon':lng,
        'units':'metric'
    }

    base_url = 'http://api.openweathermap.org/data/2.5/weather?'
    response = requests.get(base_url, params=params)
    data = response.json()
    return data



app = Flask(__name__)
cors=CORS(app)
app.secret_key=' super secret key'


app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:root@localhost/db_locations'
db = SQLAlchemy(app)


class User(db.Model):
    id_user = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), nullable=False)
    password = db.Column(db.String(50), nullable=False)
    locations = db.relationship('Location', backref='user', lazy=True)

class Location(db.Model):
    id_location = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id_user'), nullable=False)

    def __init__(self, name, user_id):
        self.name = name
        self.user_id = user_id


with app.app_context():
    db.create_all()
    db.session.commit()



@app.route('/locations/weather/<string:name>', methods=['GET'])
@cross_origin()

def location_weather(name):
    return getWeath(name)
    



@app.route("/login", methods=['POST'])
@cross_origin()
def login():
    username = request.json['username']
    password = request.json['password']

    user = User.query.filter_by(username=username, password=password).first()

    if user:
        return jsonify({'id_user': user.id_user, 'username': user.username})
    else:
        return jsonify({'message': 'User does not exist'})


@app.route('/users', methods=['GET'])
@cross_origin()
def get_users():
    users = User.query.all()

    user_list = []
    for user in users:
        user_data = {
            'id_user': user.id_user,
            'username': user.username,
            'password': user.password
        }
        user_list.append(user_data)

    return jsonify({'users': user_list})



'''
@app.route('/logout')
def logout():
    session.pop('loggedin', None)
    session.pop('id', None)
    session.pop('username', None)
    return render_template('login.html')
'''

@app.route('/locations/<int:user_id>', methods=['GET'])
@cross_origin()
def get_locations(user_id):
    locations = Location.query.filter_by(user_id=user_id).all()

    if not locations:
        return jsonify({'message': 'No locations found for user'})

    location_names = [location.name for location in locations]

    return jsonify({'locations': location_names})



@app.route('/locations/add', methods=['POST'])
@cross_origin()
def add_location():
    name = request.json['name']
    user_id = request.json['user_id']

    existing_location = Location.query.filter_by(name=name, user_id=user_id).first()

    if existing_location:
        return jsonify({'error': 'Location already exists'})

    new_location = Location(name=name, user_id=user_id)

    db.session.add(new_location)
    db.session.commit()

    return jsonify({'message': 'Location added successfully'})


@app.route('/locations/<string:name>/<int:user_id>', methods=['DELETE'])
@cross_origin()

def delete_location(name, user_id):
    location = Location.query.filter_by(name=name, user_id=user_id).first()

    if not location:
        return jsonify({'error': 'Location not found'})

    db.session.delete(location)
    db.session.commit()

    return jsonify({'message': 'Location deleted successfully'})



if __name__ == '__main__':
    app.run(debug=True)

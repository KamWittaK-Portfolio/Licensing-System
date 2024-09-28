import csv
from hmac import new
import json
import pandas as pd
import random
import string
from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime, timedelta


app = Flask(__name__)
CORS(app)


EXPECTED_USER = 'kameron'
EXPECTED_HASH = 'f8e4b9226f1b9cf140a2ca20f0922c1ae13d12ef24a0a537416adf6c8886a873'



@app.route('/login', methods=['POST'])
def log_in():
    data = request.get_json()
    user = data.get('user', '').lower()
    hash = data.get('hash')

    if user == EXPECTED_USER:
        if hash == EXPECTED_HASH:
            return jsonify({'message': 'Logged in successfully'})
        else:
            return jsonify({'message': 'Authentication failed. Invalid password.'}), 401
    else:
        return jsonify({'message': 'Authentication failed. Invalid Username.'}), 401

@app.route('/add', methods=['POST'])
def add_licences():
    def licences():
        charset = string.ascii_uppercase + string.digits
        license_key = ''.join(random.choice(charset) for _ in range(16))
        return license_key

    data = request.get_json()
    name = data.get('name')
    product = data.get('product')
    duration = data.get("duration")

    now = datetime.now()
    creation = now.strftime("%m/%d/%Y")
    new_date = now + timedelta(days=int(duration))
    new_date = new_date.strftime("%m/%d/%Y")
    licence = licences()


    data_to_append = [
        [name, product, licence, None, creation, new_date]
    ]

    file = open("data/data.csv", "a", newline="")
    writer = csv.writer(file)
    writer.writerows(data_to_append)

    file.close()

    return jsonify({'message': 'Licence added successfully'})

@app.route('/remove', methods=['POST'])
def remove_licences():
    data = request.get_json()

    name = data.get('Name')
    product = data.get('Product')
    licence = data.get("Licence")
    creation = data.get("Creation_Date")
    duration = data.get("Duration")


    data_to_remove = {
        'Name': [name],
        'Product': [product],
        'Licence': [licence],
        'Creation_Date': [creation],
        'Duration': [duration]
    }

    df = pd.read_csv("data/data.csv")

    index_to_remove = df[
        (df['Name'] == name) & (df['Product'] == product) & (df['Licence'] == licence)
    ].index

    if not index_to_remove.empty:
        df.drop(index_to_remove, inplace=True)

        df.to_csv("data/data.csv", index=False)

        return jsonify({'message': 'Licence removed successfully'})
    else:
        return jsonify({'message': 'Licence not found'}), 404

@app.route('/show', methods=['GET'])
def display_licences():
    licences = pd.read_csv("data/data.csv")
    licences = licences.astype(str)
    licences.fillna(value="", inplace=True)
    rows = licences.to_dict(orient='records')

    return jsonify({'Licences': rows})

@app.route('/remove_ip', methods=['POST'])
def remove_ip():
    data = request.get_json()
    name = data.get('Name')
    product = data.get('Product')
    licence = data.get("Licence")

    df = pd.read_csv("data/data.csv")


    index_to_remove = df[
        (df['Name'] == name) & (df['Product'] == product) & (df['Licence'] == licence)
    ]

    if not index_to_remove.empty:
        df.loc[index_to_remove.index, 'IP'] = None  # Update the original DataFrame

    df.to_csv("data/data.csv", index=False)

    return jsonify({"status": 200})

@app.route("/auth", methods=['POST'])
def auth():
    data = request.get_json()
    license_key = data.get("license")

    if request.headers.get('X-Forwarded-For'):
        source_ip = request.headers.getlist('X-Forwarded-For')[0]
    else:
        source_ip = request.remote_addr

    df = pd.read_csv("data/data.csv")

    # Ensure the 'IP' column is of type object (string)
    df['IP'] = df['IP'].astype(object)  # Convert to object type if necessary

    # Find the matching rows based on the license key
    matching_row = df[(df["Licence"] == license_key)]


    if not matching_row.empty:
        if pd.isna(matching_row["IP"].iloc[0]):
            df.loc[matching_row.index, 'IP'] = source_ip  # Update the original DataFrame
            df.to_csv("data/data.csv", index=False)
        else:
            verify = df[(df["Licence"] == license_key) & (df["IP"] == source_ip)]
            if verify.empty:
                return jsonify({"Status": 401}), 401

        expiration_date = datetime.strptime(matching_row["Duration"].iloc[0], "%m/%d/%Y")
        current_datetime = datetime.now()

        if current_datetime > expiration_date:
            # License is expired
            return jsonify({"result": "expired"}), 201
        else:
            # Calculate the remaining time until expiration
            remaining_time = expiration_date - current_datetime
            return jsonify({"result": f"{remaining_time.days} day(s) remaining"})
    else:
        # Data is not in the CSV
        return jsonify({"result": "not found"}), 400





if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=5001)
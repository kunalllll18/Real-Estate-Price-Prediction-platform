import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder
import joblib
import os

# Load data
data_path = 'data/csvdata.csv'
df = pd.read_csv(data_path)

# Drop any row with missing values
df = df.dropna()

print("Data Shape:", df.shape)

# Select features and target
# Columns: City, Price, Area, Location, No. of Bedrooms
features = ['Area', 'No. of Bedrooms', 'City']
X = df[features].copy()
y = df['Price']

# Encode City
le = LabelEncoder()
X['City'] = le.fit_transform(X['City'])

# Train test split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Model training
print("Training model...")
model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# Accuracy scores
train_score = model.score(X_train, y_train)
test_score = model.score(X_test, y_test)
print(f"Train R2 Score: {train_score:.4f}")
print(f"Test R2 Score: {test_score:.4f}")

# Save model and encoder
os.makedirs('models', exist_ok=True)
joblib.dump(model, 'models/model.pkl')
joblib.dump(le, 'models/city_encoder.pkl')

print("Model and encoder saved to 'models/' directory.")

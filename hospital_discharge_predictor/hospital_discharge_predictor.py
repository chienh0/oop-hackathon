import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestRegressor
from sklearn.impute import SimpleImputer
import joblib
import os

def train_model(training_data_path):
    # Load the training data
    df = pd.read_csv(training_data_path)
    
    # Prepare features and target
    X = df[['ADMISSION_DIAGNOSIS_CODE', 'AGE', 'PATIENT_SEX']]
    y = df['TOTAL_LOS']
    
    # Split the data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Create preprocessing steps
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', SimpleImputer(strategy='median'), ['AGE']),
            ('cat', OneHotEncoder(handle_unknown='ignore'), ['ADMISSION_DIAGNOSIS_CODE', 'PATIENT_SEX'])
        ])
    
    # Create and train the model
    model = Pipeline([
        ('preprocessor', preprocessor),
        ('regressor', RandomForestRegressor(n_estimators=100, random_state=42))
    ])
    
    model.fit(X_train, y_train)
    
    # Save the model
    joblib.dump(model, 'los_prediction_model.joblib')
    
    print(f"Model R-squared score: {model.score(X_test, y_test):.4f}")

def predict_discharges(current_patients_path, model_path='los_prediction_model.joblib'):
    # Load the current patients data
    current_patients = pd.read_csv(current_patients_path)
    
    # Load the trained model
    if os.path.exists(model_path):
        model = joblib.load(model_path)
    else:
        print("Model not found. Please train the model first.")
        return
    
    # Prepare the features
    X_current = current_patients[['DIAGNOSIS_CODES', 'AGE', 'PATIENT_SEX']]
    
    # Extract the first diagnosis code for each patient
    X_current['ADMISSION_DIAGNOSIS_CODE'] = X_current['DIAGNOSIS_CODES'].apply(lambda x: x.strip('[]').split('|')[0])
    
    # Select relevant columns
    X_current = X_current[['ADMISSION_DIAGNOSIS_CODE', 'AGE', 'PATIENT_SEX']]
    
    # Predict length of stay
    predicted_los = model.predict(X_current)
    
    # Calculate probability of discharge (simplified approach)
    # Assuming an exponential distribution of length of stay
    prob_discharge = 1 - np.exp(-1/predicted_los)
    
    # Add predictions to the current patients dataframe
    current_patients['PREDICTED_LOS'] = predicted_los
    current_patients['PROBABILITY_OF_DISCHARGE'] = prob_discharge
    
    # Save results
    current_patients.to_csv('discharge_predictions.csv', index=False)
    print("Discharge predictions saved to 'discharge_predictions.csv'")

if __name__ == "__main__":
    training_data_path = 'training_data.csv'
    current_patients_path = 'current_patients.csv'
    
    # Train the model if it doesn't exist
    if not os.path.exists('los_prediction_model.joblib'):
        print("Training the model...")
        train_model(training_data_path)
    
    # Predict discharges for current patients
    predict_discharges(current_patients_path)
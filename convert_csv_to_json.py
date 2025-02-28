import pandas as pd

# Load CSV
data = pd.read_csv("Data/processed_data.csv")

# Convert to JSON
data.to_json("Data/preprocessed_data.json", orient="records")

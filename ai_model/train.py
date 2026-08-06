from model import train_and_save_model

if __name__ == "__main__":
    model, metrics = train_and_save_model()
    print("Training complete")
    print(metrics)

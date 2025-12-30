from sklearn.metrics import classification_report, confusion_matrix, precision_recall_curve, auc

def evaluate_model(y_true, y_pred, y_probs=None):
    print(classification_report(y_true, y_pred))
    cm = confusion_matrix(y_true, y_pred)
    print("Confusion Matrix:\n", cm)
    
    if y_probs is not None:
        precision, recall, _ = precision_recall_curve(y_true, y_probs)
        pr_auc = auc(recall, precision)
        print(f"PR AUC: {pr_auc:.4f}")

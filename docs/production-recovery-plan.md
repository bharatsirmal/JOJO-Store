# JOJO Store - Production Backup and Recovery Plan

## Backup Strategy
- **Cloud Firestore**: Automated daily exports to a dedicated Google Cloud Storage backup bucket using GCP Scheduled Functions or native Firestore scheduled backups.
- **Firebase Storage**: Object versioning should be enabled on the production Cloud Storage bucket to prevent accidental overwrite/deletion of product images.
- **Source Code**: Version controlled via GitHub. Secrets securely stored in Vercel.

## Recovery Procedure
1. In the event of catastrophic data loss, a Firestore import job must be triggered using \`gcloud firestore import\`.
2. Vercel environment variables should be restored from a secure local password manager vault.
3. If an erroneous deployment causes a critical bug (e.g., checkout failure), use the **Rollback Plan**.

## Access Control
- Backups must be strictly limited to the \`Owner\` role in the Google Cloud Platform. 
- Restores should only be performed after explicit authorization.


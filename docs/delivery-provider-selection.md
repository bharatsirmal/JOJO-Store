# Delivery Strategy and Provider Selection

## Delivery Model Options
- **Model A**: Third-party courier integration (e.g., Shiprocket, Delhivery).
- **Model B**: Own delivery staff using the \/delivery\ portal.
- **Model C**: Hybrid approach.

## Selected Strategy
*Pending User Confirmation.*
For now, we will implement **Model B (Internal Delivery Staff)** using the \/delivery\ portal and Firebase status tracking, while building the generic \CourierAdapter\ interface so a third-party API can be easily plugged in later without breaking the architecture.

## Blockers
- We need the user to explicitly approve which third-party courier they want to use (if any) and provide sandbox credentials before we can implement the actual HTTP API integration for Step 7.7.

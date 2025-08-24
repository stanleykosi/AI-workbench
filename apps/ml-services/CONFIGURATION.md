# Modal Inference Endpoint Configuration

This document explains how to configure the hybrid scaling behavior for the Modal inference endpoints.

## 🔐 **Authentication Modes**

The system automatically detects your deployment environment:

### **Development Mode (Default):**
- **No `MODAL_TOKEN`** set
- **Uses web authentication** (`modal auth`)
- **Suitable for** local development and testing
- **Console output**: `🔧 Development mode: Using web authentication`

### **Production Mode:**
- **`MODAL_TOKEN_ID` and `MODAL_TOKEN_SECRET`** environment variables set
- **Uses token ID and secret authentication**
- **Required for** containerized deployments
- **Console output**: `🚀 Production mode: Using Modal token ID and secret`

## 🚀 **Hybrid Scaling Strategy**

The inference endpoint uses a **hybrid approach** that automatically adjusts container warm-up times based on recent activity:

### **Base Configuration:**
- **Base Warm Time**: Default 15 minutes (900 seconds)
- **Extension Time**: Default 15 minutes (900 seconds) when there's recent activity
- **Activity Window**: Default 5 minutes (300 seconds) to detect recent activity

### **Scaling Behavior:**
```
No Recent Activity → scaledown_window = base_warm_time (15 min)
Recent Activity    → scaledown_window = base_warm_time + extension_time (30 min)
```

## ⚙️ **Environment Variables**

Copy `env_template.txt` to `.env` and customize these values:

| Variable | Default | Description |
|----------|---------|-------------|
| `MODAL_TOKEN_ID` | `None` | **Required for production** - Modal token ID |
| `MODAL_TOKEN_SECRET` | `None` | **Required for production** - Modal token secret |
| `MODAL_BASE_WARM_TIME` | `900` | Base warm time in seconds (15 min) |
| `MODAL_EXTENSION_TIME` | `900` | Extension time when active (15 min) |
| `MODAL_MAX_CONTAINERS` | `10` | Maximum concurrent containers |
| `MODAL_ACTIVITY_WINDOW` | `300` | Activity detection window (5 min) |

## 📊 **Example Configurations**

### **Conservative (Cost-Optimized):**
```bash
MODAL_BASE_WARM_TIME=600      # 10 minutes
MODAL_EXTENSION_TIME=600       # 10 minutes
MODAL_ACTIVITY_WINDOW=300     # 5 minutes
```

### **Balanced (Recommended):**
```bash
MODAL_BASE_WARM_TIME=900      # 15 minutes
MODAL_EXTENSION_TIME=900       # 15 minutes
MODAL_ACTIVITY_WINDOW=300     # 5 minutes
```

### **Performance-Optimized:**
```bash
MODAL_BASE_WARM_TIME=1800     # 30 minutes
MODAL_EXTENSION_TIME=1800      # 30 minutes
MODAL_ACTIVITY_WINDOW=600     # 10 minutes
```

## 🔍 **Monitoring Scaling Behavior**

Use the `/health` endpoint to monitor current scaling:

```bash
curl https://your-modal-endpoint.modal.run/health
```

Response includes:
- Current scaledown window
- Activity statistics
- Cached models
- Configuration values

## 💡 **How It Works**

1. **Request arrives** → Activity tracked for experiment
2. **Container scaling** → Based on recent activity patterns
3. **Smart warm-up** → Longer warm time for active models
4. **Efficient cleanup** → Shorter warm time for inactive models

## ⚠️ **Important Notes**

- **Activity tracking** is per-experiment, not global
- **Extension time** only applies when there's recent activity
- **Max containers** limit concurrent processing (not total requests)
- **Environment changes** require redeployment to take effect

## 🚀 **Deployment**

After updating `.env`, redeploy the endpoint:

```bash
modal deploy apps/ml-services/endpoints/inference_api.py
```

The new configuration will be applied automatically.

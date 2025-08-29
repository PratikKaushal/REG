# Quick Setup Guide 🚀

## Prerequisites Checklist
- [ ] Python 3.8 or higher installed
- [ ] Node.js 14 or higher installed  
- [ ] MongoDB installed and running
- [ ] Git installed (for cloning the repo)

## Step 1: Clone the Repository
```bash
git clone <your-repository-url>
cd task-manager
```

## Step 2: Backend Setup (Terminal 1)
```bash
# Navigate to backend
cd backend

# Install Python packages
pip install -r requirements.txt

# Start MongoDB (if not already running)
# Windows (Run as Administrator):
net start MongoDB

# Mac/Linux:
sudo systemctl start mongod

# Run the Flask server
python app.py
```
✅ Backend should be running on http://localhost:5000

## Step 3: Frontend Setup (Terminal 2)
```bash
# Navigate to frontend (from project root)
cd frontend

# Install Node packages
npm install

# Start React development server
npm start
```
✅ Frontend should open automatically at http://localhost:3000

## Step 4: Test the Application
1. Open http://localhost:3000 in your browser
2. Click "Register here" to create a new account
3. Login with your credentials
4. Start creating tasks!

## Common Issues & Solutions

### MongoDB Connection Error
```
Error: localhost:27017: [WinError 10061] No connection could be made...
```
**Solution**: Make sure MongoDB is running
- Windows: `net start MongoDB` (as Administrator)
- Mac: `brew services start mongodb-community`
- Linux: `sudo systemctl start mongod`

### Port Already in Use
```
Error: Port 5000/3000 is already in use
```
**Solution**: 
- Kill the process using the port, or
- Change the port in the respective file:
  - Backend: `app.py` - change `port=5000`
  - Frontend: Add `PORT=3001` to `.env` file

### Module Not Found Errors
**Solution**: Make sure you've run:
- `pip install -r requirements.txt` in backend
- `npm install` in frontend

## Quick Commands Reference

### Backend Commands
```bash
cd backend
python app.py                    # Start backend server
pip install -r requirements.txt  # Install dependencies
```

### Frontend Commands
```bash
cd frontend
npm start          # Start development server
npm run build      # Create production build
npm install        # Install dependencies
```

### MongoDB Commands
```bash
mongosh                          # Open MongoDB shell
use task_manager                 # Select database
db.users.find()                 # View all users
db.tasks.find()                 # View all tasks
```

## Environment Variables (Optional)
Create `.env` file in backend directory:
```env
SECRET_KEY=your-secret-key-here
MONGODB_URI=mongodb://localhost:27017/
DATABASE_NAME=task_manager
```

## Verification Checklist
- [ ] MongoDB is running
- [ ] Backend server is running on port 5000
- [ ] Frontend is running on port 3000
- [ ] Can access http://localhost:3000
- [ ] Can register a new user
- [ ] Can login and create tasks

## Need Help?
- Check the main README.md for detailed documentation
- Ensure all prerequisites are installed
- Check that all services are running
- Review error messages in terminal windows

---
Happy Task Managing! 📋✨
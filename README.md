# Task Manager Application 📋

A modern, full-stack task management web application with user authentication, task scheduling, and category organization. Built with React, Flask, and MongoDB.

![Task Manager](frontend/ui.jpg)

## ✨ Features

### Core Functionality
- **User Authentication**: Secure registration and login system with token-based authentication
- **Task Management**: Create, read, update, and delete tasks
- **Task Scheduling**: Set due dates and specific times for tasks
- **Category Organization**: Organize tasks into categories (General, Marketing, Meeting, Production, Design, Development)
- **Task Status**: Mark tasks as completed or pending
- **Overdue Detection**: Automatic detection and highlighting of overdue tasks

### User Interface
- **Modern Design**: Clean, professional UI with smooth animations
- **Responsive Layout**: Works seamlessly on desktop, tablet, and mobile devices
- **Category Color Coding**: Visual differentiation of task categories
- **Interactive Elements**: Hover effects, smooth transitions, and intuitive controls
- **Real-time Updates**: Instant UI updates when tasks are modified

## 🛠️ Technology Stack

### Frontend
- **React 18**: Modern React with hooks
- **Axios**: HTTP client for API communication
- **CSS3**: Custom styling with responsive design
- **Poppins Font**: Clean, modern typography

### Backend
- **Flask**: Python web framework
- **Flask-CORS**: Cross-origin resource sharing
- **PyMongo**: MongoDB driver for Python
- **JWT-style tokens**: Secure authentication

### Database
- **MongoDB**: NoSQL database for scalable data storage
- **Collections**: Users, Tasks, Sessions

## 📁 Project Structure

```
task-manager/
├── backend/
│   ├── app.py                 # Flask application with all API endpoints
│   ├── requirements.txt       # Python dependencies
│   └── data/                  # MongoDB data directory (auto-created)
│
├── frontend/
│   ├── public/
│   │   ├── index.html        # HTML template
│   │   └── favicon.ico       # App icon
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.js      # Login form component
│   │   │   ├── Register.js   # Registration form component
│   │   │   ├── TaskForm.js   # Task creation/editing form
│   │   │   ├── TaskList.js   # Task list container
│   │   │   └── TaskItem.js   # Individual task component
│   │   ├── App.js            # Main application component
│   │   ├── App.css           # Application styles
│   │   ├── index.js          # React entry point
│   │   └── index.css         # Global styles
│   └── package.json          # Node.js dependencies
│
├── .gitignore               # Git ignore rules
└── README.md               # Project documentation
```

## 🚀 Installation & Setup

### Prerequisites
- Python 3.8+
- Node.js 14+
- MongoDB 4.4+
- npm or yarn package manager

### Backend Setup

1. **Navigate to backend directory**:
```bash
cd backend
```

2. **Create virtual environment** (optional but recommended):
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install Python dependencies**:
```bash
pip install -r requirements.txt
```

4. **Start MongoDB service**:
- **Windows**: `net start MongoDB` (as Administrator)
- **Mac**: `brew services start mongodb-community`
- **Linux**: `sudo systemctl start mongod`

5. **Run the Flask server**:
```bash
python app.py
```
The backend will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory**:
```bash
cd frontend
```

2. **Install Node dependencies**:
```bash
npm install
```

3. **Start the React development server**:
```bash
npm start
```
The frontend will run on `http://localhost:3000`

## 📝 API Documentation

### Authentication Endpoints

#### Register User
- **POST** `/api/register`
- **Body**: `{ username, email, password }`
- **Response**: Success message or error

#### Login User
- **POST** `/api/login`
- **Body**: `{ username, password }`
- **Response**: `{ token, username, email }`

#### Logout User
- **POST** `/api/logout`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Success message

### Task Endpoints

#### Get All Tasks
- **GET** `/api/tasks`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Array of user's tasks

#### Create Task
- **POST** `/api/tasks`
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ title, description, due_date, due_time, category }`
- **Response**: Created task object

#### Update Task
- **PUT** `/api/tasks/<task_id>`
- **Headers**: `Authorization: Bearer <token>`
- **Body**: Fields to update
- **Response**: Updated task object

#### Delete Task
- **DELETE** `/api/tasks/<task_id>`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Success message

## 🎨 Features in Detail

### Task Categories
- **General**: Default category for miscellaneous tasks
- **Marketing**: Marketing and promotional activities
- **Meeting**: Meetings and appointments
- **Production**: Production and manufacturing tasks
- **Design**: Design and creative work
- **Development**: Software development tasks

### Task Fields
- **Title**: Required task name
- **Description**: Optional detailed description
- **Due Date**: Optional deadline date
- **Due Time**: Optional specific time
- **Category**: Task classification
- **Status**: Completed or pending

### Security Features
- Password hashing using SHA-256
- Token-based authentication
- Session expiry (24 hours)
- Protected API endpoints
- CORS configuration for security

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the backend directory:
```env
SECRET_KEY=your-secret-key-here
MONGODB_URI=mongodb://localhost:27017/
DATABASE_NAME=task_manager
```

### MongoDB Connection
Default connection: `mongodb://localhost:27017/`
Database name: `task_manager`

## 📱 Responsive Design

The application is fully responsive with breakpoints at:
- Desktop: 1024px+
- Tablet: 768px - 1023px
- Mobile: < 768px

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- LinkedIn: [Your LinkedIn](https://linkedin.com/in/yourusername)

## 🙏 Acknowledgments

- React documentation
- Flask documentation
- MongoDB documentation
- UI design inspiration from modern task management apps

## 📊 Project Status

Current Version: 1.0.0
Status: Active Development

## 🐛 Known Issues

- None currently reported

## 🚧 Future Enhancements

- [ ] Email notifications for overdue tasks
- [ ] Task sharing between users
- [ ] Task attachments
- [ ] Recurring tasks
- [ ] Dark mode theme
- [ ] Export tasks to CSV/PDF
- [ ] Mobile app version
- [ ] Real-time collaboration
- [ ] Calendar view
- [ ] Task priorities

---

**Built with ❤️ using React, Flask, and MongoDB**
from models import db
from models.user import User
from models.task import Task
from models.category import Category
from flask import Flask, request, session, jsonify, make_response
from flask_cors import CORS
from flask_migrate import Migrate
from flask_restful import Api, Resource
import os
import functools
from dotenv import load_dotenv
#load environment variables
load_dotenv()

app=Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI']=os.getenv('database_url')  #store the database url in .env
app.config['SQLALCHEMY_TRACK_MODIFICATIONS']=False
app.config['JSONIFY_PRETTYPRINT_REGULAR'] = True

migrate=Migrate(app, db)
app.secret_key=os.getenv('SECRET_KEY')
CORS(
    app,
    resources={
        r"/*": {
            "origins": ["https://taskhub-gwdw.onrender.com"],  #Should match your frontend URL
            "methods": ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
            "expose_headers": ["Authorization"],
            "supports_credentials": True
        }
    },
    supports_credentials=True)
db.init_app(app)
api=Api(app)



# Local development configuration
app.config['SESSION_COOKIE_SECURE'] = True  # Set to True on production
app.config['SESSION_COOKIE_HTTPONLY'] = True  # Prevent JavaScript access
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'  # CSRF protection

class UserResource(Resource):
    def post(self):
        data=request.get_json()
        name=data.get('name')
        email=data.get('email')
        password=data.get('password')
        return User.add_user(name, email, password)

    def get(self):
        return User.get_users()

api.add_resource(UserResource, '/users')

class SingleUser(Resource):
    def get(self, id):
        return User.get_user(id)

    def patch(self, id):
        data=request.get_json()
        name=data.get('name')
        password=data.get('password')
        return User.update_user(id, name, password)

    def delete(self, id):
        return User.delete_user(id)

api.add_resource(SingleUser, '/user/<int:id>')

@app.route('/login', methods=['POST'])
def login():
    data=request.get_json()
    email=data.get('email')
    password=data.get('password')

    if not email or not password:
        return {
            'error':'Email and password are required'
        }, 400

    user=User.query.filter_by(email=email).first()
    if not user:
        return {
            'error':'Invalid credentials'
        }, 401
    if not user.check_password(password):
        return {
            'error':'Invalid credentials'
        }, 401

    session['user_id']=user.id
    return user.to_dict(), 200

@app.route('/check_session', methods=['GET'])
def check_session():
    user=User.query.filter(User.id==session.get('user_id')).first()
    if user:
        return user.to_dict(),200
    else:
        return {
            'msg':'401: Not Authorized'
        }, 401

@app.route('/logout', methods=['DELETE'])
def logout():
    session['user_id']=None
    return {
        'msg':'204: No Content'
    }, 204

def login_required(f):
    @functools.wraps(f)
    def decorated_function(*args, **kwargs):
        user_id=session.get('user_id')
        if not user_id:
            return {
                'error':'Unauthorized'
            }, 401

        user=db.session.execute(db.select(User).filter_by(id=user_id)).scalar_one_or_none()
        if not user:
            return {
                'error':'Unauthorized'
            }, 401
        kwargs['current_user']=user
        return f(*args, **kwargs)
    return decorated_function

class TaskResource(Resource):
    @login_required
    def post(self, current_user):
        data=request.get_json()
        task=data.get('task')
        date=data.get('date')
        time=data.get('time')
        category_id=data.get('category_id')
        return Task.add_task(task, date, time, category_id, current_user.id)

    @login_required
    def get(self, current_user):
        return Task.get_tasks(current_user.id)

api.add_resource(TaskResource, '/tasks')

class SingleTask(Resource):
    @login_required
    def get(self, id, current_user):
        return Task.get_task(id, current_user.id)

    @login_required
    def patch(self, id, current_user):
        data=request.get_json()
        updated_task=data.get('updated_task')
        updated_date=data.get('updated_date')
        updated_time=data.get('updated_time')
        updated_category=data.get('updated_category')
        is_complete=data.get('is_complete')
        return Task.update_task(id, current_user.id, updated_task, updated_date, updated_time, updated_category, is_complete)

    @login_required
    def delete(self, id, current_user):
        task=Task.query.filter(Task.id==id, Task.user_id==current_user.id).first()
        if not task:
            return make_response(jsonify({
                'error':f'Task {id} not found or does not belong to the current user'
            }), 404)
        return Task.delete_task(id, user_id=current_user.id)

api.add_resource(SingleTask, '/task/<int:id>')


class CategoryResource(Resource):
    @login_required
    def post(self, current_user):
        data=request.get_json()
        name=data.get('name')
        return Category.add_category(name, current_user.id)

    @login_required
    def get(self, current_user):
        return Category.get_categories(current_user.id)

api.add_resource(CategoryResource, '/categories')

class SingleCategory(Resource):
    @login_required
    def get(self, id, current_user):
        return Category.get_category(id, current_user.id)

    @login_required
    def patch(self, id, current_user):
        data=request.get_json()
        updated_name=data.get('updated_name')
        return Category.update_category(id, updated_name, current_user.id)

    @login_required
    def delete(self, id, current_user):
        return Category.delete_category(id, current_user.id) 

api.add_resource(SingleCategory, '/category/<int:id>')

if __name__=='__main__':
    port=int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)


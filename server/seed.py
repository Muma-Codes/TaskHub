from models import db
from app import app
from models.category import Category
from models.user import User
from models.task import Task
with app.app_context():
    Category.query.delete()
    db.session.commit()

    User.query.delete()
    db.session.commit()

    Task.query.delete()
    db.session.commit()

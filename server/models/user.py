from . import db
from .category import Category
from sqlalchemy_serializer import SerializerMixin
from sqlalchemy.orm import Mapped, mapped_column, validates, relationship
from sqlalchemy import String, Integer, Boolean, Date, Index
from datetime import date, datetime
from werkzeug.security import generate_password_hash, check_password_hash
from flask import jsonify, make_response
from typing import List
from bleach import clean
class User(db.Model, SerializerMixin):
    __tablename__='users'

    serialize_rules=('-tasks.user', '-categories.user', '-tasks.category', '-categories.tasks',)

    id: Mapped[int]=mapped_column(Integer, primary_key=True)
    name: Mapped[str]=mapped_column(String(100), nullable=False)
    email: Mapped[str]=mapped_column(String(255), nullable=False, unique=True)
    password: Mapped[str]=mapped_column(String(255), nullable=False)
    created_at: Mapped[date]=mapped_column(Date, default=datetime.utcnow)

    tasks: Mapped[List['Task']]=relationship('Task', back_populates='user', cascade='all, delete-orphan')
    categories: Mapped[List['Category']]=relationship('Category', back_populates='user', cascade='all, delete-orphan')

    __table_args__=(
        Index('idx_user_email', 'email'), #for login and email uniqueness checks
        Index('idx_user_name', 'name'), #for searching users by name
    )

    def __repr__(self):
        return f"<User {self.id}: {self.name}>"

    @validates('name')
    def validate_name(self, key, name):
        if len(name) < 3:
            raise ValueError('Name must be at least 3 characters long')
        return name

    @validates('email')
    def validate_email(self, key, email):
        email=clean(email)
        if '@' not in email:
            raise ValueError('Please enter a valid email address. The email must contain the "@" symbol')
        return email

    @validates('password')
    def validate_password(self, key, password):
        if len(password) < 8:
            raise ValueError('Password must be at least 8 characters long to ensure security')
        return password
    
    @property
    def password_hash(self):
        raise AttributeError('Password hash is not readable')

    @password_hash.setter
    def password_hash(self, password):
        self.password=generate_password_hash(password, method='pbkdf2:sha256', salt_length=16)

    def check_password(self, password):
        return check_password_hash(self.password, password)

    @classmethod
    def add_user(cls, name, email, password):
        user=cls.query.filter(cls.email==email).first()
        if user:
            response_body={
                'msg': 'User already exists'
            }
            status_code=409

        else:
            new_user=cls(
                name=name,
                email=email,
                password=generate_password_hash(password)
            )
            db.session.add(new_user)
            db.session.commit()

            #create default categories after user creation
            default_categories=['Work', 'Personal', 'Shopping', 'Health']
            for category_name in default_categories:
                Category.add_category(category_name, new_user.id)

            response_body=new_user.to_dict()
            status_code=201

        return make_response(jsonify(response_body), status_code)

    @classmethod
    def delete_user(cls, id):
        user=cls.query.filter_by(id=id).first()
        if user:
            db.session.delete(user)
            db.session.commit()

            response_body={
                'msg':'User deleted successfully'
            }
            status_code=200

        else:
            response_body={
                'error':f'User with id {id} not found'
            }
            status_code=404
        
        return make_response(jsonify(response_body), status_code)

    @classmethod
    def update_user(cls, id, new_name=None, new_password=None):
        user=cls.query.filter(cls.id==id).first()
        if user is None:
            response_body={
                'error':f'User with id {id} does not exist'
            }
            status_code=404
        else:
            if new_name is not None:
                user.name=new_name
            if new_password is not None:
                user.password=generate_password_hash(new_password)
            db.session.commit()

            response_body={
                'msg':f'User {id} has been updated successfully'
            }
            status_code=200
        return make_response(jsonify(response_body), status_code)

    @classmethod
    def get_user(cls, id):
        user=cls.query.filter(cls.id==id).first()
        if user is None:
            response_body={
                'error':f'User {id} has not been found'
            }
            status_code=404
        else:
            response_body={
                'name':user.name,
                'email':user.email
            }
            status_code=200

        return make_response(jsonify(response_body), status_code)

    @classmethod
    def get_users(cls):
        users=[]
        for user in cls.query.all():
            user_dict=user.to_dict()
            users.append(user_dict)

        return jsonify(users), 200


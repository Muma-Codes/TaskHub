from . import db
from sqlalchemy.orm import Mapped, mapped_column, relationship, validates
from sqlalchemy_serializer import SerializerMixin
from sqlalchemy import Integer, String, Date, ForeignKey, Index
from datetime import date, datetime
from flask import make_response, jsonify
from typing import List
class Category(db.Model, SerializerMixin):
    __tablename__='categories'

    serialize_rules=('-user.categories', '-user.tasks', '-tasks.category', '-tasks.user',)
    id: Mapped[int]=mapped_column(Integer, primary_key=True)
    name: Mapped[str]=mapped_column(String(100), nullable=False)
    created_by: Mapped[int]=mapped_column(Integer, ForeignKey('users.id'), nullable=False)
    created_at: Mapped[date]=mapped_column(Date, default=datetime.utcnow)

    user: Mapped['User']=relationship('User', back_populates='categories')
    tasks: Mapped[List['Task']]=relationship('Task', back_populates='category', cascade='all, delete-orphan')

    __table_args__=(
        Index('idx_category_created_by', 'created_by'), #for filtering categories by user
        Index('idx_category_name_created_by', 'name', 'created_by'), #for searching categories by name for a specific user
    )

    def __repr__(self):
        return f"<Category {self.id}: {self.name}>"

    @validates('name')
    def validate_name(self, key, name):
        if name is None:
            raise ValueError('Category name cannot be empty')
        return name

    @classmethod
    def add_category(cls, name, created_by):
        category=cls.query.filter(cls.name==name, cls.created_by==created_by).first()
        if category:
            response_body={
                'error':'You already have a category with this name'
            }
            status_code=409
        else:
            new_category=cls(
                name=name,
                created_by=created_by
            )
            db.session.add(new_category)
            db.session.commit()

            response_body={
                'msg':'Category created successfully',
                'id':new_category.id,
                'name':new_category.name
            }
            status_code=201

        return make_response(jsonify(response_body), status_code)

    @classmethod
    def delete_category(cls, id, created_by):
        category=cls.query.filter(cls.id==id, cls.created_by==created_by).first()
        if category is None:
            response_body={
                'error':f'Category {id} does not exist or does not belong to you'
            }
            status_code=404
        else:
            db.session.delete(category)
            db.session.commit()

            response_body={
                'msg':f'Category "{category.name}" deleted successfully'
            }
            status_code=200

        return make_response(jsonify(response_body), status_code)

    @classmethod
    def update_category(cls, id, updated_name, created_by):
        category=cls.query.filter(cls.id==id, cls.created_by==created_by).first()
        if category is None:
            response_body={
                'error':f'Category {id} does not exist or does not belong to you'
            }
            status_code=404
        else:
            updated_category_name_check=cls.query.filter_by(name=updated_name, created_by=created_by).first()
            if updated_category_name_check:
                response_body={
                    'error':'You already have a category with this name'
                    }
                status_code=409
            else:
                category.name=updated_name
                db.session.commit()

                response_body={
                    'msg':'Category name updated successfully',
                    'name':updated_name,
                    'id':id
                }
                status_code=200
        return make_response(jsonify(response_body), status_code)

    @classmethod
    def get_category(cls, id, created_by):
        category=cls.query.filter_by(id=id, created_by=created_by).first()
        if category is None:
            response_body={
                'error':f'Category {id} does not exist or does not belong to you'
            }
            status_code=404
        else:
            response_body=category.to_dict()
            status_code=200

        return make_response(jsonify(response_body), status_code)

    @classmethod
    def get_categories(cls, created_by):
        categories=[]
        for category in cls.query.filter_by(created_by=created_by).all():
            category_dict=category.to_dict()
            categories.append(category_dict)

        return make_response(jsonify(categories), 200)




# User to be able to create their accounts, login... 
# after logging_in, they see the ui of the app, where they will be required to add tasks. 
# The tasks have a name, date they are to be undertaken, category they belong to
# There are categories that appear automatically on each users accounts upon creation and logging into their accounts
# Users can create/delete/update/view categories and these categories will only be visible to them, they also can add/view/update/delete their own tasks
# They can log out and also they can delete their accounts
